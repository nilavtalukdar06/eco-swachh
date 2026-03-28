import { createTRPCRouter } from "../init";
import { complaintRouter } from "../../features/complaint/server/complaint-procedures";
import { userRouter } from "@/features/users/server/user-procedures";
import { reportRouter } from "@/features/report/server/report-procedures";

export const appRouter = createTRPCRouter({
  complaint: complaintRouter,
  user: userRouter,
  report: reportRouter,
});

export type AppRouter = typeof appRouter;
