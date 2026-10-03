import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { Roles } from "@thallesp/nestjs-better-auth";
import { ApiResponse } from "src/@types";
import { UpdateServiceFeeDto } from "./dtos";
import { ServiceFeesService } from "./service-fees.service";

@Controller("admin/service-fees")
@Roles(["admin"])
export class AdminServiceFeesController {
  constructor(private readonly serviceFees: ServiceFeesService) {}

  @Get()
  async getAll() {
    const fees = await this.serviceFees.getAll();
    return new ApiResponse(fees, "service fees fetched");
  }

  @Patch(":bookingKind")
  async upsert(@Param("bookingKind") bookingKind: string, @Body() data: UpdateServiceFeeDto) {
    const fee = await this.serviceFees.upsert(bookingKind, data);
    return new ApiResponse(fee, "service fee updated");
  }
}
