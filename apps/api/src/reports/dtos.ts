import { Transform, Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from "class-validator";
import { ReportStatus } from "@indanga/db";

export class CreateReportDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  reason: string;
}
export class ReviewReportDto {
  @IsEnum({ RESOLVED: "RESOLVED", DISMISSED: "DISMISSED" })
  status: "RESOLVED" | "DISMISSED";
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  reviewNote: string;
}
export class FilterReportsDto {
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
