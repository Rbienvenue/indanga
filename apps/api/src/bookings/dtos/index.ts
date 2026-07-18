import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString } from "class-validator";

export class CreateBookingDto {
  @IsString()
  houseId: string;
}

export class FilterBookingDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;
}
