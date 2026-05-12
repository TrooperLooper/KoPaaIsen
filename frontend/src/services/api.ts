import type { IceResult } from "../types/ice";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export async function fetchIceData(
  year: number,
  month: number
): Promise<IceResult> {
  const response = await fetch(`${BASE_URL}/api/ice/${year}/${month}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json() as Promise<IceResult>;
}
