import { useState, useEffect, useRef } from "react";
import { useIceData } from "../hooks/useIceData";
import YearDial from "./YearDial";
import MonthDial from "./MonthDial";
import TestButton from "./TestButton";
import CowAnimation from "./CowAnimation";
import Snowfall from "./Snowfall";
import IceInfo from "./IceInfo";
import CalculationModal from "./CalculationModal";
import { calculateCanvasMetrics } from "../utils/canvasMetrics";
import { MONTH_NAMES } from "../constants/months";

export default function IceApp() {
  const [year, setYear] = useState(1942);
  const [month, setMonth] = useState(2);
  const [animationKey, setAnimationKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [liveText, setLiveText] = useState<string | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const { result, isLoading, error, fetchData, clearResult } = useIceData();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const openModal = () => {
    triggerRef.current = document.activeElement as HTMLElement;
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!result) {
      setLiveText(null);
      return;
    }

    const monthName = MONTH_NAMES[month] || "Februari";
    const thickness = result.maxIceCm.toFixed(1);
    const holdsCow = result.holdsCow;

    const timer = setTimeout(() => {
      let announcement: string;
      if (holdsCow) {
        announcement = `Isen håller! I ${monthName} ${year} var isen ${thickness} cm – tjock nog för en ko. Kon står säkert på isen. Tryck REWIND för att prova ett annat år.`;
      } else {
        announcement = `Isen håller inte. I ${monthName} ${year} var isen ${thickness} cm – för tunn för en ko. Kon faller igenom isen. Tryck REWIND för att prova ett annat år.`;
      }
      setLiveText(announcement);
    }, 2000);

    return () => clearTimeout(timer);
  }, [result, month, year]);

  const { canvasHeight, controlsOverlap } = calculateCanvasMetrics(windowWidth);

  const handleReset = () => {
    clearResult();
    setLiveText(null);
    setAnimationKey((prev) => prev + 1);
  };

  return (
    <main
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
            <div className="absolute inset-0 flex items-center justify-center" role="alert">
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
              onInfoClick={openModal}
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
            onClose={closeModal}
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
              <YearDial
                value={year}
                onChange={setYear}
                disabled={isLoading || !!result}
              />
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

      {/* Screen reader result announcement */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveText}
      </div>
    </main>
  );
}
