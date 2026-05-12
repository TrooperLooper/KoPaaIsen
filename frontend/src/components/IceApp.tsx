import { useState } from "react";
import { useIceData } from "../hooks/useIceData";
import YearDial from "./YearDial";
import MonthDial from "./MonthDial";
import TestButton from "./TestButton";
import CowAnimation from "./CowAnimation";
import Snowfall from "./Snowfall";
import IceInfo from "./IceInfo";

export default function IceApp() {
  const [year, setYear] = useState(1942);
  const [month, setMonth] = useState(2);
  const [animationKey, setAnimationKey] = useState(0);
  const { result, isLoading, fetchData, clearResult } = useIceData();

  const handleReset = () => {
    clearResult();
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "24rem",
          position: "relative",
          height: "fit-content",
          overflow: "visible",
        }}
      >
        {/* Animation area */}
        <div
          style={{
            height: "650px",
            width: "180%",
            position: "relative",
            overflow: "visible",
            marginLeft: "-40%",
          }}
          className="flex items-center justify-center"
        >
          <CowAnimation
            key={animationKey}
            holdsCow={result?.holdsCow ?? null}
            isLoading={isLoading}
          />
          <Snowfall resetTrigger={animationKey} />
          {result && (
            <IceInfo year={year} month={month} thickness={result.maxIceCm} />
          )}
        </div>

        {/* Controls - positioned below with negative margin to overlap canvas */}
        <div
          className="flex flex-col gap-6 px-4 py-12 z-10"
          style={{ marginTop: "-120px", position: "relative" }}
        >
          {/* Dials side by side */}
          <div className="flex justify-center gap-8 px-4">
            <div className="flex-1">
              <YearDial value={year} onChange={setYear} disabled={isLoading} />
            </div>
            <div className="flex-1">
              <MonthDial
                value={month}
                onChange={setMonth}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-center px-4">
            <TestButton
              onClick={() => fetchData(year, month)}
              onReset={handleReset}
              isLoading={isLoading}
              hasResult={!!result}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
