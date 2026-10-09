import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { NotificationsModule } from "src/notifications/notifications.module";
import { ServiceFeesModule } from "src/service-fees/service-fees.module";
import { BookingsController } from "./bookings.controller";
import { BookingsService } from "./bookings.service";
import { BookingStatusService } from "./booking-status.service";

@Module({
  imports: [PrismaModule, NotificationsModule, ServiceFeesModule],
  controllers: [BookingsController],
  providers: [BookingsService, BookingStatusService],
})
export class BookingsModule {}
