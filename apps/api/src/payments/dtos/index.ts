import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, ValidateIf, ValidateNested } from "class-validator";
import { PaymentStatus } from "@indanga/db";

export class FilterPaymentsDto {
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
  houseId: string;

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

export class PaymentCallbackDto {
  @ValidateNested()
  @Type(() => PaymentCallbackDataDto)
  data: PaymentCallbackDataDto;
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
    status?: "PENDING" | "FAILED" | "SUCCESSFULL";
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
    status?: "PENDING" | "FAILED" | "SUCCESSFULL";
    message?: string;
    transaction_id?: string;
  };
};

export interface PaymentGateway {
  initiatePayment(payment: InitiatePayment): Promise<InitiatePaymentResponse | CardPaymentResponse>;
  checkPaymentStatus(transactionId: string): Promise<CheckPaymentStatusResponse>;
  validateAmount(amount: number): void;
}
