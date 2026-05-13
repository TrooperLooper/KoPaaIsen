import { useState, useEffect } from "react";

interface Props {
  year: number;
  month: number;
  thickness?: number;
  onInfoClick?: () => void;
}

export default function IceInfo({ year, month, thickness, onInfoClick }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [year, month]);

  const monthNames = [
    "Januari",
    "Februari",
    "Mars",
    "April",
    "Maj",
    "Juni",
    "Juli",
    "Augusti",
    "September",
    "Oktober",
    "November",
    "December",
  ];

  const monthName = monthNames[month - 1] || "Februari";

  return (
    <div
      className={`absolute top-[27%] flex items-center justify-center z-20 transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center gap-4 px-6">
        <p className="text-white text-sm font-semibold">
          I {monthName} {year} var isen {thickness?.toFixed(1) || "—"} cm.
          Klicka för att se hur det beräknades
        </p>
        <button
          onClick={onInfoClick}
          className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
        >
          i
        </button>
      </div>
    </div>
  );
}
