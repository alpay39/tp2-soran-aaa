import { once } from "node:events";
import { createApp } from "../src/app.js";

export interface ApiResponse {
  status: number;
  body: Record<string, unknown>;
}

/** Exerce l'application via une vraie requête HTTP locale et ferme le serveur. */
export async function call(path: string, init?: RequestInit): Promise<ApiResponse> {
  const server = createApp().listen(0, "127.0.0.1");
  try {
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("port HTTP absent");
    const res = await fetch(`http://127.0.0.1:${address.port}${path}`, init);
    return { status: res.status, body: await res.json() as Record<string, unknown> };
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}
