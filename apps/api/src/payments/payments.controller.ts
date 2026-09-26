import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { AllowAnonymous, Roles, Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { ApiResponse, PaginationResponse } from "src/@types";
import { CreateOrderDto, FilterPaymentsDto, PaymentCallbackDto } from "./dtos";
import { PaymentsService } from "./payments.service";

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
  @Roles(["tenant","landlord","admin"])
  async createPayment(@Session() session: UserSession, @Body() body: CreateOrderDto) {
    const result = await this.paymentsService.initiatePayment(session.user.id, body);
    return new ApiResponse(result);
  }

  @Post("callback")
  @AllowAnonymous()
  async handleCallback(@Body() body: PaymentCallbackDto) {
    const result = await this.paymentsService.checkPaymentStatus(body.data.transaction_id);
    return new ApiResponse(result, "payment status checked");
  }
}
