import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";
import { Transform } from "class-transformer";
import { BookingStatus } from "@indanga/db";

export class CreateBookingDto {
  @IsString()
  houseId: string;

  @IsDateString()
  @IsOptional()
  checkIn?: string;

  @IsDateString()
  @IsOptional()
  checkOut?: string;

  @IsString()
  @IsOptional()
  roomTypeId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  roomCount?: number;
}

export class FilterBookingDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  status: BookingStatus;
  @ValidateIf((data) => data.status === BookingStatus.DECLINED || data.declineReason !== undefined)
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  declineReason?: string;
}

export class CalendarBookingDto {
  @IsDateString({ strict: true })
  start: string;

  @IsDateString({ strict: true })
  end: string;

  @IsDateString({ strict: true })
  date: string;
}
