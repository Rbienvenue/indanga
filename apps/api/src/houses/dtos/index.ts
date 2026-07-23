import { HouseStatus } from "@indanga/db";
import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from "class-validator";

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

  @IsInt()
  price: number;

  @IsArray()
  @IsString({ each: true })
  media: string[];

  @IsString()
  ownerId: string;

  @IsString()
  description: string;

  @IsString()
  propertyType: string;

  @IsInt()
  bedrooms: number;

  @IsInt()
  bathrooms: number;
}

export class UpdateHouseDto extends PartialType(CreateHouseDto) {}

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
