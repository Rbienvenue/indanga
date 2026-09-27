import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { AllowAnonymous, Roles, Session } from "@thallesp/nestjs-better-auth";
import { ApiResponse, PaginationResponse } from "src/@types";
import { StorageBucket, StorageService } from "src/storage/storage.service";
import {
  CreateHouseDto,
  CreateReviewDto,
  FavoriteFilterDto,
  FilterDto,
  UpdateHouseDto,
} from "./dtos";
import { HousesService } from "./houses.service";
import { type Session as UserSession } from "src/lib/auth";
import { KycStatus, UserRole } from "@indanga/db";

@Controller("properties")
export class HousesController {
  constructor(
    private readonly houseService: HousesService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @Roles(["landlord", "admin"])
  @UseInterceptors(FilesInterceptor("media", 10))
  async createHouse(
    @Session() session: UserSession,
    @Body() data: CreateHouseDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const mediaUrls = await this.storageService.uploadFiles(
      files?.map((file) => file.buffer) ?? [],
      { bucket: StorageBucket.HOUSE_MEDIA },
    );
    const house = await this.houseService.createHouse(
      session.user.id,
      session?.user?.role as UserRole,
      session?.user?.kycStatus as KycStatus,
      {
        ...data,
        media: mediaUrls.map((url) => url.url),
      },
    );
    return new ApiResponse(house, "property created");
  }

  @Get()
  @AllowAnonymous()
  async getHouses(@Query() query: FilterDto) {
    const result = await this.houseService.getHouses(query);
    return new PaginationResponse(result.data, result.meta);
  }

  @Get("favorites")
  @Roles(["tenant"])
  async getFavorites(@Session() session: UserSession, @Query() query: FavoriteFilterDto) {
    const result = await this.houseService.getFavorites(session.user.id, query);
    return new PaginationResponse(result.data, result.meta);
  }

  @Get("stats")
  @Roles(["landlord"])
  async getAgentStats(@Session() session: UserSession) {
    const stats = await this.houseService.getAgentStats(session.user.id);
    return new ApiResponse(stats, "agent stats fetched");
  }

  @Get(":id")
  @AllowAnonymous()
  async getHouseById(@Param("id") id: string) {
    const house = await this.houseService.getHouseById(id);
    return new ApiResponse(house, "property fetched");
  }

  @Get(":id/availability")
  @AllowAnonymous()
  async getRoomAvailability(
    @Param("id") id: string,
    @Query("roomTypeId") roomTypeId?: string,
    @Query("checkIn") checkIn?: string,
    @Query("checkOut") checkOut?: string,
  ) {
    const availability = await this.houseService.getRoomAvailability(
      id,
      roomTypeId,
      checkIn,
      checkOut,
    );
    return new ApiResponse(availability, "availability fetched");
  }

  @Patch(":id")
  @Roles(["landlord", "admin"])
  @UseInterceptors(FilesInterceptor("media", 10))
  async updateHouse(
    @Param("id") id: string,
    @Session() session: UserSession,
    @Body() data: UpdateHouseDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const mediaUrls = await this.storageService.uploadFiles(
      files?.map((file) => file.buffer) ?? [],
      { bucket: StorageBucket.HOUSE_MEDIA },
    );
    const house = await this.houseService.updateHouse(
      id,
      session.user.id,
      session?.user?.role as UserRole,
      session?.user?.kycStatus as KycStatus,
      {
        ...data,
        media: mediaUrls.map((url) => url.url),
      },
    );
    return new ApiResponse(house, "property updated");
  }

  @Delete(":id")
  @Roles(["landlord", "admin"])
  async deleteHouse(@Param("id") id: string, @Session() session: UserSession) {
    const house = await this.houseService.deleteHouse(
      id,
      session.user.id,
      session?.user?.role as UserRole,
      session?.user?.kycStatus as KycStatus,
    );
    return new ApiResponse(house, "property deleted");
  }

  @Post(":id/favorites")
  @Roles(["tenant"])
  async toggleFavorite(@Param("id") id: string, @Session() session: UserSession) {
    const favorite = await this.houseService.toggleFavorite(session.user.id, id);
    return new ApiResponse(favorite, "favorite toggled");
  }

  @Post(":id/reviews")
  @Roles(["tenant"])
  async leaveReview(
    @Param("id") id: string,
    @Session() session: UserSession,
    @Body() data: CreateReviewDto,
  ) {
    const review = await this.houseService.leaveReview(session.user.id, id, data);
    return new ApiResponse(review, "review created");
  }
}
