import { complaintRouter } from "@/features/complaint/server/complaint-procedures";
import { createTRPCRouter } from "../init";
import { newsRouter } from "@/features/news/server/news-procedures";

export const appRouter = createTRPCRouter({
  complaints: complaintRouter,
  news: newsRouter,
});

export type AppRouter = typeof appRouter;
