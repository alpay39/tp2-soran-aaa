import { beforeEach, describe, expect, it } from "vitest";
import { bookings } from "../src/store.js";
import { call } from "./http.js";

const initial = bookings.map((booking) => ({ ...booking }));
beforeEach(() => bookings.splice(0, bookings.length, ...initial.map((booking) => ({ ...booking }))));

describe("GET /rooms/:id/availability", () => {
  it("renvoie toute la journee quand la salle est libre", async () => {
    const result = await call("/rooms/labo/availability?date=2026-11-03");

    expect(result).toEqual({
      status: 200,
      body: {
        roomId: "labo",
        date: "2026-11-03",
        slots: [
          { startsAt: "2026-11-03T00:00:00.000Z", endsAt: "2026-11-04T00:00:00.000Z" }
        ]
      }
    });
  });

  it("retire les reservations de la journee demandee", async () => {
    const result = await call("/rooms/salle-a/availability?date=2026-10-05");

    expect(result).toEqual({
      status: 200,
      body: {
        roomId: "salle-a",
        date: "2026-10-05",
        slots: [
          { startsAt: "2026-10-05T00:00:00.000Z", endsAt: "2026-10-05T09:00:00.000Z" },
          { startsAt: "2026-10-05T11:00:00.000Z", endsAt: "2026-10-06T00:00:00.000Z" }
        ]
      }
    });
  });

  it("borne au jour UTC et fusionne les reservations contigues ou chevauchantes", async () => {
    bookings.push(
      {
        id: "bk-midnight",
        roomId: "labo",
        who: "nuit",
        people: 2,
        startsAt: "2026-11-02T22:00:00Z",
        endsAt: "2026-11-03T02:00:00Z",
        price: 160
      },
      {
        id: "bk-early",
        roomId: "labo",
        who: "matin",
        people: 2,
        startsAt: "2026-11-03T02:00:00Z",
        endsAt: "2026-11-03T04:00:00Z",
        price: 80
      },
      {
        id: "bk-overlap",
        roomId: "labo",
        who: "support",
        people: 2,
        startsAt: "2026-11-03T03:30:00Z",
        endsAt: "2026-11-03T05:00:00Z",
        price: 60
      }
    );

    const result = await call("/rooms/labo/availability?date=2026-11-03");

    expect(result.body.slots).toEqual([
      { startsAt: "2026-11-03T05:00:00.000Z", endsAt: "2026-11-04T00:00:00.000Z" }
    ]);
  });

  it("renvoie 404 pour une salle inconnue", async () => {
    expect(await call("/rooms/cave/availability?date=2026-11-03")).toEqual({
      status: 404,
      body: { error: "salle inconnue" }
    });
  });

  it.each([
    "/rooms/labo/availability",
    "/rooms/labo/availability?date=2026-02-30",
    "/rooms/labo/availability?date=2026-11-03T00:00:00Z",
    "/rooms/labo/availability?date=demain",
    "/rooms/labo/availability?date=2026-11-03&date=2026-11-04"
  ])("refuse une date absente, impossible, repetee ou mal formee : %s", async (path) => {
    expect(await call(path)).toEqual({
      status: 400,
      body: { error: "date invalide : date" }
    });
  });
});
