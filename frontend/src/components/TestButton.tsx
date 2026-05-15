import { useEffect, useState } from "react";

interface Props {
  onClick: () => void;
  onReset: () => void;
  isLoading: boolean;
  hasResult: boolean;
}

const ANIMATION_DURATION = 2000; // 2 seconds

export default function TestButton({
  onClick,
  onReset,
  isLoading,
  hasResult,
}: Props) {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (hasResult && !isLoading) {
      setAnimationComplete(false);
      const timer = setTimeout(() => {
        setAnimationComplete(true);
      }, ANIMATION_DURATION);
      return () => clearTimeout(timer);
    }
  }, [hasResult, isLoading]);

  let bgColor = "#22c55e"; // green - initial
  let text = "TESTA ISEN";
  let ariaLabel = "Testa isen";
  let isDisabled = false;

  if (isLoading) {
    bgColor = "#3b82f6"; // blue - loading
    text = "BERÄKNAR";
    ariaLabel = "Beräknar, vänta";
    isDisabled = true;
  } else if (hasResult && !animationComplete) {
    bgColor = "#3b82f6"; // blue - animation playing
    text = "BERÄKNAR";
    ariaLabel = "Beräknar, vänta";
    isDisabled = true;
  } else if (hasResult && animationComplete) {
    bgColor = "#eab308"; // yellow - show rewind
    text = "REWIND";
    ariaLabel = "Rewind, testa ett annat år";
    isDisabled = false;
  }

  const handleClick = () => {
    if (animationComplete && hasResult) {
      onReset();
    } else if (!isLoading && !hasResult) {
      onClick();
    }
  };

  const isCalculating = isLoading || (hasResult && !animationComplete);

  let buttonStyle: React.CSSProperties = {
    backgroundColor: bgColor,
    width: "145px",
    padding: "0.5rem 1rem",
    borderRadius: "2rem",
    color: "white",
    fontSize: "1rem",
    fontWeight: "bold",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    border: "none",
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.5 : 1,
    transition: "all 0.3s ease",
    margin: "0 auto",
    display: "block",
    whiteSpace: "nowrap",
    pointerEvents: isDisabled ? "none" : "auto",
  };


  // Apply REWIND state styles
  if (hasResult && animationComplete) {
    buttonStyle = {
      ...buttonStyle,
      animation: "bgPulse 2.8s cubic-bezier(0.34, 1.56, 0.64, 1) infinite",
    };
  }

  return (
    <>
      <style>{`
        @keyframes charReveal {
          0%, 5% { opacity: 0; }
          10%, 100% { opacity: 1; }
        }

        @keyframes bgPulse {
          0%, 100% {
            background-color: #eab308;
            opacity: 0.9;
            transform: scale(1);
          }
          50% {
            background-color: #fcd34d;
            opacity: 1;
            transform: scale(1.12);
          }
        }
      `}</style>
      <button onClick={handleClick} aria-disabled={isDisabled} tabIndex={0} aria-label={ariaLabel} style={buttonStyle}>
        {isCalculating
          ? text.split("").map((char, i) => (
              <span
                key={i}
                style={{
                  animation: `charReveal 2.5s ease-in-out ${i * 0.15}s infinite`,
                  display: "inline",
                }}
              >
                {char}
              </span>
            ))
          : text}
      </button>
    </>
  );
}
