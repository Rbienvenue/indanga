import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { KycStatus } from "@indanga/db";
import { PaginationDto } from "src/admin/dtos";

export class GetKycDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(KycStatus)
  status?: KycStatus;
}

export class RejectDto {
  @IsString()
  @MinLength(4)
  reason: string;
}
