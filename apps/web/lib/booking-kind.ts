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
