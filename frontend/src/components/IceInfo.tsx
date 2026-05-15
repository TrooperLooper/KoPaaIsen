import { useState, useEffect } from "react";
import { MONTH_NAMES } from "../constants/months";

interface Props {
  year: number;
  month: number;
  thickness?: number;
  onInfoClick?: () => void;
}

export default function IceInfo({
  year,
  month,
  thickness,
  onInfoClick,
}: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [year, month]);

  const monthName = MONTH_NAMES[month];

  return (
    <div
      className={`absolute top-[27%] flex items-center justify-center z-20 transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex items-center justify-center gap-2 sm:gap-3 px-1 sm:px-6 w-full">
        <p className="text-white text-xs sm:text-sm font-semibold text-center">
          I {monthName} {year} var isen {thickness?.toFixed(1) || "—"} cm.
          <br />
          Klicka för att se hur det beräknades
        </p>
        <button
          onClick={onInfoClick}
          aria-label="Visa beräkning"
          tabIndex={isVisible ? 0 : -1}
          className="info-button shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-colors cursor-pointer text-sm sm:text-base"
        >
          i
        </button>
      </div>
    </div>
  );
}
