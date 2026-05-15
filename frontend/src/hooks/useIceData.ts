import { useState, useCallback } from "react";
import type { IceResult } from "../types/ice";
import { fetchIceData } from "../services/api";

interface IceDataState {
  result: IceResult | null;
  isLoading: boolean;
  error: string | null;
}

const VALID_MONTHS = [10, 11, 12, 1, 2, 3, 4, 5];
const MIN_YEAR = 1917;
const MAX_YEAR = 2026;

export function useIceData() {
  const [state, setState] = useState<IceDataState>({
    result: null,
    isLoading: false,
    error: null,
  });

  const fetchData = useCallback(async (year: number, month: number) => {
    if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
      setState({
        result: null,
        isLoading: false,
        error: `Year must be between ${MIN_YEAR} and ${MAX_YEAR}`,
      });
      return;
    }

    if (!VALID_MONTHS.includes(month)) {
      setState({
        result: null,
        isLoading: false,
        error: "Month must be between October and May",
      });
      return;
    }

    setState({ result: null, isLoading: true, error: null });
    try {
      const result = await fetchIceData(year, month);
      setState({ result, isLoading: false, error: null });
    } catch (err) {
      setState({
        result: null,
        isLoading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }, []);

  const clearResult = useCallback(() => {
    setState({ result: null, isLoading: false, error: null });
  }, []);

  return { ...state, fetchData, clearResult };
}
