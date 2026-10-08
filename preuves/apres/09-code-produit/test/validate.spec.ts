import { describe, it, expect } from "vitest";
import { requireString, requireDate, requirePositiveInt, ValidationError } from "../src/lib/validate.js";

describe("validation des entrées", () => {
  it("normalise une chaîne et refuse les valeurs vides", () => {
    expect(requireString({ who: "  SORAN / AAA  " }, "who")).toBe("SORAN / AAA");
    for (const who of [undefined, null, "", "   ", 12]) {
      expect(() => requireString({ who }, "who")).toThrow(ValidationError);
    }
  });
  it("accepte uniquement des dates UTC réellement valides", () => {
    for (const date of ["2026-10-05T09:00:00Z", "2024-02-29T09:00:00.123Z"]) {
      expect(requireDate({ date }, "date")).toBe(date);
    }
    for (const date of ["2026-02-30T09:00:00Z", "2026-10-05", "2026-10-05T09:00:00+02:00", "demain", "2026-10-05T24:00:00Z"]) {
      expect(() => requireDate({ date }, "date")).toThrow(ValidationError);
    }
  });
  it("exige un entier strictement positif", () => {
    expect(requirePositiveInt({ people: 1 }, "people")).toBe(1);
    for (const people of [undefined, null, 0, -1, 1.5, "2", NaN, Infinity]) {
      expect(() => requirePositiveInt({ people }, "people")).toThrow(ValidationError);
    }
  });
});
