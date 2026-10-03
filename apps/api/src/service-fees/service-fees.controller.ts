import { Controller, Get, Query } from "@nestjs/common";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { ApiResponse } from "src/@types";
import { ServiceFeesService } from "./service-fees.service";

@Controller("service-fees")
export class ServiceFeesController {
  constructor(private readonly serviceFees: ServiceFeesService) {}

  @Get()
  @AllowAnonymous()
  async getFees(@Query("bookingKind") bookingKind?: string) {
    if (bookingKind) {
      const fee = await this.serviceFees.getByKind(bookingKind);
      return new ApiResponse(fee, "service fee fetched");
    }
    const fees = await this.serviceFees.getAll();
    return new ApiResponse(fees, "service fees fetched");
  }
}
