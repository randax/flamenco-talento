import { describe, it, expect, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import { appRouter } from "./_app";
import type { Context } from "@/server/trpc";

function makeCtx(overrides: Partial<Context> = {}): Context {
  return {
    ip: "203.0.113.1",
    sanity: { create: vi.fn().mockResolvedValue({ _id: "submission-1" }) },
    sendEmail: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

const validInput = {
  name: "Ana Garcia",
  email: "ana@example.com",
  phone: "+47 900 00 000",
  interest: "Sevillanas",
  message: "Gleder meg!",
  website: "",
  lang: "no" as const,
};

describe("signup.submit", () => {
  it("(a) valid input stores a submission doc with handled: false", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.signup.submit(validInput);

    expect(result).toEqual({ ok: true });
    expect(ctx.sanity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        _type: "submission",
        name: validInput.name,
        email: validInput.email,
        phone: validInput.phone,
        interest: validInput.interest,
        message: validInput.message,
        lang: validInput.lang,
        handled: false,
      }),
    );
  });

  it("(b) a filled honeypot is rejected with BAD_REQUEST", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.signup.submit({ ...validInput, website: "x" }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    expect(ctx.sanity.create).not.toHaveBeenCalled();
  });

  it("(c) a rate-limited ip is rejected with TOO_MANY_REQUESTS", async () => {
    const ip = "198.51.100.42";

    for (let i = 0; i < 5; i++) {
      const ctx = makeCtx({ ip });
      const caller = appRouter.createCaller(ctx);
      await caller.signup.submit(validInput);
    }

    const ctx = makeCtx({ ip });
    const caller = appRouter.createCaller(ctx);

    let error: unknown;
    try {
      await caller.signup.submit(validInput);
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(TRPCError);
    expect((error as TRPCError).code).toBe("TOO_MANY_REQUESTS");
  });

  it("(d) a sendEmail rejection still returns ok: true", async () => {
    const ctx = makeCtx({
      ip: "192.0.2.77",
      sendEmail: vi.fn().mockRejectedValue(new Error("resend down")),
    });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.signup.submit(validInput);

    expect(result).toEqual({ ok: true });
    expect(ctx.sanity.create).toHaveBeenCalled();
  });
});
