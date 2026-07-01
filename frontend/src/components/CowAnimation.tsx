import { useEffect } from "react";
import {
  useRive,
  useViewModel,
  useViewModelInstance,
  useViewModelInstanceBoolean,
} from "@rive-app/react-canvas";

interface Props {
  holdsCow: boolean | null;
  isLoading: boolean;
}

export default function CowAnimation({ holdsCow, isLoading }: Props) {
  const { RiveComponent, rive } = useRive({
    src: "/cow_scene.riv",
    stateMachines: "CowMachine",
    autoplay: true,
  });

  const viewModel = useViewModel(rive, { name: "ViewModel1" });
  const viewModelInstance = useViewModelInstance(viewModel, { rive });

  const { setValue: setHoldsCow } = useViewModelInstanceBoolean(
    "holdsCow",
    viewModelInstance,
  );
  const { setValue: setHasResult } = useViewModelInstanceBoolean(
    "hasResult",
    viewModelInstance,
  );

  useEffect(() => {
    if (viewModelInstance) {
      const hasValidResult = holdsCow !== null && !isLoading;

      setHasResult(hasValidResult);
      setHoldsCow(holdsCow === null ? true : holdsCow);
    }
  }, [holdsCow, isLoading, viewModelInstance, setHoldsCow, setHasResult]);

  return (
    <>
      <div
        style={{ width: "100%", height: "100%", display: "flex" }}
        aria-hidden="true"
      >
        <RiveComponent />
      </div>
      <span className="sr-only">
        {holdsCow === null
          ? "Animationen laddas..."
          : holdsCow
            ? "Hurra! Kon står stadigt på isen med viftande öron och nöjd min."
            : "Åh nej! Kon sjunker genom isen med överraskad min, fladdrande öron och svans."}
      </span>
    </>
  );
}
