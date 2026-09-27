import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { NotificationsModule } from "src/notifications/notifications.module";
import { CronController } from "./cron.controller";
import { CronService } from "./cron.service";

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [CronController],
  providers: [CronService],
})
export class CronModule {}
