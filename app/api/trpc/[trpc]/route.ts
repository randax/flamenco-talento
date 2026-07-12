import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { Resend } from "resend";
import { appRouter } from "@/server/routers/_app";
import type { Context } from "@/server/trpc";
import type { Submission } from "@/server/routers/signup";
import { writeClient } from "@/sanity/lib/client";

// Resend is instantiated lazily so a missing RESEND_API_KEY (e.g. local dev
// before the key is provisioned) doesn't crash the route — sendEmail below
// no-ops with a console.warn instead.
let resend: Resend | null | undefined;
function getResend(): Resend | null {
  if (resend !== undefined) return resend;
  const apiKey = process.env.RESEND_API_KEY;
  resend = apiKey ? new Resend(apiKey) : null;
  return resend;
}

async function sendEmail(submission: Submission): Promise<unknown> {
  const client = getResend();
  if (!client) {
    console.warn("signup: RESEND_API_KEY is not set; skipping notification email");
    return undefined;
  }

  const to = process.env.SIGNUP_NOTIFICATION_EMAIL;
  if (!to) {
    console.warn("signup: SIGNUP_NOTIFICATION_EMAIL is not set; skipping notification email");
    return undefined;
  }

  const lines = [
    `Navn: ${submission.name}`,
    `E-post: ${submission.email}`,
    submission.phone ? `Telefon: ${submission.phone}` : null,
    `Interesse: ${submission.interest}`,
    submission.message ? `Melding: ${submission.message}` : null,
    `Språk: ${submission.lang}`,
    `Sendt: ${submission.createdAt}`,
  ].filter((line): line is string => line !== null);

  // Resend's SDK resolves with `{ data, error }` instead of throwing on API
  // errors (e.g. the test `onboarding@resend.dev` sender is restricted to the
  // account owner's own address until a domain is verified). Surface that as a
  // throw so the caller's catch logs it rather than swallowing it silently.
  const { data, error } = await client.emails.send({
    from: "Flamenco Talento <onboarding@resend.dev>",
    to,
    subject: `Ny påmelding: ${submission.interest}`,
    text: lines.join("\n"),
  });
  if (error) {
    throw new Error(`Resend error: ${error.name} — ${error.message}`);
  }
  return data;
}

function resolveIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return "unknown";
}

function createContext(request: Request): Context {
  return {
    ip: resolveIp(request),
    sanity: writeClient,
    sendEmail,
  };
}

function handler(request: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () => createContext(request),
  });
}

export { handler as GET, handler as POST };
