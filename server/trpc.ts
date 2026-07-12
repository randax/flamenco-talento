import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { createClient } from "next-sanity";
import type { Submission } from "@/server/routers/signup";

// next-sanity re-exports createClient from @sanity/client but not the
// SanityClient type itself; derive it instead of adding a direct dependency
// on @sanity/client just for a type.
type SanityClient = ReturnType<typeof createClient>;

export type Context = {
  ip: string;
  sanity: Pick<SanityClient, "create">;
  sendEmail: (submission: Submission) => Promise<unknown>;
};

const t = initTRPC.context<Context>().create({ transformer: superjson });

export const router = t.router;
export const publicProcedure = t.procedure;
