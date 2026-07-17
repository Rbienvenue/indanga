import { Controller, Get } from "@nestjs/common";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
@Controller("users")
export class UsersController {
  @Get("me")
  async getProfile(@Session() session: UserSession) {
    return session;
  }
}
