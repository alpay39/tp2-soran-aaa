import { Router } from "express";
import { overlaps } from "../lib/overlap.js";
import { rooms, findRoom, bookingsForRoom } from "../store.js";

export const roomsRouter = Router();

interface Slot {
  startsAt: string;
  endsAt: string;
}

const isoDay = /^\d{4}-\d{2}-\d{2}$/;

function dayBounds(date: unknown): Slot | undefined {
  if (typeof date !== "string" || !isoDay.test(date)) return undefined;
  const startsAt = `${date}T00:00:00.000Z`;
  const start = Date.parse(startsAt);
  if (Number.isNaN(start) || new Date(start).toISOString() !== startsAt) return undefined;
  const end = new Date(start + 24 * 60 * 60 * 1000).toISOString();
  return { startsAt, endsAt: end };
}

function freeSlotsForDay(roomId: string, day: Slot): Slot[] {
  const dayStart = Date.parse(day.startsAt);
  const dayEnd = Date.parse(day.endsAt);
  const busy = bookingsForRoom(roomId)
    .filter((booking) => overlaps(day.startsAt, day.endsAt, booking.startsAt, booking.endsAt))
    .map((booking) => ({
      start: Math.max(Date.parse(booking.startsAt), dayStart),
      end: Math.min(Date.parse(booking.endsAt), dayEnd)
    }))
    .sort((a, b) => a.start - b.start);

  const merged = busy.reduce<{ start: number; end: number }[]>((slots, slot) => {
    const previous = slots.at(-1);
    if (!previous || slot.start > previous.end) {
      slots.push(slot);
    } else {
      previous.end = Math.max(previous.end, slot.end);
    }
    return slots;
  }, []);

  const free: Slot[] = [];
  let cursor = dayStart;
  for (const slot of merged) {
    if (cursor < slot.start) {
      free.push({ startsAt: new Date(cursor).toISOString(), endsAt: new Date(slot.start).toISOString() });
    }
    cursor = Math.max(cursor, slot.end);
  }
  if (cursor < dayEnd) {
    free.push({ startsAt: new Date(cursor).toISOString(), endsAt: new Date(dayEnd).toISOString() });
  }
  return free;
}

roomsRouter.get("/", (_req, res) => {
  res.json({ rooms });
});

roomsRouter.get("/:id", (req, res) => {
  const room = findRoom(req.params.id);
  if (!room) {
    res.status(404).json({ error: "salle inconnue" });
    return;
  }
  res.json({ room, bookings: bookingsForRoom(room.id) });
});

roomsRouter.get("/:id/availability", (req, res) => {
  const room = findRoom(req.params.id);
  if (!room) {
    res.status(404).json({ error: "salle inconnue" });
    return;
  }

  const day = dayBounds(req.query.date);
  if (!day) {
    res.status(400).json({ error: "date invalide : date" });
    return;
  }

  res.json({ roomId: room.id, date: req.query.date, slots: freeSlotsForDay(room.id, day) });
});
