import { describe, it, expect, beforeEach } from "vitest";
import { bookings } from "../src/store.js";
import { call } from "./http.js";

const initial = bookings.map((booking) => ({ ...booking }));
beforeEach(() => bookings.splice(0, bookings.length, ...initial.map((booking) => ({ ...booking }))));

const post = (payload: unknown) =>
  call("/bookings", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

describe("POST /bookings", () => {
  it("refuse une salle inconnue", async () => {
    const res = await post({
      roomId: "cave",
      who: "moi",
      people: 2,
      startsAt: "2026-11-02T09:00:00Z",
      endsAt: "2026-11-02T10:00:00Z"
    });
    expect(res.status).toBe(400);
  });

  it("refuse un depassement de capacite", async () => {
    const res = await post({
      roomId: "salle-b",
      who: "moi",
      people: 40,
      startsAt: "2026-11-02T09:00:00Z",
      endsAt: "2026-11-02T10:00:00Z"
    });
    expect(res.status).toBe(400);
  });

  it("refuse une date invalide", async () => {
    const res = await post({
      roomId: "salle-b",
      who: "moi",
      people: 2,
      startsAt: "la semaine prochaine",
      endsAt: "2026-11-02T10:00:00Z"
    });
    expect(res.status).toBe(400);
  });

  it("refuse un creneau qui finit avant de commencer", async () => {
    const res = await post({
      roomId: "salle-b",
      who: "moi",
      people: 2,
      startsAt: "2026-11-02T11:00:00Z",
      endsAt: "2026-11-02T10:00:00Z"
    });
    expect(res.status).toBe(400);
  });

  it("accepte une reservation qui commence quand la precedente finit", async () => {
    const first = await post({
      roomId: "labo",
      who: "equipe-1",
      people: 4,
      startsAt: "2026-11-03T09:00:00Z",
      endsAt: "2026-11-03T10:00:00Z"
    });
    expect(first.status).toBe(201);

    const second = await post({
      roomId: "labo",
      who: "equipe-2",
      people: 4,
      startsAt: "2026-11-03T10:00:00Z",
      endsAt: "2026-11-03T11:00:00Z"
    });
    expect(second.status).toBe(201);
  });
});

const payload = {
  roomId: "salle-b", who: "SORAN / AAA", people: 6,
  startsAt: "2026-11-07T09:00:00Z", endsAt: "2026-11-07T11:00:00Z"
};

describe("parcours HTTP de réservation", () => {
  it("crée, liste, refuse le conflit, puis annule", async () => {
    const created = await post(payload);
    expect(created.status).toBe(201);
    const booking = created.body.booking as { id: string; price: number };
    expect(booking.price).toBe(50); // 2 * 15 + 20, samedi.
    const listed = await call("/bookings?roomId=salle-b");
    expect(listed.body.bookings).toEqual([created.body.booking]);
    const all = await call("/bookings");
    expect(all.body.bookings).toContainEqual(created.body.booking);
    expect((await post(payload)).status).toBe(409);
    const cancelled = await call(`/bookings/${booking.id}`, { method: "DELETE" });
    expect(cancelled).toEqual({ status: 200, body: { cancelled: booking.id } });
    expect((await call(`/bookings/${booking.id}`, { method: "DELETE" })).status).toBe(404);
    expect((await call("/bookings?roomId=salle-b")).body.bookings).toEqual([]);
  });
  it.each([0, -1, 1.5, "6", null])("refuse un nombre de personnes invalide : %s", async (people) => {
    expect((await post({ ...payload, people })).status).toBe(400);
  });
  it.each([null, [], {}, { ...payload, who: "   " }, { ...payload, startsAt: "2026-02-30T09:00:00Z" }, { ...payload, endsAt: payload.startsAt }])("refuse une charge invalide : %j", async (body) => {
    expect((await post(body)).status).toBe(400);
  });
  it("renvoie une erreur JSON pour un JSON malformé", async () => {
    const result = await call("/bookings", { method: "POST", headers: { "content-type": "application/json" }, body: "{invalide" });
    expect(result).toEqual({ status: 400, body: { error: "JSON invalide" } });
  });
});
