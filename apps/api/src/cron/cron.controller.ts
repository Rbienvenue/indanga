import { Controller, Get, Headers, UnauthorizedException } from "@nestjs/common";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";
import { ApiResponse } from "src/@types";
import { env } from "src/lib/env";
import { CronService } from "./cron.service";

@Controller("cron")
export class CronController {
  constructor(private readonly cronService: CronService) {}

  @Get("expire-bookings")
  @AllowAnonymous()
  async expireBookings(@Headers("authorization") authorization?: string) {
    if (authorization !== `Bearer ${env.CRON_SECRET}`) {
      throw new UnauthorizedException("Invalid cron secret");
    }
    const result = await this.cronService.expireBookings();
    return new ApiResponse(result, "expired bookings processed");
  }
}
