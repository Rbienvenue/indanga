import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { WsGateway } from "./ws.gateway";

@Module({
  imports: [PrismaModule],
  providers: [WsGateway],
  exports: [WsGateway],
})
export class WsModule {}
