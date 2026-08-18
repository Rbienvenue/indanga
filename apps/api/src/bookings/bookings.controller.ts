import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { Roles, Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { ApiResponse, PaginationResponse } from "src/@types";
import { BookingsService } from "./bookings.service";
import { FilterBookingDto, UpdateBookingStatusDto } from "./dtos";

@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @Roles(["tenant", "landlord", "admin"])
  async getBookingsByUser(@Session() session: UserSession, @Query() query: FilterBookingDto) {
    const result = await this.bookingsService.getBookingsByUser(session.user, query);
    return new PaginationResponse(result.data, result.meta);
  }

  @Get(":id")
  @Roles(["tenant", "landlord", "admin"])
  async getBookingById(@Param("id") id: string, @Session() session: UserSession) {
    const booking = await this.bookingsService.getBookingById(id, session.user);
    return new ApiResponse(booking, "booking fetched");
  }

  @Patch(":id/status")
  @Roles(["landlord", "admin"])
  async updateBookingStatus(
    @Param("id") id: string,
    @Session() session: UserSession,
    @Body() data: UpdateBookingStatusDto,
  ) {
    const booking = await this.bookingsService.updateBookingStatus(id, data.status, session.user);
    return new ApiResponse(booking, "booking status updated");
  }
}
