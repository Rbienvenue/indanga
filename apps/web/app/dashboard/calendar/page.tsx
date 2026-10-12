import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-client";
import { HotelCalendar } from "@/components/dashboard/calendar/hotel-calendar";
import { CarCalendar } from "@/components/dashboard/calendar/car-calendar";

export default async function CalendarPage() {
  const { data: session } = await getSession({ fetchOptions: { headers: await headers() } });
  if (session?.user.role !== "landlord") {
    redirect("/dashboard");
  }
  if (session.user.providerType === "CAR") {
    return <CarCalendar />;
  }
  if (session.user.providerType !== "HOTEL") {
    redirect("/dashboard");
  }
  return <HotelCalendar />;
}
