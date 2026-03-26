import { createTRPCRouter, protectedProcedure } from "@/dal/init";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { summaryPrompt } from "../prompts/ai-prompts";
import { redis } from "@/lib/redis";

const CACHE_KEY = "summary:daily";
const TTL = 60 * 60 * 24;

export const aiRouter = createTRPCRouter({
  generateSummary: protectedProcedure.query(async () => {
    const cached = await redis.get(CACHE_KEY);
    if (cached) {
      return cached;
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
    await redis.set(CACHE_KEY, JSON.stringify(summary), {
      ex: TTL,
    });
    return summary;
  }),
});
