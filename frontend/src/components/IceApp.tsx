import { useState, useEffect } from "react";
import { useIceData } from "../hooks/useIceData";
import YearDial from "./YearDial";
import MonthDial from "./MonthDial";
import TestButton from "./TestButton";
import CowAnimation from "./CowAnimation";
import Snowfall from "./Snowfall";
import IceInfo from "./IceInfo";
import CalculationModal from "./CalculationModal";

export default function IceApp() {
  const [year, setYear] = useState(1942);
  const [month, setMonth] = useState(2);
  const [animationKey, setAnimationKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { result, isLoading, error, fetchData, clearResult } = useIceData();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const parentWidth = Math.min(windowWidth - 32, 384);
  const desiredCanvasWidth = 1.8 * parentWidth;
  const maxCanvasWidth = windowWidth - 16; // Cap to viewport width with 8px margin
  const canvasWidth = Math.min(desiredCanvasWidth, maxCanvasWidth);
  const canvasHeight = Math.min(650, canvasWidth);
  const controlsOverlap = canvasHeight * (120 / 650);

  const handleReset = () => {
    clearResult();
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        padding: "1rem",
        overflowX: "hidden",
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
            height: `${canvasHeight}px`,
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
          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-xs text-center">
                <p className="font-semibold mb-2">Något gick fel</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}
          {result && (
            <IceInfo
              year={year}
              month={month}
              thickness={result.maxIceCm}
              onInfoClick={() => setIsModalOpen(true)}
            />
          )}
        </div>

        {/* Calculation Modal */}
        {result && (
          <CalculationModal
            year={year}
            month={month}
            thickness={result.maxIceCm}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            fdd={result.fddAtPeak}
          />
        )}

        {/* Controls - positioned below with negative margin to overlap canvas */}
        <div
          className="flex flex-col gap-6 px-4 py-12 z-10"
          style={{ marginTop: `-${controlsOverlap}px`, position: "relative" }}
        >
          {/* Dials side by side */}
          <div className="flex justify-center gap-4 sm:gap-8 px-4">
            <div className="flex-1">
              <YearDial value={year} onChange={setYear} disabled={isLoading || !!result} />
            </div>
            <div className="flex-1">
              <MonthDial
                value={month}
                onChange={setMonth}
                disabled={isLoading || !!result}
                year={year}
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

      {/* Info text block, now full width of canvas */}
      <div className="w-full text-[0.65rem] sm:text-xs text-gray-600 text-center space-y-1">
        <p>
          Historiska väderdata från Malmö (1917–2026) bearbetas i Express
          backend, beräknas mot fysiska formler, visualiseras i{" "}
        </p>
        <p>
          React frontend och animeras med handgjorda Rive-animationer. Data
          lagras i SQLite.{" "}
          <span className="font-bold">Skapad av Lars Munck 2026. </span>
          <a
            href="https://github.com/TrooperLooper/KoPaaIsen"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-800 font-bold"
          >
            Github
          </a>
        </p>
      </div>
    </div>
  );
}
