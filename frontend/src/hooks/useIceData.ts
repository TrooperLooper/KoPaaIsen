import { useState, useCallback } from "react";
import type { IceResult } from "../types/ice";
import { fetchIceData } from "../services/api";

interface IceDataState {
  result: IceResult | null;
  isLoading: boolean;
  error: string | null;
}

export function useIceData() {
  const [state, setState] = useState<IceDataState>({
    result: null,
    isLoading: false,
    error: null,
  });

  const fetchData = useCallback(async (year: number, month: number) => {
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
