import { useEffect, useState } from "react";

interface Props {
  onClick: () => void;
  onReset: () => void;
  isLoading: boolean;
  hasResult: boolean;
}

const ANIMATION_DURATION = 5000; // 5 seconds

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
  let isDisabled = false;

  if (isLoading) {
    bgColor = "#3b82f6"; // blue - loading
    text = "BERÄKNAR";
    isDisabled = true;
  } else if (hasResult && !animationComplete) {
    bgColor = "#3b82f6"; // blue - animation playing
    text = "BERÄKNAR";
    isDisabled = true;
  } else if (hasResult && animationComplete) {
    bgColor = "#eab308"; // yellow - show rewind
    text = "REWIND";
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
    width: "147px",
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
  };

  // Apply REWIND state styles
  if (hasResult && animationComplete) {
    buttonStyle = {
      ...buttonStyle,
      width: "145px",
      padding: "0.4rem 0.9rem",
      border: "2px solid #E6A100",
      animation: "rewindPulse 1.8s ease-in-out infinite",
    };
  }

  return (
    <>
      <style>{`
        @keyframes textPulse {
          0%   { text-shadow: 0 0 10px rgba(255, 255, 255, 0.5); }
          10%  { text-shadow: 0 0 0px rgba(255, 255, 255, 0); }
          20%  { text-shadow: 0 0 10px rgba(255, 255, 255, 0.5); }
          100% { text-shadow: 0 0 0px rgba(255, 255, 255, 0); }
        }

        @keyframes rewindPulse {
          0%, 100% {
            border-color: #E6A100;
            box-shadow: 0 0 8px rgba(230, 161, 0, 0.4);
          }
          50% {
            border-color: #E6A100;
            box-shadow: 0 0 18px rgba(230, 161, 0, 0.6);
          }
        }
      `}</style>
      <button onClick={handleClick} disabled={isDisabled} style={buttonStyle}>
        {isCalculating ? (
          <span style={{ animation: "textPulse 2.5s ease-in-out infinite" }}>
            {text}
          </span>
        ) : (
          text
        )}
      </button>
    </>
  );
}
