import { Module } from "@nestjs/common";
import { HousesController } from "./houses.controller";
import { HousesService } from "./houses.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { StorageService } from "src/storage/storage.service";
import { UploadAuthorizationService } from "./upload-authorization.service";

@Module({
  imports: [PrismaModule],
  controllers: [HousesController],
  providers: [HousesService, StorageService, UploadAuthorizationService],
})
export class HousesModule {}
