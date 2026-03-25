import { createTRPCRouter } from "../init";
import { complaintRouter } from "../../features/complaint/server/complaint-procedures";

export const appRouter = createTRPCRouter({
  complaint: complaintRouter,
});

export type AppRouter = typeof appRouter;
