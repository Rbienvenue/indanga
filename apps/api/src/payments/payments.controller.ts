import { Controller, Get, Post, Query,Body } from "@nestjs/common";
import { Roles, Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { ApiResponse, PaginationResponse } from "src/@types";
import { PaymentsService } from "./payments.service";
import { CreateOrderDto, FilterPaymentsDto } from "./dtos";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Roles(["tenant", "landlord", "admin"])
  async getPayments(@Session() session: UserSession, @Query() query: FilterPaymentsDto) {
    const result = await this.paymentsService.getPayments(session.user, query);
    return new PaginationResponse(result.data, result.meta);
  }

  @Post()
  @Roles(["tenant"])
  async createPayment(@Session() session: UserSession, @Body() body: CreateOrderDto) {
    const result = await this.paymentsService.initiatePayment(session.user.id, body);
    return new ApiResponse(result);
  }
}
