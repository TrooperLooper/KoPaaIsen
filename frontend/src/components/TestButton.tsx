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
  };


  // Apply REWIND state styles
  if (hasResult && animationComplete) {
    buttonStyle = {
      ...buttonStyle,
      animation: "bgPulse 1.8s ease-in-out infinite",
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
          }
          50% {
            background-color: #f0b923;
          }
        }
      `}</style>
      <button onClick={handleClick} disabled={isDisabled} style={buttonStyle}>
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
