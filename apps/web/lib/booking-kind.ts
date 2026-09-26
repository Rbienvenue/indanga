export type BookingKind = "home" | "hotel" | "car";

export function getBookingKind(propertyType?: string): BookingKind {
  const normalized = propertyType?.trim().toLowerCase() ?? "";
  if (["car", "sedan", "suv", "pickup", "bus", "van"].some((value) => normalized.includes(value))) {
    return "car";
  }
  if (
    ["hotel", "lodge", "guesthouse", "guest house", "resort", "motel"].some((value) =>
      normalized.includes(value),
    )
  ) {
    return "hotel";
  }
  return "home";
}

export function getPriceUnit(propertyType?: string): string {
  const kind = getBookingKind(propertyType);
  if (kind === "hotel") return "/ night";
  if (kind === "car") return "/ day";
  return "/ month";
}
