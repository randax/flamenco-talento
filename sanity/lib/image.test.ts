import { describe, expect, it } from "vitest";
import { hotspotPosition } from "./image";

describe("hotspotPosition", () => {
  it("centres images without a hotspot", () => {
    expect(hotspotPosition({ hotspot: null })).toBe("50% 50%");
  });

  it("puts the editor's hotspot at the focus of the crop", () => {
    expect(hotspotPosition({ hotspot: { x: 0.25, y: 0.8, width: 0.2, height: 0.2 } })).toBe("25% 80%");
  });

  it("measures the hotspot inside the crop, since urlFor serves the cropped image", () => {
    // Crop keeps x 0.2–0.8 (60% wide) and y 0–0.5; hotspot at x 0.5, y 0.25 is
    // the centre of that window.
    expect(
      hotspotPosition({
        hotspot: { x: 0.5, y: 0.25, width: 0.1, height: 0.1 },
        crop: { left: 0.2, right: 0.2, top: 0, bottom: 0.5 },
      }),
    ).toBe("50% 50%");
  });
});
