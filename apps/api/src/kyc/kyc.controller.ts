import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { Roles, Session } from "@thallesp/nestjs-better-auth";
import { ApiResponse, PaginationResponse } from "src/@types";
import { type Session as UserSession } from "src/lib/auth";
import { KycService } from "./kyc.service";
import { GetKycDto, RejectDto } from "./dtos";

@Controller("kyc")
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post()
  @Roles(["landlord"])
  @UseInterceptors(
    FileFieldsInterceptor([{ name: "ID_DOCUMENT", maxCount: 1 }], {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async submitKyc(
    @Session() session: UserSession,
    @UploadedFiles() files: { ID_DOCUMENT?: Express.Multer.File[] },
  ) {
    const result = await this.kycService.submitKyc(session.user.id, files);
    return new ApiResponse(result, "documents submitted");
  }

  @Get("me")
  @Roles(["landlord"])
  async getMyKyc(@Session() session: UserSession) {
    const result = await this.kycService.getMyKyc(session.user.id);
    return new ApiResponse(result, "kyc fetched");
  }

  @Get()
  @Roles(["admin"])
  async listKyc(@Query() query: GetKycDto) {
    const result = await this.kycService.listKyc(query);
    return new PaginationResponse(result.data, result.meta);
  }

  @Get("verify/nida")
  @Roles(["admin"])
  async verifyNida(@Query("id") id: string) {
    const result = await this.kycService.verifyNationalId(id);
    return new ApiResponse(result, "nida record fetched");
  }

  @Get(":userId")
  @Roles(["admin"])
  async getKycByUserId(@Param("userId") userId: string) {
    const result = await this.kycService.getKycByUserId(userId);
    return new ApiResponse(result, "kyc fetched");
  }

  @Patch(":userId/approve")
  @Roles(["admin"])
  async approveKyc(@Param("userId") userId: string) {
    const result = await this.kycService.approveKyc(userId);
    return new ApiResponse(result, "kyc approved");
  }

  @Patch(":userId/reject")
  @Roles(["admin"])
  async rejectKyc(@Param("userId") userId: string, @Body() body: RejectDto) {
    const result = await this.kycService.rejectKyc(userId, body.reason);
    return new ApiResponse(result, "kyc rejected");
  }
}
