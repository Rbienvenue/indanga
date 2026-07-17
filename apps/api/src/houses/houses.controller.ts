import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { HousesService } from "./houses.service";
import { CreateHouseDto, FilterDto, UpdateHouseDto } from "./dtos";
import { ApiResponse, PaginationResponse } from "src/@types";

@Controller("houses")
export class HousesController {
  constructor(private readonly houseService: HousesService) {}

  @Post()
  async createHouse(@Body() data: CreateHouseDto) {
    const house = await this.houseService.createHouse(data);
    return new ApiResponse(house, "house created");
  }

  @Get()
  async getHouses(@Query() query: FilterDto) {
    const result = await this.houseService.getHouses(query);
    return new PaginationResponse(result.data, result.meta);
  }

  @Get(":id")
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
}
