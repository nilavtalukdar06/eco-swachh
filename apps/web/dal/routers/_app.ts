import { complaintRouter } from "@/features/complaint/server/complaint-procedures";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  complaints: complaintRouter,
});

export type AppRouter = typeof appRouter;
