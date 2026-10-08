import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Roles, Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { ApiResponse, PaginationResponse } from "src/@types";
import type { Session as AuthSession } from "src/lib/auth";
import { BookingsService } from "./bookings.service";
import {
  CalendarBookingDto,
  CreateBookingDto,
  FilterBookingDto,
  UpdateBookingStatusDto,
} from "./dtos";

@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  //All users can create a booking request
  async createBooking(@Session() session: UserSession, @Body() data: CreateBookingDto) {
    const booking = await this.bookingsService.createBookingRequest(session.user.id, data);
    return new ApiResponse(booking, "booking request sent");
  }

  @Get()
  @Roles(["tenant", "landlord", "admin"])
  async getBookingsByUser(@Session() session: UserSession, @Query() query: FilterBookingDto) {
    const result = await this.bookingsService.getBookingsByUser(session.user, query);
    return new PaginationResponse(result.data, result.meta);
  }

  @Get("active")
  async getActiveBooking(@Session() session: UserSession, @Query("houseId") houseId: string) {
    const booking = await this.bookingsService.getActiveBooking(session.user.id, houseId);
    return new ApiResponse(booking, "active booking fetched");
  }

  @Get("calendar")
  @Roles(["landlord"])
  async getCalendar(@Session() session: AuthSession, @Query() query: CalendarBookingDto) {
    const calendar = await this.bookingsService.getCalendar(session.user, query);
    return new ApiResponse(calendar, "calendar fetched");
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
