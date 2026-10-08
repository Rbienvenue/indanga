"use client";

import FullCalendar, {
  useCalendarController,
  type DatesSetInfo,
  type EventInput,
} from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import themePlugin from "@fullcalendar/react/themes/monarch";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/monarch/theme.css";
import "./hotel-calendar.css";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { BedDouble, ChevronLeft, ChevronRight, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { BookingStatus } from "@indanga/db";
import type { ApiResponse } from "@/@types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetcher } from "@/lib/fetcher";
import { formatPrice } from "@/lib/utils";

const plugins = [themePlugin, dayGridPlugin, interactionPlugin];
const emptyBookings: CalendarBooking[] = [];
const statusStyles = {
  REQUESTED: { label: "Request", color: "#b45309", className: "calendar-request" },
  AWAITING_PAYMENT: { label: "Payment hold", color: "#7c3aed", className: "calendar-hold" },
  CONFIRMED: { label: "Confirmed", color: "#15803d", className: "calendar-confirmed" },
  APPROVED: { label: "Confirmed", color: "#15803d", className: "calendar-confirmed" },
  COMPLETED: { label: "Completed", color: "#64748b", className: "calendar-completed" },
} as const;

type CalendarBooking = {
  id: string;
  bookingId: string | null;
  houseId: string;
  roomTypeId: string | null;
  roomCount: number | null;
  status: BookingStatus;
  checkIn: string | null;
  checkOut: string | null;
  paymentDeadline: string | null;
  totalAmount: number | null;
  client: { name: string; email: string };
  roomType: { name: string } | null;
  house: { name: string };
};

type CalendarData = {
  properties: {
    id: string;
    name: string;
    rooms: {
      id: string;
      name: string;
      totalRooms: number;
      bookedRooms: number;
      heldRooms: number;
      availableRooms: number;
    }[];
  }[];
  bookings: CalendarBooking[];
};

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function HotelCalendar() {
  const controller = useCalendarController();
  const [range, setRange] = useState<{ start: string; end: string; title: string; view: string }>();
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Kigali" }),
  );
  const [propertyId, setPropertyId] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const calendarQuery = useQuery<ApiResponse<CalendarData>>({
    queryKey: ["booking-calendar", range?.start, range?.end, selectedDate],
    queryFn: () =>
      fetcher(
        `/bookings/calendar?${new URLSearchParams({ start: range!.start, end: range!.end, date: selectedDate })}`,
      ),
    enabled: Boolean(range),
    refetchInterval: 30_000,
  });
  const properties = calendarQuery.data?.data.properties ?? [];
  const bookings = calendarQuery.data?.data.bookings ?? emptyBookings;
  const visibleBookings = useMemo(
    () => bookings.filter((booking) => propertyId === "all" || booking.houseId === propertyId),
    [bookings, propertyId],
  );
  const visibleProperties = properties.filter(
    (property) => propertyId === "all" || property.id === propertyId,
  );
  const selectedBooking = visibleBookings.find((booking) => booking.id === selectedId);
  const events = useMemo<EventInput[]>(
    () =>
      visibleBookings.flatMap((booking) => {
        if (!booking.checkIn || !booking.checkOut || !(booking.status in statusStyles)) return [];
        const style = statusStyles[booking.status as keyof typeof statusStyles];
        return [
          {
            id: booking.id,
            title: `${booking.client.name} · ${booking.roomType?.name ?? "Room"} · ${style.label}`,
            start: booking.checkIn.slice(0, 10),
            // FullCalendar's exclusive event end matches the booking checkout date.
            end: booking.checkOut.slice(0, 10),
            allDay: true,
            color: style.color,
            contrastColor: "#ffffff",
            className: style.className,
          },
        ];
      }),
    [visibleBookings],
  );
  const handleDatesSet = useCallback((info: DatesSetInfo) => {
    const start = info.startStr.slice(0, 10);
    const end = info.endStr.slice(0, 10);
    setRange({ start, end, title: info.view.title, view: info.view.type });
    setSelectedDate((date) =>
      date >= start && date < end ? date : info.view.currentStart.toISOString().slice(0, 10),
    );
  }, []);
  const selectedDayBookings = visibleBookings.filter(
    (booking) =>
      booking.checkIn &&
      booking.checkOut &&
      booking.checkIn.slice(0, 10) <= selectedDate &&
      booking.checkOut.slice(0, 10) > selectedDate,
  );

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Room availability, guest arrivals, and stays in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={propertyId} onValueChange={setPropertyId}>
            <SelectTrigger aria-label="Filter by hotel" className="min-w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All hotels</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            aria-label="Refresh calendar"
            disabled={calendarQuery.isFetching}
            onClick={() => void calendarQuery.refetch()}
          >
            <RefreshCw className={calendarQuery.isFetching ? "animate-spin" : ""} />
          </Button>
        </div>
      </header>
      {calendarQuery.isError ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm"
        >
          Could not load the calendar.{" "}
          <button className="underline" onClick={() => void calendarQuery.refetch()}>
            Try again
          </button>
        </div>
      ) : null}
      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
        <Card className="min-w-0 gap-0 overflow-hidden py-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Previous period"
                onClick={() => controller.prev()}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Next period"
                onClick={() => controller.next()}
              >
                <ChevronRight />
              </Button>
              <h2 className="ml-1 text-base font-semibold sm:text-lg">
                {range?.title ?? "Calendar"}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  controller.today();
                  setSelectedDate(
                    new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Kigali" }),
                  );
                }}
              >
                Today
              </Button>
              <div className="flex rounded-lg border p-0.5">
                {(
                  [
                    ["dayGridMonth", "Month"],
                    ["dayGridWeek", "Week"],
                  ] as const
                ).map(([view, label]) => (
                  <Button
                    key={view}
                    variant={range?.view === view ? "secondary" : "ghost"}
                    size="sm"
                    aria-pressed={range?.view === view}
                    onClick={() => controller.changeView(view)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto p-3 sm:p-5" aria-busy={calendarQuery.isFetching}>
            <div className="hotel-calendar min-w-[520px]">
              <FullCalendar
                controller={controller}
                plugins={plugins}
                initialView="dayGridMonth"
                initialDate={selectedDate}
                now={new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Kigali" })}
                timeZone="UTC"
                headerToolbar={false}
                height="auto"
                fixedWeekCount={false}
                dayMaxEvents={3}
                eventDisplay="block"
                editable={false}
                events={events}
                datesSet={handleDatesSet}
                dateClick={(info) => setSelectedDate(info.dateStr)}
                eventClick={(info) => setSelectedId(info.event.id)}
                dayCellClass={(info) =>
                  info.date.toISOString().slice(0, 10) === selectedDate
                    ? "calendar-selected-day"
                    : ""
                }
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t px-5 py-4 text-xs text-muted-foreground">
            {(["CONFIRMED", "AWAITING_PAYMENT", "REQUESTED", "COMPLETED"] as const).map(
              (status) => (
                <span key={status} className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: statusStyles[status].color }}
                  />
                  {statusStyles[status].label}
                </span>
              ),
            )}
          </div>
        </Card>
        <aside className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BedDouble className="size-4 text-primary" />
                Room availability
              </CardTitle>
              <label htmlFor="availability-date" className="text-xs text-muted-foreground">
                Choose a day or click the calendar
              </label>
              <Input
                id="availability-date"
                type="date"
                value={selectedDate}
                onChange={(event) => {
                  if (event.target.value) {
                    setSelectedDate(event.target.value);
                    controller.gotoDate(event.target.value);
                  }
                }}
              />
            </CardHeader>
            <CardContent className="space-y-5">
              {calendarQuery.isLoading ? (
                <Skeleton className="h-44" />
              ) : calendarQuery.isError ? (
                <p className="text-sm text-muted-foreground">Availability could not be loaded.</p>
              ) : visibleProperties.length === 0 ? (
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    Add a hotel and room types to see availability.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/properties/new">Add hotel</Link>
                  </Button>
                </div>
              ) : (
                visibleProperties.map((property) => (
                  <div key={property.id} className="space-y-3">
                    <Link
                      href={`/properties/${property.id}`}
                      className="text-sm font-semibold hover:underline"
                    >
                      {property.name}
                    </Link>
                    {property.rooms.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No room types configured.</p>
                    ) : (
                      property.rooms.map((room) => (
                        <div key={room.id} className="rounded-lg border p-3">
                          <div className="flex items-center justify-between gap-2 text-sm">
                            <span className="font-medium">{room.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {room.totalRooms} total
                            </span>
                          </div>
                          <p className="mt-2 text-lg font-semibold text-primary">
                            {room.availableRooms}
                            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                              available
                            </span>
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {room.bookedRooms} confirmed · {room.heldRooms} held for payment
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{dateLabel(selectedDate)}</CardTitle>
              <p className="text-xs text-muted-foreground">Bookings for this day</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {calendarQuery.isLoading ? (
                <Skeleton className="h-20" />
              ) : selectedDayBookings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No stays or requests for this day.</p>
              ) : (
                selectedDayBookings.map((booking) => (
                  <button
                    key={booking.id}
                    className="w-full rounded-lg border p-3 text-left hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring"
                    onClick={() => setSelectedId(booking.id)}
                  >
                    <p className="text-sm font-medium">{booking.client.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {booking.roomType?.name} · {booking.roomCount ?? 1} room(s)
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {booking.checkIn?.slice(0, 10) === selectedDate ? "Arrival · " : ""}
                      {statusStyles[booking.status as keyof typeof statusStyles]?.label}
                    </p>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
          <p className="px-1 text-xs leading-relaxed text-muted-foreground">
            Requests do not reserve rooms. Accepted requests hold rooms for 30 minutes while the
            guest pays. Unpaid holds release at the deadline.
          </p>
        </aside>
      </section>
      <Dialog
        open={Boolean(selectedBooking)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedBooking?.client.name}</DialogTitle>
            <DialogDescription>{selectedBooking?.bookingId ?? "Booking details"}</DialogDescription>
          </DialogHeader>
          {selectedBooking ? (
            <div className="space-y-4">
              <div>
                <p className="font-semibold">{selectedBooking.house.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedBooking.roomType?.name} · {selectedBooking.roomCount ?? 1} room(s)
                </p>
              </div>
              <Badge variant="secondary">
                {statusStyles[selectedBooking.status as keyof typeof statusStyles]?.label}
              </Badge>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Check-in</dt>
                  <dd className="mt-1 font-medium">
                    {selectedBooking.checkIn ? dateLabel(selectedBooking.checkIn) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Check-out</dt>
                  <dd className="mt-1 font-medium">
                    {selectedBooking.checkOut ? dateLabel(selectedBooking.checkOut) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Total</dt>
                  <dd className="mt-1 font-medium">
                    {selectedBooking.totalAmount != null
                      ? formatPrice(selectedBooking.totalAmount)
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Guest email</dt>
                  <dd className="mt-1 break-all font-medium">{selectedBooking.client.email}</dd>
                </div>
              </dl>
              {selectedBooking.status === "AWAITING_PAYMENT" && selectedBooking.paymentDeadline ? (
                <p className="rounded-lg bg-muted p-3 text-sm">
                  Payment hold ends{" "}
                  {new Date(selectedBooking.paymentDeadline).toLocaleString("en-GB", {
                    timeZone: "Africa/Kigali",
                  })}{" "}
                  (Kigali).
                </p>
              ) : null}
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/bookings">
                  Manage bookings
                  <ExternalLink />
                </Link>
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </main>
  );
}
