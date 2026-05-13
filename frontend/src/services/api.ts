import type { IceResult } from "../types/ice";

export async function fetchIceData(
  year: number,
  month: number
): Promise<IceResult> {
  const response = await fetch(`/api/ice/${year}/${month}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json() as Promise<IceResult>;
}
