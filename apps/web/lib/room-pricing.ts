type PricedRoom = { price: number | null | undefined };

export function getRoomPrices(rooms?: PricedRoom[] | null): number[] {
  if (!rooms || rooms.length === 0) return [];
  return rooms
    .map((room) => Number(room.price))
    .filter((value) => Number.isFinite(value) && value > 0);
}

export function getLowestRoomPrice(rooms?: PricedRoom[] | null): number | null {
  const prices = getRoomPrices(rooms);
  return prices.length > 0 ? Math.min(...prices) : null;
}

export function getDisplayPrice(
  price: number | null | undefined,
  rooms?: PricedRoom[] | null,
): { roomPrices: number[]; fromPrice: number | null; displayPrice: number | null; fromRooms: boolean } {
  const roomPrices = getRoomPrices(rooms);
  const fromPrice = roomPrices.length > 0 ? Math.min(...roomPrices) : null;
  const displayPrice = price ?? fromPrice;
  return {
    roomPrices,
    fromPrice,
    displayPrice,
    fromRooms: price == null && fromPrice != null,
  };
}
