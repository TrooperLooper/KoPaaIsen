import type { IceResult } from "../types/ice";

const API_URL = import.meta.env.VITE_API_URL || "";

export async function fetchIceData(
  year: number,
  month: number
): Promise<IceResult> {
  const url = `${API_URL}/api/ice?year=${year}&month=${month}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json() as Promise<IceResult>;
}
