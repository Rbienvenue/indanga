import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { AllowAnonymous, Roles, Session } from "@thallesp/nestjs-better-auth";
import { ApiResponse, PaginationResponse } from "src/@types";
import {
  countVideosInMediaUrls,
  MAX_PROPERTY_MEDIA_ITEMS,
  MAX_PROPERTY_VIDEOS,
} from "src/storage/storage.service";
import {
  CreateHouseDto,
  CreateReviewDto,
  FavoriteFilterDto,
  FilterDto,
  RequestPropertyUploadsDto,
  UpdateHouseDto,
} from "./dtos";
import { HousesService } from "./houses.service";
import { type Session as UserSession } from "src/lib/auth";
import { KycStatus, UserRole } from "@indanga/db";
import { UploadAuthorizationService } from "./upload-authorization.service";

@Controller("properties")
export class HousesController {
  constructor(
    private readonly houseService: HousesService,
    private readonly uploadAuthorizationService: UploadAuthorizationService,
  ) {}

  @Post("upload-authorizations")
  @Roles(["landlord", "admin"])
  async authorizePropertyUploads(
    @Session() session: UserSession,
    @Body() data: RequestPropertyUploadsDto,
  ) {
    const authorizations = await this.uploadAuthorizationService.authorize(
      session.user.id,
      session.user.role as UserRole,
      session.user.kycStatus as KycStatus,
      data,
    );
    return new ApiResponse(authorizations, "uploads authorized");
  }

  @Post()
  @Roles(["landlord", "admin"])
  async createHouse(@Session() session: UserSession, @Body() data: CreateHouseDto) {
    const media = await this.uploadAuthorizationService.resolveNewMediaUrls(
      session.user.id,
      data.media ?? [],
    );
    const house = await this.houseService.createHouse(
      session.user.id,
      session?.user?.role as UserRole,
      session?.user?.kycStatus as KycStatus,
      {
        ...data,
        media,
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
  async updateHouse(
    @Param("id") id: string,
    @Session() session: UserSession,
    @Body() data: UpdateHouseDto,
  ) {
    const house = await this.houseService.getHouseById(id);
    const existingMedia = this.uploadAuthorizationService.resolveExistingMediaUrls(
      house.media,
      data.existingMedia,
    );
    const newMedia = await this.uploadAuthorizationService.resolveNewMediaUrls(
      session.user.id,
      data.media ?? [],
    );
    const combinedMedia = [...existingMedia, ...newMedia];
    if (combinedMedia.length > MAX_PROPERTY_MEDIA_ITEMS) {
      throw new BadRequestException(
        `A property can have at most ${MAX_PROPERTY_MEDIA_ITEMS} media items`,
      );
    }
    if (countVideosInMediaUrls(combinedMedia) > MAX_PROPERTY_VIDEOS) {
      throw new BadRequestException(`A property can have at most ${MAX_PROPERTY_VIDEOS} videos`);
    }
    const updated = await this.houseService.updateHouse(
      id,
      session.user.id,
      session?.user?.role as UserRole,
      session?.user?.kycStatus as KycStatus,
      {
        ...data,
        existingMedia,
        media: newMedia,
      },
    );
    return new ApiResponse(updated, "property updated");
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
  async toggleFavorite(@Param("id") id: string, @Session() session: UserSession) {
    const favorite = await this.houseService.toggleFavorite(session.user.id, id);
    return new ApiResponse(favorite, "favorite toggled");
  }

  @Post(":id/reviews")
  async leaveReview(
    @Param("id") id: string,
    @Session() session: UserSession,
    @Body() data: CreateReviewDto,
  ) {
    const review = await this.houseService.leaveReview(session.user.id, id, data);
    return new ApiResponse(review, "review created");
  }
}
