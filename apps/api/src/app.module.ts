import { Module } from "@nestjs/common";
import { UserModule } from "./users/user.module";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from "./lib/auth";
import { HousesModule } from './houses/houses.module';

@Module({
  imports: [AuthModule.forRoot({
    auth,
  
  }),UserModule, HousesModule],
})
export class AppModule {}
