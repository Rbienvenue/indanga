import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { Currency } from "@indanga/db";
import { PrismaService } from "src/prisma/prisma.service";
import { z } from "zod";

const dailyMs = 24 * 60 * 60 * 1000;
const rateResponse = z.object({
  base: z.literal("USD"),
  quote: z.literal("RWF"),
  rate: z.number().positive().finite(),
  date: z.iso.date(),
});

@Injectable()
export class ExchangeRatesService {
  private readonly logger = new Logger(ExchangeRatesService.name);

  constructor(private readonly db: PrismaService) {}

  async convertToRwf(amount: number, currency: Currency) {
    if (currency === Currency.RWF) {
      return { amount, currency: Currency.RWF, exchangeRate: null, rateDate: null, stale: false };
    }

    const where = { base_quote: { base: Currency.USD, quote: Currency.RWF } };
    let cached = await this.db.exchangeRate.findUnique({ where });
    let stale = false;
    if (!cached || Date.now() - cached.fetchedAt.getTime() >= dailyMs) {
      try {
        const response = await fetch("https://api.frankfurter.dev/v2/rate/USD/RWF", {
          signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) throw new Error(`Frankfurter returned ${response.status}`);
        const data = rateResponse.parse(await response.json());
        const values = {
          rate: data.rate,
          rateDate: new Date(data.date),
          fetchedAt: new Date(),
        };
        cached = await this.db.exchangeRate.upsert({
          where,
          create: { base: Currency.USD, quote: Currency.RWF, ...values },
          update: values,
        });
      } catch (error) {
        this.logger.warn(
          `USD/RWF refresh failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        if (!cached) {
          throw new ServiceUnavailableException(
            "Exchange rate unavailable. Please try again later.",
          );
        }
        stale = true;
      }
    }

    return {
      amount: Math.round(amount * Number(cached.rate)),
      currency: Currency.RWF,
      exchangeRate: cached.rate.toNumber(),
      rateDate: cached.rateDate.toISOString().slice(0, 10),
      stale,
    };
  }
}
