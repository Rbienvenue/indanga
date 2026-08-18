import { Module } from "@nestjs/common";
import { UserModule } from "./users/user.module";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from "./lib/auth";
import { HousesModule } from "./houses/houses.module";
import { BookingsModule } from "./bookings/bookings.module";
import { PaymentsModule } from "./payments/payments.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { AdminModule } from "./admin/admin.module";

@Module({
  imports: [
    AuthModule.forRoot({
      auth,
    }),
    UserModule,
    HousesModule,
    BookingsModule,
    PaymentsModule,
    NotificationsModule,
    AdminModule,
  ],
})
export class AppModule {}
