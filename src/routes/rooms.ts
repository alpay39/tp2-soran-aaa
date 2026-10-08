import { Router } from "express";
import { rooms, findRoom, bookingsForRoom } from "../store.js";
import availabilityForDay, { isIsoDay } from "../lib/availability.js";

export const roomsRouter = Router();

roomsRouter.get("/", (_req, res) => {
  res.json({ rooms });
});

roomsRouter.get("/:id/availability", (req, res) => {
  const room = findRoom(req.params.id);
  if (!room) {
    res.status(404).json({ error: "salle inconnue" });
    return;
  }

  const date = req.query.date;
  if (!isIsoDay(date)) {
    res.status(400).json({ error: "date attendue au format YYYY-MM-DD" });
    return;
  }

  res.json({
    room,
    date,
    slots: availabilityForDay(bookingsForRoom(room.id), date)
  });
});

roomsRouter.get("/:id", (req, res) => {
  const room = findRoom(req.params.id);
  if (!room) {
    res.status(404).json({ error: "salle inconnue" });
    return;
  }
  res.json({ room, bookings: bookingsForRoom(room.id) });
});
