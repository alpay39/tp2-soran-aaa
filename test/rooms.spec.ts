import { describe, it, expect } from "vitest";
import { call } from "./http.js";

describe("GET /rooms/:id/availability", () => {
  it("renvoie les creneaux libres d'une salle sur la journee demandee", async () => {
    const res = await call("/rooms/salle-a/availability?date=2026-10-05");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      room: { id: "salle-a", name: "Salle A", capacity: 12, hourlyRate: 25 },
      date: "2026-10-05",
      slots: [
        { startsAt: "2026-10-05T00:00:00Z", endsAt: "2026-10-05T09:00:00Z" },
        { startsAt: "2026-10-05T11:00:00Z", endsAt: "2026-10-06T00:00:00Z" }
      ]
    });
  });

  it("renvoie toute la journee quand la salle n'a pas de reservation ce jour-la", async () => {
    const res = await call("/rooms/salle-b/availability?date=2026-10-05");

    expect(res.status).toBe(200);
    expect(res.body.slots).toEqual([
      { startsAt: "2026-10-05T00:00:00Z", endsAt: "2026-10-06T00:00:00Z" }
    ]);
  });

  it("refuse une date manquante ou invalide", async () => {
    const missing = await call("/rooms/salle-a/availability");
    const invalid = await call("/rooms/salle-a/availability?date=2026-13-05");

    expect(missing.status).toBe(400);
    expect(invalid.status).toBe(400);
  });

  it("refuse une salle inconnue", async () => {
    const res = await call("/rooms/cave/availability?date=2026-10-05");

    expect(res.status).toBe(404);
  });
});

describe("catalogue et disponibilité", () => {
  it("sonde de vie, catalogue, détail et salle inconnue", async () => {
    expect(await call("/health")).toEqual({ status: 200, body: { ok: true } });
    expect((await call("/rooms")).body.rooms).toHaveLength(4);
    expect((await call("/rooms/salle-a")).body.bookings).toHaveLength(1);
    expect((await call("/rooms/cave")).status).toBe(404);
  });
  it.each(["", "2026-02-29", "2026-02-30", "2026-04-31", "2026-01-01T00:00:00Z", "2026-10-05&date=2026-10-06"]) ("refuse une date incorrecte : %s", async (date) => {
    expect((await call(`/rooms/salle-a/availability?date=${date}`)).status).toBe(400);
  });
  it("accepte une journée bissextile", async () => {
    expect((await call("/rooms/salle-a/availability?date=2024-02-29")).body.slots).toEqual([
      { startsAt: "2024-02-29T00:00:00Z", endsAt: "2024-03-01T00:00:00Z" }
    ]);
  });
});
