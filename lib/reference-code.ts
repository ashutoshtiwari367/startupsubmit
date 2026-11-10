/**
 * Simple sequential ID helper starting from 50000000.
 */
export const INITIAL_SEQUENTIAL_ID = 50000000;

export function isValidSequentialId(id: unknown): boolean {
  const num = Number(id);
  return Number.isInteger(num) && num >= INITIAL_SEQUENTIAL_ID;
}
