import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { WsModule } from "src/ws/ws.module";
import { MessagesController } from "./messages.controller";
import { MessagesService } from "./messages.service";

@Module({
  imports: [PrismaModule, WsModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
