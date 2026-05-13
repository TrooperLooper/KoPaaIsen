import { useEffect } from "react";
import { MONTH_NAMES } from "../constants/months";

interface Props {
  year: number;
  month: number;
  thickness: number;
  isOpen: boolean;
  onClose: () => void;
  fdd?: number;
}

export default function CalculationModal({
  year,
  month,
  thickness,
  isOpen,
  onClose,
  fdd = 0,
}: Props) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const monthName = MONTH_NAMES[month] || "Februari";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-amber-50 rounded-lg max-w-2xl w-full p-4 sm:p-8 shadow-xl relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>

        <h2 className="bevan-regular text-3xl text-gray-900 my-4 text-center tracking-tight w-full">
          Hur vet vi om isen kunde bära?
        </h2>

        <p className="inter-regular text-gray-700 mb-8 text-base text-center">
          För att få svar på detta behöver vi veta två saker:
        </p>

        {/* Formula Sections Side by Side Mobile version */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {/* Gold's Formula Section */}
          <div>
            <div className="bg-black text-white p-3 text-center text-base font-bold tracking-wide mb-3">
              1. Hur tjock is en ko kräver
            </div>
            <div className="p-6 bg-amber-100 rounded-lg text-center flex flex-col h-full">
              <h3 className="inter-bold uppercase text-gray-900 mb-5 text-base">
                Golds formel
              </h3>

              <p className="inter-bold text-gray-900 mb-3 text-sm">
                P = A × H²
              </p>
              <div className="inter-regular text-gray-700 mb-3 text-sm text-center space-y-1">
                <div className="inter-italic">
                  där P = kons vikt (
                  <span className="text-green-700 font-bold">400</span> kg)
                </div>
                <div className="inter-italic">
                  A = isens bärförmåga per cm²{" "}
                  <p>
                    (<span className="text-green-700 font-bold">3.5</span>{" "}
                    kg/cm² för saltvatten)
                  </p>
                </div>
                <div className="inter-italic">H = tjockleken vi söker.</div>
              </div>
              <div className="bg-white p-4 rounded font-mono text-sm mt-auto text-center">
                <p className="inter-regular">
                  <span className="text-green-700 font-bold">400</span> ={" "}
                  <span>3.5</span> × H²
                </p>
                <p className="mt-2 inter-regular">
                  H² = <span className="text-red-700 font-bold">114.3</span>
                </p>
                <p className="mt-2 inter-regular">
                  H = <span className="text-red-700 font-bold">~11 cm</span>
                </p>
              </div>
            </div>
          </div>

          {/* Stefan's Formula Section */}
          <div>
            <div className="bg-black text-white p-3 mt-5 text-center text-base font-bold tracking-wide mb-3">
              2. Hur tjock isen faktiskt var
            </div>
            <div className="p-6 bg-amber-100 rounded-lg text-center flex flex-col h-full">
              <h3 className="inter-bold text-gray-900 mb-5 text-base uppercase">
                Stefans formel
              </h3>

              <p className="inter-italic text-gray-700 mb-3 text-sm">
                Bygger på netto frostgraddygn: varje grad under 0°C adderas per
                dag, varje grad över subtraheras. −5°C i tio dagar = 50
                frostgraddygn, men töväder äter upp dem igen.
              </p>
              <p className="inter-regular text-gray-700 mb-3 text-sm">
                Vintern fram till {monthName} {year} hade:{" "}
                <p>
                  {" "}
                  <span className="text-red-700 font-bold">
                    {fdd.toFixed(0)}{" "}
                  </span>
                  netto frostgraddygn{" "}
                </p>
              </p>
              <div className="bg-white p-4 rounded font-mono text-sm mt-auto text-center">
                <p className="inter-regular">
                  I = <span className="text-green-700 font-bold">2.5</span> × √
                  <span className="text-red-700 font-bold">
                    {fdd.toFixed(0)}
                  </span>
                </p>
                <p className="mt-2 inter-regular">
                  I = <span className="text-green-700 font-bold">2.5</span> ×{" "}
                  <span className="text-red-700 font-bold">
                    {Math.sqrt(fdd).toFixed(1)}
                  </span>
                </p>
                <p className="mt-2 inter-regular">
                  I ={" "}
                  <span className="text-red-700 font-bold">
                    {thickness.toFixed(1)} cm
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Result Section */}
        <div className="mt-12 mb-6 pb-6 text-center">
          <p className="inter-regular text-gray-700 mt-10 mb-4 text-base">
            Så minst <span className="font-bold text-red-700">11</span> cm is
            krävdes för en <span className="text-green-700 font-bold">400</span>{" "}
            kg ko,
            <p>
              och den tjockaste isen i {monthName} {year} var{" "}
              <span className="font-bold underline text-red-700">
                {thickness.toFixed(1)} cm
              </span>
              .
            </p>
          </p>
          {thickness >= 11 ? (
            <p className="bevan-regular text-green-700 font-semibold text-lg mt-8">
              ✓ Isen höll – kon blev kvar på benen!
            </p>
          ) : (
            <p className="bevan-regular text-red-700 font-semibold text-lg mt-8">
              ✗ Så tyvärr ingen ko på isen – isen hade inte hållit.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
