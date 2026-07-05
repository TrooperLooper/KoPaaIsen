import "./Dials.css";

interface Props {
  value: number;
  onChange: (year: number) => void;
  disabled?: boolean;
}

export default function YearDial({ value, onChange, disabled }: Props) {
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <input
        type="range"
        min={1917}
        max={2026}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-400 cursor-pointer disabled:cursor-not-allowed"
        aria-label="År"
        aria-valuetext={String(value)}
        aria-valuenow={value}
        aria-valuemin={1917}
        aria-valuemax={2026}
      />
      <span className="w-full text-center text-3xl font-mono font-bold text-black">
        {value}
      </span>
    </div>
  );
}
