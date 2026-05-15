import "./Dials.css";
import { MONTHS } from "../constants/months";

interface Props {
  value: number;
  onChange: (month: number) => void;
  disabled?: boolean;
  year?: number;
}

export default function MonthDial({ value, onChange, disabled, year = 2000 }: Props) {
  const getValidMonthRange = (selectedYear: number) => {
    if (selectedYear === 1917) {
      return { minIndex: 5, maxIndex: 7 }; // Mar, Apr, May (indices 5, 6, 7)
    } else if (selectedYear === 2026) {
      return { minIndex: 3, maxIndex: 3 }; // Jan only (index 3)
    } else {
      return { minIndex: 0, maxIndex: 7 }; // Oct through May
    }
  };

  const { minIndex, maxIndex } = getValidMonthRange(year);
  const index = MONTHS.findIndex((m) => m.value === value);
  const validIndex = index >= minIndex && index <= maxIndex ? index : minIndex;
  const currentLabel = MONTHS[validIndex]?.label ?? "Feb";

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <input
        type="range"
        min={minIndex}
        max={maxIndex}
        value={validIndex}
        disabled={disabled}
        onChange={(e) => onChange(MONTHS[Number(e.target.value)].value)}
        className="w-full accent-blue-400 cursor-pointer disabled:cursor-not-allowed"
        aria-label="Månad"
        aria-valuetext={currentLabel}
      />
      <span className="w-full text-center text-3xl font-mono font-bold text-black">
        {currentLabel}
      </span>
    </div>
  );
}
