import { describe, it, expect } from "vitest";
import { rooms, findRoom, bookingsForRoom, nextBookingId } from "../src/store.js";

describe("store réel", () => {
  it("expose le catalogue attendu", () => {
    expect(rooms.map((room) => room.id)).toEqual(["amphi", "salle-a", "salle-b", "labo"]);
  });
  it("retrouve la bonne salle et refuse une salle inconnue", () => {
    expect(findRoom("salle-b")).toEqual({ id: "salle-b", name: "Salle B", capacity: 6, hourlyRate: 15 });
    expect(findRoom("cave")).toBeUndefined();
  });
  it("filtre les vraies réservations par salle", () => {
    expect(bookingsForRoom("salle-a").map((booking) => booking.id)).toEqual(["bk-1001"]);
    expect(bookingsForRoom("labo")).toEqual([]);
  });
  it("alloue des identifiants distincts", () => {
    const first = nextBookingId();
    expect(nextBookingId()).not.toBe(first);
  });
});
