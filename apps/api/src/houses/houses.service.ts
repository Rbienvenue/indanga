import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { BookingStatus, Prisma, type KycStatus, type UserRole } from "@indanga/db";
import { PrismaService, type PrismaTx } from "src/prisma/prisma.service";
import {
  CreateHouseDto,
  CreateReviewDto,
  FavoriteFilterDto,
  FilterDto,
  RoomTypeInputDto,
  UpdateHouseDto,
} from "./dtos";
import { getBookingKind } from "./booking-kind.util";

function isHotelProperty(propertyType?: string | null): boolean {
  return getBookingKind(propertyType) === "hotel";
}

/** Rooms booked for a room type overlapping [checkIn, checkOut). Date-based inventory. */
export async function countOverlappingRooms(
  db: PrismaTx,
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date,
) {
  const bookings = await db.booking.findMany({
    where: {
      roomTypeId,
      status: BookingStatus.APPROVED,
      OR: [{ checkIn: null }, { checkIn: { lt: checkOut } }],
      AND: [{ OR: [{ checkOut: null }, { checkOut: { gt: checkIn } }] }],
    },
    select: { roomCount: true },
  });
  return bookings.reduce((sum, b) => sum + (b.roomCount ?? 1), 0);
}

@Injectable()
export class HousesService {
  constructor(private readonly db: PrismaService) {}

  async createHouse(ownerId: string, role: UserRole, kycStatus: KycStatus, data: CreateHouseDto) {
    this.assertVerified(role, kycStatus);
    const {
      province,
      district,
      sector,
      cell,
      village,
      ownerId: _ownerId,
      rooms,
      ...rest
    } = data as CreateHouseDto & {
      ownerId?: string;
    };

    this.assertRoomsAndPrice(data.propertyType, data.price, rooms);

    const house = await this.db.house.create({
      data: {
        ...rest,
        ownerId,
        bedrooms: data.bedrooms ?? 0,
        bathrooms: data.bathrooms ?? 0,
        location: `${province}, ${district}, ${sector}, ${cell} ${village}`,
        ...(rooms && rooms.length > 0
          ? {
              rooms: {
                create: rooms.map((room) => ({
                  name: room.name,
                  price: room.price,
                  totalRooms: room.totalRooms,
                })),
              },
            }
          : {}),
      },
      include: { rooms: true },
    });
    return house;
  }

  private assertRoomsAndPrice(
    propertyType: string,
    price: number | undefined,
    rooms: RoomTypeInputDto[] | undefined,
  ) {
    if (isHotelProperty(propertyType)) {
      if (!rooms || rooms.length === 0) {
        throw new BadRequestException("Hotels must define at least one room type");
      }
      return;
    }
    if (price === undefined || price === null) {
      throw new BadRequestException("Price is required for this property type");
    }
  }

  async getHouses(data: FilterDto) {
    const {
      search,
      ownerId,
      status,
      location,
      propertyType,
      subType,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
    } = data;
    const where: Prisma.HouseWhereInput = {};

    if (search) where.name = { startsWith: search, mode: "insensitive" };
    if (ownerId) where.ownerId = ownerId;
    if (subType) {
      where.subType = { equals: subType, mode: "insensitive" };
    }
    if (status) {
      where.status = status;
    } else if (!ownerId) {
      where.status = "AVAILABLE";
    }
    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }
    if (propertyType) {
      const normalizedPropertyTypes = propertyType
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      if (normalizedPropertyTypes.length > 1) {
        where.OR = normalizedPropertyTypes.map((value) => ({
          propertyType: { equals: value, mode: "insensitive" },
        }));
      } else if (normalizedPropertyTypes.length === 1) {
        where.propertyType = {
          equals: normalizedPropertyTypes[0],
          mode: "insensitive",
        };
      }
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceRange = {
        gte: minPrice,
        lte: maxPrice,
      };
      // Match either the base price or any room price so null-priced hotels still filter.
      where.AND = [
        {
          OR: [{ price: priceRange }, { rooms: { some: { price: priceRange } } }],
        },
      ];
    }

    const [houses, total] = await Promise.all([
      this.db.house.findMany({
        where,
        include: { rooms: true },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.db.house.count({ where }),
    ]);

    return {
      data: houses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getHouseById(id: string) {
    const house = await this.db.house.findUnique({ where: { id }, include: { rooms: true } });
    if (!house) {
      throw new NotFoundException("Property not found");
    }
    return house;
  }

  async getRoomAvailability(houseId: string, roomTypeId?: string, checkIn?: string, checkOut?: string) {
    await this.getHouseById(houseId);
    const rooms = await this.db.roomType.findMany({
      where: { houseId, ...(roomTypeId ? { id: roomTypeId } : {}) },
      orderBy: { price: "asc" },
    });
    if (roomTypeId && rooms.length === 0) {
      throw new NotFoundException("Room type not found for this property");
    }

    let checkInDate: Date | undefined;
    let checkOutDate: Date | undefined;
    if (checkIn || checkOut) {
      if (!checkIn || !checkOut) {
        throw new BadRequestException("Both check-in and check-out dates are required");
      }
      checkInDate = new Date(checkIn);
      checkOutDate = new Date(checkOut);
      if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
        throw new BadRequestException("Invalid check-in or check-out date");
      }
    }

    const availability = await Promise.all(
      rooms.map(async (room) => {
        const booked =
          checkInDate && checkOutDate
            ? await countOverlappingRooms(this.db, room.id, checkInDate, checkOutDate)
            : 0;
        return {
          roomType: room,
          totalRooms: room.totalRooms,
          bookedRooms: booked,
          availableRooms: Math.max(room.totalRooms - booked, 0),
        };
      }),
    );
    return availability;
  }

  async updateHouse(
    id: string,
    userId: string,
    role: UserRole,
    kycStatus: KycStatus,
    data: UpdateHouseDto,
  ) {
    const house = await this.getHouseById(id);
    this.assertVerified(role, kycStatus);
    this.isAllowed(house.ownerId, userId, role);

    const {
      province,
      district,
      sector,
      cell,
      village,
      existingMedia,
      ownerId: _ownerId,
      rooms,
      ...rest
    } = data as UpdateHouseDto & {
      ownerId?: string;
    };

    const effectiveType = data.propertyType ?? house.propertyType;
    const effectivePrice = data.price ?? house.price ?? undefined;
    if (rooms !== undefined || data.propertyType !== undefined || data.price !== undefined) {
      this.assertRoomsAndPrice(effectiveType, effectivePrice, rooms ?? house.rooms);
    }

    const updateData: Prisma.HouseUpdateInput = { ...rest };

    if (existingMedia !== undefined || rest.media !== undefined) {
      updateData.media = [...(existingMedia ?? house.media), ...(rest.media ?? [])];
    }

    if (
      province !== undefined ||
      district !== undefined ||
      sector !== undefined ||
      cell !== undefined ||
      village !== undefined
    ) {
      updateData.location = `${province}, ${district}, ${sector}, ${cell} ${village}`;
    }

    const updatedHouse = await this.db.$transaction(async (tx) => {
      if (rooms !== undefined) {
        await this.syncRooms(tx, id, rooms);
      }
      return tx.house.update({
        where: { id },
        data: updateData,
        include: { rooms: true },
      });
    });
    return updatedHouse;
  }

  /** Diff incoming rooms against stored ones with guards for active bookings. */
  private async syncRooms(tx: PrismaTx, houseId: string, rooms: RoomTypeInputDto[]) {
    const existing = await tx.roomType.findMany({ where: { houseId } });
    const existingIds = new Set(existing.map((r) => r.id));
    const incomingIds = new Set(rooms.filter((r) => r.id).map((r) => r.id as string));

    for (const room of rooms) {
      if (!room.id) {
        await tx.roomType.create({
          data: { houseId, name: room.name, price: room.price, totalRooms: room.totalRooms },
        });
        continue;
      }
      if (!existingIds.has(room.id)) {
        throw new BadRequestException("Unknown room type id");
      }
      const current = existing.find((r) => r.id === room.id)!;
      if (room.totalRooms < current.totalRooms) {
        const active = await this.countActiveRoomBookings(tx, room.id);
        if (room.totalRooms < active) {
          throw new ConflictException(
            `Cannot reduce rooms below ${active} currently booked`,
          );
        }
      }
      await tx.roomType.update({
        where: { id: room.id },
        data: { name: room.name, price: room.price, totalRooms: room.totalRooms },
      });
    }

    for (const room of existing) {
      if (!incomingIds.has(room.id)) {
        const active = await this.countActiveRoomBookings(tx, room.id);
        if (active > 0) {
          throw new ConflictException("Cannot remove a room type with active bookings");
        }
        await tx.roomType.delete({ where: { id: room.id } });
      }
    }
  }

  private async countActiveRoomBookings(db: PrismaTx, roomTypeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const active = await db.booking.findMany({
      where: {
        roomTypeId,
        status: { in: [BookingStatus.PENDING, BookingStatus.APPROVED] },
        OR: [{ checkOut: null }, { checkOut: { gte: today } }],
      },
      select: { roomCount: true },
    });
    return active.reduce((sum, b) => sum + (b.roomCount ?? 1), 0);
  }

  async deleteHouse(id: string, userId: string, role: UserRole, kycStatus: KycStatus) {
    // TODO: check if a house has a pending booking first.
    const house = await this.getHouseById(id);
    this.assertVerified(role, kycStatus);
    this.isAllowed(house.ownerId, userId, role);

    const deletedHouse = await this.db.house.delete({ where: { id } });
    return deletedHouse;
  }

  async toggleFavorite(userId: string, houseId: string) {
    const house = await this.getHouseById(houseId);

    const where = {
      houseId_userId: {
        houseId: house.id,
        userId,
      },
    };
    const favorite = await this.db.favorite.findUnique({ where });

    if (favorite) {
      await this.db.favorite.delete({ where });

      return {
        isFavorite: false,
        favorite: null,
      };
    }

    const createdFavorite = await this.db.favorite.create({
      data: {
        houseId: house.id,
        userId,
      },
      include: {
        house: true,
      },
    });

    return {
      isFavorite: true,
      favorite: createdFavorite,
    };
  }

  async getFavorites(userId: string, data: FavoriteFilterDto) {
    const { page = 1, limit = 20 } = data;
    const where: Prisma.FavoriteWhereInput = { userId };

    const [favorites, total] = await Promise.all([
      this.db.favorite.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          house: { include: { rooms: true } },
        },
      }),
      this.db.favorite.count({ where }),
    ]);

    return {
      data: favorites,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async leaveReview(userId: string, houseId: string, data: CreateReviewDto) {
    const house = await this.getHouseById(houseId);

    return this.db.review.create({
      data: {
        houseId: house.id,
        tenantId: userId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        house: true,
        tenant: true,
      },
    });
  }

  async getAgentStats(ownerId: string) {
    const [totalProperties, activeBookings, revenueResult, ratingResult] = await Promise.all([
      this.db.house.count({ where: { ownerId } }),
      this.db.booking.count({
        where: {
          house: { ownerId },
          status: "APPROVED",
        },
      }),
      this.db.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: "COMPLETED",
          booking: { house: { ownerId } },
        },
      }),
      this.db.review.aggregate({
        _avg: { rating: true },
        where: { house: { ownerId } },
      }),
    ]);

    return {
      totalProperties,
      activeBookings,
      totalRevenue: revenueResult._sum.amount?.toNumber() ?? 0,
      avgRating: ratingResult._avg.rating ? Math.round(ratingResult._avg.rating * 10) / 10 : null,
    };
  }

  private assertVerified(role: UserRole, kycStatus: KycStatus) {
    if (role === "landlord" && kycStatus !== "APPROVED") {
      throw new ForbiddenException("complete ID verification to manage properties");
    }
  }

  private isAllowed(ownerId: string, userId: string, role: UserRole) {
    if (role === "admin" || ownerId === userId) return;

    throw new ForbiddenException("You cannot manage this property");
  }
}
