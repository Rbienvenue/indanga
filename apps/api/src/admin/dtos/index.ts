import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";
import { BookingStatus, HouseStatus, PaymentStatus, UserRole } from "@indanga/db";

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}

export class AdminBookingsFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}

export class AdminPaymentsFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}

export class AdminReviewsFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  houseId?: string;
}

export class AdminPropertiesFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(HouseStatus)
  status?: HouseStatus;
}

export class AdminUsersFilterDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
