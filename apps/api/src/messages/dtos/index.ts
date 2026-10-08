import { Transform, Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

export class MessagePaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 20;
}

export class CreatePropertyConversationDto {
  @IsString()
  @MinLength(1)
  bookingId: string;
}

export class SendMessageDto {
  @Transform(({ value }: { value: unknown }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  text: string;
}

export class ReadConversationDto {
  @IsString()
  @MinLength(1)
  messageId: string;
}
