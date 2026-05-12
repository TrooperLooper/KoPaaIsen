import { useEffect } from "react";
import { useRive, useViewModel, useViewModelInstance, useViewModelInstanceBoolean } from "@rive-app/react-canvas";

interface Props {
  holdsCow: boolean | null;
  isLoading: boolean;
}

export default function CowAnimation({ holdsCow, isLoading }: Props) {
  const { RiveComponent, rive } = useRive({
    src: "/cow_scene.riv",
    stateMachines: "CowMachine",
    autoplay: true,
    fit: "fill",
    alignment: "center",
    autoBind: false,
  });

  const viewModel = useViewModel(rive, { name: "ViewModel1" });
  const viewModelInstance = useViewModelInstance(viewModel, { rive });

  const { setValue: setHoldsCow } = useViewModelInstanceBoolean(
    "holdsCow",
    viewModelInstance
  );
  const { setValue: setHasResult } = useViewModelInstanceBoolean(
    "hasResult",
    viewModelInstance
  );

  useEffect(() => {
    if (viewModelInstance) {
      const hasValidResult = holdsCow !== null && !isLoading;
      console.log("=== CowAnimation Effect ===");
      console.log("Input props:", { holdsCow, isLoading });
      console.log("Computed hasValidResult:", hasValidResult);
      console.log("About to set Rive properties:", { hasResult: hasValidResult, holdsCow: holdsCow === null ? true : holdsCow });

      setHasResult(hasValidResult);
      setHoldsCow(holdsCow === null ? true : holdsCow);

      console.log("Rive properties set. ViewModelInstance:", viewModelInstance);
    }
  }, [holdsCow, isLoading, viewModelInstance, setHoldsCow, setHasResult]);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex" }}>
      <RiveComponent />
    </div>
  );
}
