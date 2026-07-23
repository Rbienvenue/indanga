import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@indanga/db";
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

  async createHouse(data: CreateHouseDto) {
    const {
      province,
      district,
      sector,
      cell,
      village,
      ...rest
    } = data;

    const house = await this.db.house.create({
      data: {
        ...rest,
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
    if (status) where.status = status;
    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }
    if (propertyType) {
      where.propertyType = { equals: propertyType, mode: "insensitive" };
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
      throw new NotFoundException("House not found");
    }
    return house;
  }

  async updateHouse(id: string, data: UpdateHouseDto) {
    await this.getHouseById(id);

    const {
      province,
      district,
      sector,
      cell,
      village,
      ...rest
    } = data;

    const updateData: Prisma.HouseUpdateInput = { ...rest };

    if (
      province !== undefined ||
      district !== undefined ||
      sector !== undefined ||
      cell !== undefined ||
      village !== undefined
    ) {
      updateData.location = `${province}, ${district}, ${sector}, ${cell} ${village}`;
    }

    const house = await this.db.house.update({
      where: { id },
      data: updateData,
    });
    return house;
  }

  async deleteHouse(id: string) {
    await this.getHouseById(id);
    const house = await this.db.house.delete({ where: { id } });
    return house;
  }

  async toggleFavorite(userId: string, houseId: string) {
    const house=await this.getHouseById(houseId);

    const where = {
      houseId_userId: {
        houseId:house.id,
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
        houseId:house.id,
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
}
