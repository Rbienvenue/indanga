import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";
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

export class CreateOrderDto {
  @IsString()
  houseId: string;
}