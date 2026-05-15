import { IceResultSchema } from "../schemas";
import type { IceResult } from "../types/ice";

const API_URL = import.meta.env.VITE_API_URL || "";

export async function fetchIceData(
  year: number,
  month: number
): Promise<IceResult> {
  const url = `${API_URL}/api/ice?year=${year}&month=${month}`;

  const response = await fetch(url);

  if (!response.ok) {
    let details = "";
    try {
      const body = await response.json();
      details = body?.details || body?.error || "";
    } catch {
      // ignore JSON parse failure on error response
    }
    throw new Error(
      details || `Server error ${response.status}`
    );
  }

  const data = await response.json();
  return IceResultSchema.parse(data);
}
