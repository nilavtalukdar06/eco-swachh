import { complaintRouter } from "@/features/complaint/server/complaint-procedures";
import { createTRPCRouter } from "../init";
import { newsRouter } from "@/features/news/server/news-procedures";
import { aiRouter } from "@/features/news/server/ai-procedures";
import { carbonRouter } from "@/features/carbon/server/carbon-procedures";

export const appRouter = createTRPCRouter({
  complaints: complaintRouter,
  news: newsRouter,
  ai: aiRouter,
  carbon: carbonRouter,
});

export type AppRouter = typeof appRouter;
