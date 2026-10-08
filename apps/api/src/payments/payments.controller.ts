import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { AllowAnonymous, Roles, Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ApiResponse, PaginationResponse } from "src/@types";
import {
  CardPaymentCallbackDto,
  CreateOrderDto,
  FilterPaymentsDto,
  isCardPaymentCallback,
  isMobilePaymentCallback,
  MobilePaymentCallbackDto,
  RefreshPaymentDto,
} from "./dtos";
import { CallbackGuard } from "./callback.guard";
import { PaymentsService } from "./payments.service";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Roles(["admin"])
  async getPayments(@Session() session: UserSession, @Query() query: FilterPaymentsDto) {
    const result = await this.paymentsService.getPayments(session.user, query);
    return new PaginationResponse(result.data, result.meta);
  }

  @Post()
  @Roles(["tenant", "landlord", "admin"])
  async createPayment(@Session() session: UserSession, @Body() body: CreateOrderDto) {
    const result = await this.paymentsService.initiatePayment(session.user.id, body);
    return new ApiResponse(result);
  }

  @Post("refresh")
  @Roles(["admin"])
  async refreshPayment(@Body() body: RefreshPaymentDto) {
    const result = await this.paymentsService.checkPaymentStatus(body.transactionReference);
    return new ApiResponse(result, "payment status checked");
  }

  @Post("callback")
  @AllowAnonymous()
  @UseGuards(CallbackGuard)
  async handleCallback(@Body() body: Record<string, unknown>) {
    if (isCardPaymentCallback(body)) {
      const card = plainToInstance(CardPaymentCallbackDto, body);
      const errors = await validate(card);
      if (errors.length > 0) {
        throw new BadRequestException("Invalid card payment callback");
      }
      const result = await this.paymentsService.handleCardCallback(card);
      return new ApiResponse(result, "payment status checked");
    }
    if (isMobilePaymentCallback(body)) {
      const mobile = plainToInstance(MobilePaymentCallbackDto, body);
      const errors = await validate(mobile);
      if (errors.length > 0) {
        throw new BadRequestException("Invalid mobile payment callback");
      }
      const result = await this.paymentsService.checkPaymentStatus(mobile.data.transaction_id);
      return new ApiResponse(result, "payment status checked");
    }
    throw new BadRequestException("Unsupported payment callback payload");
  }
}
