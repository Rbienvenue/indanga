import { IsBoolean, IsEnum, IsInt, Min } from "class-validator";
import { FeeType } from "@indanga/db";

export class UpdateServiceFeeDto {
  @IsEnum(FeeType)
  feeType: FeeType;

  @IsInt()
  @Min(0)
  amount: number;

  @IsBoolean()
  isActive: boolean;
}
