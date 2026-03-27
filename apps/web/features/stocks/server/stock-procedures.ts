import { createTRPCRouter, protectedProcedure } from "@/dal/init";
import { TRPCError } from "@trpc/server";
import { redis } from "@/lib/redis";
import axios from "axios";
import { z } from "zod";

const CACHE_KEY = "stocks:quotes";
const TTL_SECONDS = 60 * 2;

const SUSTAINABILITY_STOCKS = [
  { symbol: "NEE", name: "NextEra Energy" },
  { symbol: "ENPH", name: "Enphase Energy" },
  { symbol: "FSLR", name: "First Solar" },
  { symbol: "SEDG", name: "SolarEdge Technologies" },
  { symbol: "PLUG", name: "Plug Power" },
  { symbol: "BE", name: "Bloom Energy" },
  { symbol: "RUN", name: "Sunrun" },
  { symbol: "CSIQ", name: "Canadian Solar" },
  { symbol: "NOVA", name: "Sunnova Energy" },
  { symbol: "DQ", name: "Daqo New Energy" },
];

const stockQuoteSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  currentPrice: z.number(),
  change: z.number(),
  changePercent: z.number(),
  high: z.number(),
  low: z.number(),
  open: z.number(),
  previousClose: z.number(),
});

export type StockQuote = z.infer<typeof stockQuoteSchema>;

export const stockRouter = createTRPCRouter({
  getStockQuotes: protectedProcedure.query(
    async (): Promise<StockQuote[]> => {
      const cached = await redis.get(CACHE_KEY);
      if (cached) {
        const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
        return z.array(stockQuoteSchema).parse(parsed);
      }

      const results: StockQuote[] = [];

      for (const stock of SUSTAINABILITY_STOCKS) {
        try {
          const { data } = await axios.get(
            "https://finnhub.io/api/v1/quote",
            {
              params: {
                symbol: stock.symbol,
                token: process.env.FINNHUB_API_KEY!,
              },
            },
          );
          results.push({
            symbol: stock.symbol,
            name: stock.name,
            currentPrice: data.c ?? 0,
            change: data.d ?? 0,
            changePercent: data.dp ?? 0,
            high: data.h ?? 0,
            low: data.l ?? 0,
            open: data.o ?? 0,
            previousClose: data.pc ?? 0,
          });
        } catch {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to fetch quote for ${stock.symbol}`,
          });
        }
      }

      await redis.set(CACHE_KEY, results, { ex: TTL_SECONDS });
      return results;
    },
  ),
});
