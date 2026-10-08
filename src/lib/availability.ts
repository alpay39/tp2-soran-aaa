import type { Booking } from "../store.js";

export interface AvailabilitySlot {
  startsAt: string;
  endsAt: string;
}

function toIso(timestamp: number): string {
  return new Date(timestamp).toISOString().replace(".000Z", "Z");
}

function nextUtcDay(date: string): string {
  const start = Date.parse(`${date}T00:00:00Z`);
  return toIso(start + 24 * 60 * 60 * 1000);
}

export function dayBounds(date: string): AvailabilitySlot {
  return {
    startsAt: `${date}T00:00:00Z`,
    endsAt: nextUtcDay(date)
  };
}

export function isIsoDay(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed) && toIso(parsed).startsWith(value);
}

export function availabilityForDay(bookings: Booking[], date: string): AvailabilitySlot[] {
  const day = dayBounds(date);
  const dayStart = Date.parse(day.startsAt);
  const dayEnd = Date.parse(day.endsAt);
  const busySlots = bookings
    .map((booking) => ({
      startsAt: Math.max(Date.parse(booking.startsAt), dayStart),
      endsAt: Math.min(Date.parse(booking.endsAt), dayEnd)
    }))
    .filter((slot) => slot.startsAt < slot.endsAt)
    .sort((a, b) => a.startsAt - b.startsAt);

  const freeSlots: AvailabilitySlot[] = [];
  let cursor = dayStart;

  for (const busy of busySlots) {
    if (cursor < busy.startsAt) {
      freeSlots.push({ startsAt: toIso(cursor), endsAt: toIso(busy.startsAt) });
    }
    cursor = Math.max(cursor, busy.endsAt);
  }

  if (cursor < dayEnd) {
    freeSlots.push({ startsAt: toIso(cursor), endsAt: toIso(dayEnd) });
  }

  return freeSlots;
}

export default availabilityForDay;
