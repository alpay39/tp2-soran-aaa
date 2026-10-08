import { describe, it, expect } from "vitest";
import { Readable, Writable } from "node:stream";
import { createApp } from "../src/app.js";

interface JsonResponse {
  status: number;
  body: {
    slots?: unknown;
    [key: string]: unknown;
  };
}

async function call(path: string) {
  const app = createApp();
  const req = Object.assign(
    new Readable({
      read() {
        this.push(null);
      }
    }),
    {
      method: "GET",
      url: path,
      headers: {}
    }
  );
  const chunks: Buffer[] = [];
  const headers: Record<string, unknown> = {};

  return await new Promise<JsonResponse>((resolve, reject) => {
    const res = Object.assign(new Writable(), {
      statusCode: 200,
      setHeader(name: string, value: unknown) {
        headers[name.toLowerCase()] = value;
      },
      getHeader(name: string) {
        return headers[name.toLowerCase()];
      },
      removeHeader(name: string) {
        delete headers[name.toLowerCase()];
      },
      end(chunk?: string | Buffer, _encoding?: BufferEncoding, callback?: () => void) {
        if (chunk) {
          chunks.push(Buffer.from(chunk));
        }
        callback?.();
        resolve({
          status: res.statusCode,
          body: JSON.parse(Buffer.concat(chunks).toString())
        });
        return res;
      }
    });

    app(req as never, res as never, reject);
  });
}

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
