import { BadRequestException } from "@nestjs/common";
import { Currency, type Prisma } from "@indanga/db";

export function validateCurrencyPrices(currency: Currency, prices: (number | null | undefined)[]) {
  if (
    currency === Currency.RWF &&
    prices.some((price) => price != null && !Number.isInteger(price))
  ) {
    throw new BadRequestException("RWF prices must be whole francs");
  }
}

export function currencyPriceFilter(
  min: number | undefined,
  max: number | undefined,
  rate: number,
): Prisma.HouseWhereInput {
  const rwf = { gte: min, lte: max };
  const usd = {
    gte: min === undefined ? undefined : min / rate,
    lte: max === undefined ? undefined : max / rate,
  };
  return {
    OR: [
      { currency: Currency.RWF, OR: [{ price: rwf }, { rooms: { some: { price: rwf } } }] },
      { currency: Currency.USD, OR: [{ price: usd }, { rooms: { some: { price: usd } } }] },
    ],
  };
}
