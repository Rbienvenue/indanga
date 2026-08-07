import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Roles, Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { ApiResponse, PaginationResponse } from "src/@types";
import { BookingsService } from "./bookings.service";
import { CreateBookingDto, FilterBookingDto, UpdateBookingStatusDto } from "./dtos";

@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles(["TENANT"])
  async createBooking(
    @Session() session: UserSession,
    @Body() data: CreateBookingDto,
  ) {
    const booking = await this.bookingsService.createBooking(
      session.user.id,
      data,
    );
    return new ApiResponse(booking, "booking created");
  }

  @Get()
  @Roles(["TENANT", "LANDLORD", "ADMIN"])
  async getBookingsByUser(
    @Session() session: UserSession,
    @Query() query: FilterBookingDto,
  ) {
    const result = await this.bookingsService.getBookingsByUser(
      session.user,
      query,
    );
    return new PaginationResponse(result.data, result.meta);
  }

  @Get(":id")
  @Roles(["TENANT", "LANDLORD", "ADMIN"])
  async getBookingById(
    @Param("id") id: string,
    @Session() session: UserSession,
  ) {
    const booking = await this.bookingsService.getBookingById(id, session.user);
    return new ApiResponse(booking, "booking fetched");
  }

  @Patch(":id/status")
  @Roles(["LANDLORD"])
  async updateBookingStatus(
    @Param("id") id: string,
    @Session() session: UserSession,
    @Body() data: UpdateBookingStatusDto,
  ) {
    const booking = await this.bookingsService.updateBookingStatus(
      id,
      data.status,
      session.user,
    );
    return new ApiResponse(booking, "booking status updated");
  }
}
