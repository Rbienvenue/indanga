import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { NotificationsModule } from "src/notifications/notifications.module";
import { StorageService } from "src/storage/storage.service";
import { KycController } from "./kyc.controller";
import { KycService } from "./kyc.service";

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [KycController],
  providers: [KycService, StorageService],
})
export class KycModule {}
