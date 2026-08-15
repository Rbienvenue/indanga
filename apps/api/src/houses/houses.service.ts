import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, type UserRole } from "@indanga/db";
import { PrismaService } from "src/prisma/prisma.service";
import {
  CreateHouseDto,
  CreateReviewDto,
  FavoriteFilterDto,
  FilterDto,
  UpdateHouseDto,
} from "./dtos";

@Injectable()
export class HousesService {
  constructor(private readonly db: PrismaService) {}

  async createHouse(ownerId: string, data: CreateHouseDto) {
    const {
      province,
      district,
      sector,
      cell,
      village,
      ownerId: _ownerId,
      ...rest
    } = data as CreateHouseDto & {
      ownerId?: string;
    };

    const house = await this.db.house.create({
      data: {
        ...rest,
        ownerId,
        bedrooms: data.bedrooms ?? 0,
        bathrooms: data.bathrooms ?? 0,
        location: `${province}, ${district}, ${sector}, ${cell} ${village}`,
      },
    });
    return house;
  }

  async getHouses(data: FilterDto) {
    const {
      search,
      ownerId,
      status,
      location,
      propertyType,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
    } = data;
    const where: Prisma.HouseWhereInput = {};

    if (search) where.name = { startsWith: search, mode: "insensitive" };
    if (ownerId) where.ownerId = ownerId;
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
      where.price = {
        gte: minPrice,
        lte: maxPrice,
      };
    }

    const [houses, total] = await Promise.all([
      this.db.house.findMany({
        where,
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
    const house = await this.db.house.findUnique({ where: { id } });
    if (!house) {
      throw new NotFoundException("Property not found");
    }
    return house;
  }

  async updateHouse(id: string, userId: string, role: UserRole, data: UpdateHouseDto) {
    const house = await this.getHouseById(id);
    this.isAllowed(house.ownerId, userId, role);

    const {
      province,
      district,
      sector,
      cell,
      village,
      existingMedia,
      ownerId: _ownerId,
      ...rest
    } = data as UpdateHouseDto & {
      ownerId?: string;
    };

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

    const updatedHouse = await this.db.house.update({
      where: { id },
      data: updateData,
    });
    return updatedHouse;
  }

  async deleteHouse(id: string, userId: string, role: UserRole) {
    // TODO: check if a house has a pending booking first.
    const house = await this.getHouseById(id);
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
          house: true,
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

  private isAllowed(ownerId: string, userId: string, role: UserRole) {
    if (role === "admin" || ownerId === userId) return;

    throw new ForbiddenException("You cannot manage this property");
  }
}
