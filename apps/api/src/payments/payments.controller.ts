import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Param,
  Res,
} from "@nestjs/common";
import type { Response } from "express";
import { ReceiptsService } from "./receipts.service";
import { generateReceiptPdf } from "./receipt-pdf";
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
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly receiptsService: ReceiptsService,
  ) {}

  @Get(":id/receipt")
  @Roles(["tenant", "landlord", "admin"])
  async receipt(@Param("id") id: string, @Session() session: UserSession) {
    return new ApiResponse(await this.receiptsService.getReceipt(id, session.user));
  }

  @Get(":id/receipt.pdf")
  @Roles(["tenant", "landlord", "admin"])
  async receiptPdf(
    @Param("id") id: string,
    @Session() session: UserSession,
    @Res() response: Response,
  ) {
    const receipt = await this.receiptsService.getReceipt(id, session.user);
    response.setHeader("Content-Type", "application/pdf");
    response.setHeader("Content-Disposition", `attachment; filename="receipt-${receipt.id}.pdf"`);
    response.setHeader("Cache-Control", "private, no-store");
    response.send(generateReceiptPdf(receipt));
  }

  @Get()
  @Roles(["tenant", "landlord", "admin"])
  async getPayments(@Session() session: UserSession, @Query() query: FilterPaymentsDto) {
    const result = await this.paymentsService.getPayments(session.user, query);
    return new PaginationResponse(result.data, result.meta);
  }

  @Get("stats")
  @Roles(["landlord"])
  async getPaymentStats(@Session() session: UserSession) {
    const result = await this.paymentsService.getProviderPaymentStats(session.user.id);
    return new ApiResponse(result);
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
