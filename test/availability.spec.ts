import { describe, it, expect } from "vitest";
import availabilityForDay from "../src/lib/availability.js";
import type { Booking } from "../src/store.js";

function booking(id: string, startsAt: string, endsAt: string): Booking {
  return {
    id,
    roomId: "salle-a",
    who: "equipe",
    people: 4,
    startsAt,
    endsAt,
    price: 0
  };
}

describe("availabilityForDay", () => {
  it("fusionne les reservations qui se chevauchent", () => {
    const slots = availabilityForDay(
      [
        booking("bk-1", "2026-10-05T09:00:00Z", "2026-10-05T11:00:00Z"),
        booking("bk-2", "2026-10-05T10:00:00Z", "2026-10-05T12:00:00Z")
      ],
      "2026-10-05"
    );

    expect(slots).toEqual([
      { startsAt: "2026-10-05T00:00:00Z", endsAt: "2026-10-05T09:00:00Z" },
      { startsAt: "2026-10-05T12:00:00Z", endsAt: "2026-10-06T00:00:00Z" }
    ]);
  });

  it("borne les reservations qui depassent la journee demandee", () => {
    const slots = availabilityForDay(
      [
        booking("bk-1", "2026-10-04T22:00:00Z", "2026-10-05T02:00:00Z"),
        booking("bk-2", "2026-10-05T22:00:00Z", "2026-10-06T02:00:00Z")
      ],
      "2026-10-05"
    );

    expect(slots).toEqual([
      { startsAt: "2026-10-05T02:00:00Z", endsAt: "2026-10-05T22:00:00Z" }
    ]);
  });
});

describe("bornes de disponibilité", () => {
  it("ignore les réservations d'un autre jour", () => {
    expect(availabilityForDay([booking("autre", "2026-10-04T09:00:00Z", "2026-10-04T11:00:00Z")], "2026-10-05")).toEqual([
      { startsAt: "2026-10-05T00:00:00Z", endsAt: "2026-10-06T00:00:00Z" }
    ]);
  });
  it("ne renvoie rien pour une journée totalement occupée", () => {
    expect(availabilityForDay([booking("plein", "2026-10-05T00:00:00Z", "2026-10-06T00:00:00Z")], "2026-10-05")).toEqual([]);
  });
  it("trie les créneaux et ne crée pas de trou entre deux réservations adjacentes", () => {
    expect(availabilityForDay([
      booking("deux", "2026-10-05T12:00:00Z", "2026-10-06T00:00:00Z"),
      booking("un", "2026-10-05T00:00:00Z", "2026-10-05T12:00:00Z")
    ], "2026-10-05")).toEqual([]);
  });
});
