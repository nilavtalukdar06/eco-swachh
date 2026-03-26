import { protectedProcedure, createTRPCRouter } from "@/dal/init";
import { firecrawlClient } from "@/lib/firecrawl";
import scrapperPrompt from "../prompts/scrapper-prompt";
import { TRPCError } from "@trpc/server";
import { redis } from "@/lib/redis";

const CACHE_KEY = "news:daily";
const TTL_SECONDS = 60 * 60 * 24;

export const newsRouter = createTRPCRouter({
  fetchNews: protectedProcedure.query(async () => {
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return cached;
    }
    const { data } = await firecrawlClient.post("/", {
      query: scrapperPrompt,
      sources: ["web"],
      categories: [],
      limit: 10,
      scrapeOptions: {
        onlyMainContent: false,
        maxAge: 1000 * 60 * 60 * 24 * 30,
        parsers: ["pdf"],
        formats: ["summary", "links"],
      },
    });
    if (!data?.success) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: data?.error ?? "Failed to search through web",
      });
    }
    const newsData = data.data;
    await redis.set(CACHE_KEY, JSON.stringify(newsData), {
      ex: TTL_SECONDS,
    });
    return newsData;
  }),
});
