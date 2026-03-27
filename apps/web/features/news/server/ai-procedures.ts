import { createTRPCRouter, protectedProcedure } from "@/dal/init";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { summaryPrompt } from "../prompts/ai-prompts";
import { redis } from "@/lib/redis";
import { z } from "zod";

const CACHE_KEY = "summary:daily";
const TTL = 60 * 60 * 24;

const summarySchema = z.object({
  result: z.string(),
});

export const aiRouter = createTRPCRouter({
  generateSummary: protectedProcedure.query(async () => {
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
      return summarySchema.parse(parsed);
    }
    const { text } = await generateText({
      model: openai("gpt-5-mini"),
      prompt: summaryPrompt,
      tools: {
        web_search: openai.tools.webSearch({
          externalWebAccess: true,
          searchContextSize: "medium",
        }),
      },
      toolChoice: { type: "tool", toolName: "web_search" },
    });
    const summary = { result: text };
    await redis.set(CACHE_KEY, summary, {
      ex: TTL,
    });
    return summarySchema.parse(summary);
  }),
});
