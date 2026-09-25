import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { NotificationsModule } from "src/notifications/notifications.module";
import { ITECService } from "./itec";
import { WsModule } from "src/ws/ws.module";

@Module({
  imports: [PrismaModule, NotificationsModule, WsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, ITECService],
})
export class PaymentsModule {}
