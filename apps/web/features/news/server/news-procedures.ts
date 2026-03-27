import { protectedProcedure, createTRPCRouter } from "@/dal/init";
import { firecrawlClient } from "@/lib/firecrawl";
import scrapperPrompt from "../prompts/scrapper-prompt";
import { TRPCError } from "@trpc/server";
import { redis } from "@/lib/redis";

const CACHE_KEY = "news:daily";
const TTL_SECONDS = 60 * 60 * 24;

type NewsResponse = {
  web: any[];
};

export const newsRouter = createTRPCRouter({
  fetchNews: protectedProcedure.query(async (): Promise<NewsResponse> => {
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return (
        typeof cached === "string" ? JSON.parse(cached) : cached
      ) as NewsResponse;
    }
    const { data } = await firecrawlClient.post("/", {
      query: scrapperPrompt,
      sources: ["web"],
      categories: [],
      limit: 8,
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
    await redis.set(CACHE_KEY, newsData, {
      ex: TTL_SECONDS,
    });
    return newsData;
  }),
});
