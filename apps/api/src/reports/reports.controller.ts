import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { Roles, Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { ApiResponse, PaginationResponse } from "src/@types";
import { CreateReportDto, FilterReportsDto, ReviewReportDto } from "./dtos";
import { ReportsService } from "./reports.service";

@Controller()
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}
  @Post("properties/:id/reports")
  @Roles(["tenant", "landlord", "admin"])
  async create(
    @Param("id") id: string,
    @Session() session: UserSession,
    @Body() data: CreateReportDto,
  ) {
    return new ApiResponse(
      await this.reports.create(id, session.user.id, data.reason),
      "Report saved for review",
    );
  }
  @Get("admin/reports")
  @Roles(["admin"])
  async list(@Query() query: FilterReportsDto) {
    const result = await this.reports.list(query);
    return new PaginationResponse(result.data, result.meta);
  }
  @Patch("admin/reports/:id")
  @Roles(["admin"])
  async review(
    @Param("id") id: string,
    @Session() session: UserSession,
    @Body() data: ReviewReportDto,
  ) {
    return new ApiResponse(await this.reports.review(id, session.user.id, data), "Report reviewed");
  }
}
