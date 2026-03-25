import { createTRPCRouter } from "../init";
import { complaintRouter } from "../../features/complaint/server/complaint-procedures";
import { userRouter } from "@/features/users/server/user-procedures";

export const appRouter = createTRPCRouter({
  complaint: complaintRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
