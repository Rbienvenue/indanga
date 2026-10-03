import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { AdminServiceFeesController } from "./admin-service-fees.controller";
import { ServiceFeesController } from "./service-fees.controller";
import { ServiceFeesService } from "./service-fees.service";

@Module({
  imports: [PrismaModule],
  controllers: [ServiceFeesController, AdminServiceFeesController],
  providers: [ServiceFeesService],
  exports: [ServiceFeesService],
})
export class ServiceFeesModule {}
