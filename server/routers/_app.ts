import { router } from "@/server/trpc";
import { signupRouter } from "@/server/routers/signup";

export const appRouter = router({
  signup: signupRouter,
});

export type AppRouter = typeof appRouter;
