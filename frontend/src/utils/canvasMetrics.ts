const PARENT_MAX_WIDTH = 384; // max-w-96 in Tailwind
const PARENT_MARGIN = 32;    // 16px each side
const CANVAS_RATIO = 1.8;    // canvas is wider than its parent container
const CANVAS_MAX_HEIGHT = 650;
const VIEWPORT_MARGIN = 16;  // prevent canvas from touching screen edges
const CONTROLS_OVERLAP_RATIO = 120 / 650; // controls overlap this fraction of canvas height

export interface CanvasMetrics {
  canvasWidth: number;
  canvasHeight: number;
  controlsOverlap: number;
}

export function calculateCanvasMetrics(windowWidth: number): CanvasMetrics {
  const parentWidth = Math.min(windowWidth - PARENT_MARGIN, PARENT_MAX_WIDTH);
  const desiredCanvasWidth = CANVAS_RATIO * parentWidth;
  const maxCanvasWidth = windowWidth - VIEWPORT_MARGIN;
  const canvasWidth = Math.min(desiredCanvasWidth, maxCanvasWidth);
  const canvasHeight = Math.min(CANVAS_MAX_HEIGHT, canvasWidth);
  const controlsOverlap = canvasHeight * CONTROLS_OVERLAP_RATIO;

  return { canvasWidth, canvasHeight, controlsOverlap };
}
