import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure } from "@/server/trpc";
import { createRateLimiter } from "@/server/rateLimit";

export const signupInputSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  interest: z.string().min(1),
  message: z.string().max(2000).optional(),
  // Honeypot: real users never see or fill this field. Any non-empty value
  // fails validation before we touch Sanity or Resend.
  website: z.string().max(0),
  lang: z.enum(["no", "en"]),
});

export type SignupInput = z.infer<typeof signupInputSchema>;

export type Submission = Omit<SignupInput, "website"> & { createdAt: string };

// Module-level singleton shared by every request handled by this server
// instance (also used by app/api/trpc/[trpc]/route.ts). It resets on
// redeploy/cold start, so it's a soft spam brake alongside the honeypot
// field rather than a hard guarantee — acceptable for this use case.
const rateLimiter = createRateLimiter({ limit: 5, windowMs: 3600_000 });

export const signupRouter = router({
  submit: publicProcedure.input(signupInputSchema).mutation(async ({ input, ctx }) => {
    if (!rateLimiter.check(ctx.ip)) {
      throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
    }

    // Honeypot field is never persisted or forwarded past this point.
    const fields = {
      name: input.name,
      email: input.email,
      phone: input.phone,
      interest: input.interest,
      message: input.message,
      lang: input.lang,
    };
    const createdAt = new Date().toISOString();
    const submission: Submission = { ...fields, createdAt };

    await ctx.sanity.create({
      _type: "submission",
      ...fields,
      createdAt,
      handled: false,
    });

    try {
      await ctx.sendEmail(submission);
    } catch (err) {
      // The submission is already stored; a notification failure must not
      // fail the mutation.
      console.error("signup: failed to send notification email", err);
    }

    return { ok: true as const };
  }),
});
