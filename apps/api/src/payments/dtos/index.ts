import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, ValidateIf, ValidateNested } from "class-validator";
import { PaymentStatus } from "@indanga/db";

export class FilterPaymentsDto {
  @IsOptional()
  @IsString()
  bookingId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}
const paymentMethods = ["MOMO", "AIRTEL", "CARD"] as const;

export class CreateOrderDto {
  @IsString()
  bookingId: string;

  @ValidateIf((o) => o.method !== "CARD")
  @IsString()
  phone?: string;

  @IsEnum(paymentMethods)
  method: (typeof paymentMethods)[number];
}

class PaymentCallbackDataDto {
  @IsString()
  transaction_id: string;
}

export class MobilePaymentCallbackDto {
  @ValidateNested()
  @Type(() => PaymentCallbackDataDto)
  data: PaymentCallbackDataDto;
}

export class CardPaymentCallbackDto {
  @IsString()
  PCODE: string;

  @IsString()
  amount: string;

  @IsString()
  transID: string;
}

export class RefreshPaymentDto {
  @IsString()
  transactionReference: string;
}

export function isCardPaymentCallback(body: Record<string, unknown>) {
  return typeof body.PCODE === "string";
}

export function isMobilePaymentCallback(body: Record<string, unknown>) {
  return (
    typeof body.data === "object" &&
    body.data !== null &&
    typeof (body.data as { transaction_id?: unknown }).transaction_id === "string"
  );
}

export type InitiatePayment = {
  id: string;
  amount: number;
  phone?: string;
  method?: (typeof paymentMethods)[number];
};
export type InitiatePaymentResponse = {
  status: number;
  data: {
    financial_transaction_id?: string;
    transaction_id?: string;
    amount?: number;
    currency?: string;
    status?: "PENDING" | "FAILED";
    message?: string;
  };
};

export type CardPaymentResponse = {
  status: number;
  PCODE: string;
  link: string;
  valid_until: string;
  amount: number;
};

export type CheckPaymentStatusResponse = {
  status: number;
  data: {
    status?: "PENDING" | "FAILED" | "SUCCESSFUL";
    message?: string;
    transaction_id?: string;
  };
};

export interface PaymentGateway {
  initiatePayment(payment: InitiatePayment): Promise<InitiatePaymentResponse | CardPaymentResponse>;
  checkPaymentStatus(transactionId: string): Promise<CheckPaymentStatusResponse>;
  validateAmount(amount: number): void;
}
