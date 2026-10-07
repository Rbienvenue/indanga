import { HouseStatus } from "@indanga/db";
import { PartialType } from "@nestjs/mapped-types";
import { Transform, Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  ValidateNested,
} from "class-validator";

function toStringArray(value: unknown) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // not JSON, fall through to single-value handling
    }
    return value ? [value] : [];
  }
  return value;
}

function toObjectArray(value: unknown) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // not JSON, leave for validation to reject
    }
  }
  return value;
}

export class RoomTypeInputDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  name: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  price: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalRooms: number;
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

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  price?: number;

  @IsOptional()
  @Transform(({ value }) => toObjectArray(value))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomTypeInputDto)
  rooms?: RoomTypeInputDto[];

  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  media?: string[];

  @IsString()
  description: string;

  @IsString()
  propertyType: string;

  @IsOptional()
  @IsString()
  subType?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  bedrooms?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  bathrooms?: number;

  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  metadata?: string[];
}

export class UpdateHouseDto extends PartialType(CreateHouseDto) {
  @IsOptional()
  @Transform(({ value }) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  existingMedia?: string[];
}

export class PropertyUploadItemDto {
  @IsString()
  filename: string;

  @IsString()
  contentType: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(100 * 1024 * 1024)
  size: number;
}

export class RequestPropertyUploadsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => PropertyUploadItemDto)
  items: PropertyUploadItemDto[];
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
  @IsString()
  subType?: string;

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
