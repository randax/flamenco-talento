import { describe, it, expect, vi } from "vitest";
import { createRateLimiter } from "./rateLimit";

describe("rateLimiter", () => {
  it("allows up to limit hits per key within the window", () => {
    const rl = createRateLimiter({ limit: 2, windowMs: 1000, now: () => 0 });
    expect(rl.check("1.2.3.4")).toBe(true);
    expect(rl.check("1.2.3.4")).toBe(true);
    expect(rl.check("1.2.3.4")).toBe(false);
    expect(rl.check("5.6.7.8")).toBe(true);
  });
  it("resets after the window", () => {
    let t = 0;
    const rl = createRateLimiter({ limit: 1, windowMs: 1000, now: () => t });
    expect(rl.check("k")).toBe(true);
    expect(rl.check("k")).toBe(false);
    t = 1001;
    expect(rl.check("k")).toBe(true);
  });
});
