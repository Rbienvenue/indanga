import { Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import {PrismaClient,PrismaPg} from "@indanga/db"

import { env } from "src/lib/env";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy, OnModuleInit {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: env.DATABASE_URL,
    });
    super({ adapter });
  }
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
