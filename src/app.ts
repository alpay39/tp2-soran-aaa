import express, { type ErrorRequestHandler } from "express";
import { roomsRouter } from "./routes/rooms.js";
import { bookingsRouter } from "./routes/bookings.js";

/** Construit l’API de réservation et ses routes. */
export function createApp() {
  const app = express();
  app.use(express.json());
  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/rooms", roomsRouter);
  app.use("/bookings", bookingsRouter);
  const errors: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    if (error instanceof SyntaxError && "status" in error && error.status === 400) {
      res.status(400).json({ error: "JSON invalide" });
      return;
    }
    res.status(500).json({ error: "erreur interne" });
  };
  app.use(errors);
  return app;
}
