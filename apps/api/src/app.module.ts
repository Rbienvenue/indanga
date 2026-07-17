import { Module } from "@nestjs/common";
import { UserModule } from "./users/user.module";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { auth } from "./lib/auth";

@Module({
  imports: [AuthModule.forRoot({
    auth,
  
  }),UserModule],
})
export class AppModule {}
