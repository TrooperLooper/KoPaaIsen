import "./Dials.css";

const MONTHS = [
  { label: "Oct", value: 10 },
  { label: "Nov", value: 11 },
  { label: "Dec", value: 12 },
  { label: "Jan", value: 1 },
  { label: "Feb", value: 2 },
  { label: "Mar", value: 3 },
  { label: "Apr", value: 4 },
  { label: "May", value: 5 },
];

interface Props {
  value: number;
  onChange: (month: number) => void;
  disabled?: boolean;
}

export default function MonthDial({ value, onChange, disabled }: Props) {
  const index = MONTHS.findIndex((m) => m.value === value);
  const currentLabel = MONTHS[index]?.label ?? "Feb";

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <input
        type="range"
        min={0}
        max={MONTHS.length - 1}
        value={index === -1 ? 4 : index}
        disabled={disabled}
        onChange={(e) => onChange(MONTHS[Number(e.target.value)].value)}
        className="w-full accent-blue-400 cursor-pointer disabled:cursor-not-allowed"
      />
      <span className="w-full text-center text-3xl font-mono font-bold text-black">
        {currentLabel}
      </span>
    </div>
  );
}
