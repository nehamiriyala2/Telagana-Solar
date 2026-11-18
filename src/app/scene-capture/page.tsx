import { CaptureClient } from "./capture-client";

/**
 * Renders only the 3D hero scene on a transparent background.
 * Regenerate the fallback image after changing the scene:
 *   1. npm run build && npm start
 *   2. node automation/capture-hero.mjs http://localhost:3000
 */
export default function SceneCapture() {
  return <CaptureClient />;
}
