import { Controller, Get, Param, Query } from "@nestjs/common";
import { Roles, Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { ApiResponse, PaginationResponse } from "src/@types";
import { FilterGuestsDto } from "./dtos";
import { GuestsService } from "./guests.service";

@Controller("guests")
@Roles(["landlord"])
export class GuestsController {
  constructor(private readonly guestsService: GuestsService) {}

  @Get()
  async getGuests(@Session() session: UserSession, @Query() query: FilterGuestsDto) {
    const result = await this.guestsService.getGuests(session.user.id, query);
    return new PaginationResponse(result.data, result.meta);
  }

  @Get("properties")
  async getProperties(@Session() session: UserSession) {
    return new ApiResponse(await this.guestsService.getProperties(session.user.id));
  }

  @Get(":id/bookings")
  async getGuestBookings(
    @Session() session: UserSession,
    @Param("id") id: string,
    @Query() query: FilterGuestsDto,
  ) {
    const result = await this.guestsService.getGuestBookings(session.user.id, id, query);
    return new PaginationResponse(result.data, result.meta);
  }
}
