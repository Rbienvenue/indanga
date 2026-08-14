import { Controller, Delete, Get, Param, Patch, Query } from "@nestjs/common";
import { Roles } from "@thallesp/nestjs-better-auth";
import { ApiResponse, PaginationResponse } from "src/@types";
import { AdminService } from "./admin.service";
import {
  AdminBookingsFilterDto,
  AdminPaymentsFilterDto,
  AdminPropertiesFilterDto,
  AdminReviewsFilterDto,
} from "./dtos";

@Controller("admin")
@Roles(["admin"])
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("stats")
  async getStats() {
    const stats = await this.adminService.getStats();
    return new ApiResponse(stats, "admin stats fetched");
  }

  @Get("bookings")
  async getBookings(@Query() query: AdminBookingsFilterDto) {
    const result = await this.adminService.getBookings(query);
    return new PaginationResponse(result.data, result.meta);
  }

  @Get("payments")
  async getPayments(@Query() query: AdminPaymentsFilterDto) {
    const result = await this.adminService.getPayments(query);
    return new PaginationResponse(result.data, result.meta);
  }

  @Get("properties")
  async getProperties(@Query() query: AdminPropertiesFilterDto) {
    const result = await this.adminService.getProperties(query);
    return new PaginationResponse(result.data, result.meta);
  }

  @Patch("properties/:id/publish")
  async publishProperty(@Param("id") id: string) {
    const property = await this.adminService.publishProperty(id);
    return new ApiResponse(property, "property published");
  }

  @Patch("properties/:id/unpublish")
  async unpublishProperty(@Param("id") id: string) {
    const property = await this.adminService.unpublishProperty(id);
    return new ApiResponse(property, "property unpublished");
  }

  @Delete("properties/:id")
  async deleteProperty(@Param("id") id: string) {
    const property = await this.adminService.deleteProperty(id);
    return new ApiResponse(property, "property deleted");
  }

  @Get("reviews")
  async getReviews(@Query() query: AdminReviewsFilterDto) {
    const result = await this.adminService.getReviews(query);
    return new PaginationResponse(result.data, result.meta);
  }

  @Delete("reviews/:id")
  async deleteReview(@Param("id") id: string) {
    const review = await this.adminService.deleteReview(id);
    return new ApiResponse(review, "review deleted");
  }
}
