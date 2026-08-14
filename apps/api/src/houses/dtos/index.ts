import { HouseStatus } from "@indanga/db";
import { PartialType } from "@nestjs/mapped-types";
import { Transform, Type } from "class-transformer";
import { IsArray, IsEnum, IsInt, IsOptional, IsPositive, IsString } from "class-validator";

function toStringArray(value: unknown) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value ? [value] : [];
  return value;
}

export class CreateHouseDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsString()
  district: string;

  @IsString()
  sector: string;

  @IsString()
  village: string;

  @IsString()
  cell: string;

  @IsOptional()
  @IsString()
  address?: string;

  @Type(() => Number)
  @IsInt()
  price: number;

  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  media?: string[];

  @IsString()
  description: string;

  @IsString()
  propertyType: string;

  @Type(() => Number)
  @IsInt()
  bedrooms: number;

  @Type(() => Number)
  @IsInt()
  bathrooms: number;
}

export class UpdateHouseDto extends PartialType(CreateHouseDto) {
  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  existingMedia?: string[];
}

export class FilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsEnum(HouseStatus)
  status?: HouseStatus;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  maxPrice?: number;
}

export class CreateReviewDto {
  @Type(() => Number)
  @IsInt()
  rating: number;

  @IsString()
  comment: string;
}

export class FavoriteFilterDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}
