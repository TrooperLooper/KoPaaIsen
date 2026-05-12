import { useMemo } from "react";
import "./Snowfall.css";

interface Snowflake {
  id: number;
  left: number;
  delay: number;
  duration: number;
}

interface Props {
  count?: number;
  resetTrigger?: number;
}

export default function Snowfall({ count = 50, resetTrigger = 0 }: Props) {
  const snowflakes = useMemo((): Snowflake[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + resetTrigger,
      left: Math.random() * 100,
      delay: Math.random() * 15,
      duration: 25 + Math.random() * 15,
    }));
  }, [count, resetTrigger]);

  return (
    <div className="snowfall">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: `${flake.left}%`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${flake.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
