/**
 * Validation des charges utiles entrantes.
 */
export class ValidationError extends Error {
  status = 400;
}

export function requireString(payload: Record<string, unknown>, field: string): string {
  const value = payload[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new ValidationError(`champ manquant ou vide : ${field}`);
  }
  return value.trim();
}

export function requireDate(payload: Record<string, unknown>, field: string): string {
  const value = requireString(payload, field);
  const isoUtc = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
  const timestamp = Date.parse(value);
  const canonical = value.includes(".") ? value : value.replace("Z", ".000Z");
  if (!isoUtc.test(value) || Number.isNaN(timestamp) ||
      new Date(timestamp).toISOString() !== canonical) {
    throw new ValidationError(`date invalide : ${field}`);
  }
  return value;
}

export function requirePositiveInt(payload: Record<string, unknown>, field: string): number {
  const value = payload[field];
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new ValidationError(`entier positif attendu : ${field}`);
  }
  return value;
}

export default requireString;
