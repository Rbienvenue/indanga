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
import { AllowAnonymous, Roles, Session, type UserSession } from "@thallesp/nestjs-better-auth";
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

@Controller("houses")
export class HousesController {
  constructor(
    private readonly houseService: HousesService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor("media", 10))
  async createHouse(
    @Body() data: CreateHouseDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {

    const mediaUrls = await this.storageService.uploadFiles(
      files?.map((file) => file.buffer),
      { bucket: StorageBucket.HOUSE_MEDIA },
    );
    const house = await this.houseService.createHouse({
      ...data,
      media: mediaUrls.map((url) => url.url),
    });
    return new ApiResponse(house, "house created");
  }

  @Get()
  @AllowAnonymous()
  async getHouses(@Query() query: FilterDto) {
    const result = await this.houseService.getHouses(query);
    return new PaginationResponse(result.data, result.meta);
  }

  @Get("favorites")
  @Roles(["TENANT"])
  async getFavorites(
    @Session() session: UserSession,
    @Query() query: FavoriteFilterDto,
  ) {
    const result = await this.houseService.getFavorites(
      session.user.id,
      query,
    );
    return new PaginationResponse(result.data, result.meta);
  }

  @Get("stats")
  @Roles(["LANDLORD"])
  async getAgentStats(@Session() session: UserSession) {
    const stats = await this.houseService.getAgentStats(session.user.id);
    return new ApiResponse(stats, "agent stats fetched");
  }

  @Get(":id")
  @AllowAnonymous()
  async getHouseById(@Param("id") id: string) {
    const house = await this.houseService.getHouseById(id);
    return new ApiResponse(house, "house fetched");
  }

  @Patch(":id")
  async updateHouse(@Param("id") id: string, @Body() data: UpdateHouseDto) {
    const house = await this.houseService.updateHouse(id, data);
    return new ApiResponse(house, "house updated");
  }

  @Delete(":id")
  async deleteHouse(@Param("id") id: string) {
    const house = await this.houseService.deleteHouse(id);
    return new ApiResponse(house, "house deleted");
  }

  @Post(":id/favorites")
  @Roles(["TENANT"])
  async toggleFavorite(
    @Param("id") id: string,
    @Session() session: UserSession,
  ) {
    const favorite = await this.houseService.toggleFavorite(
      session.user.id,
      id,
    );
    return new ApiResponse(favorite, "favorite toggled");
  }

  @Post(":id/reviews")
  @Roles(["TENANT"])
  async leaveReview(
    @Param("id") id: string,
    @Session() session: UserSession,
    @Body() data: CreateReviewDto,
  ) {
    const review = await this.houseService.leaveReview(
      session.user.id,
      id,
      data,
    );
    return new ApiResponse(review, "review created");
  }
}
