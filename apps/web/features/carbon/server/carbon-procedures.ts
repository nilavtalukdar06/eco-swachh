import { createTRPCRouter, protectedProcedure } from "@/dal/init";
import { TRPCError } from "@trpc/server";
import { redis } from "@/lib/redis";
import axios from "axios";
import { z } from "zod";

const CACHE_KEY = "carbon:intensity";
const TTL_SECONDS = 60 * 60;

const INDIA_ZONES = [
  {
    zone: "IN-NO",
    name: "Northern India",
    cities: [
      { name: "Delhi", lat: 28.6139, lng: 77.209 },
      { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
      { name: "Lucknow", lat: 26.8467, lng: 80.9462 },
      { name: "Chandigarh", lat: 30.7333, lng: 76.7794 },
    ],
  },
  {
    zone: "IN-NE",
    name: "North Eastern India",
    cities: [
      { name: "Guwahati", lat: 26.1445, lng: 91.7362 },
      { name: "Shillong", lat: 25.5788, lng: 91.8933 },
      { name: "Imphal", lat: 24.817, lng: 93.9368 },
    ],
  },
  {
    zone: "IN-EA",
    name: "Eastern India",
    cities: [
      { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
      { name: "Patna", lat: 25.6093, lng: 85.1376 },
      { name: "Bhubaneswar", lat: 20.2961, lng: 85.8245 },
      { name: "Ranchi", lat: 23.3441, lng: 85.3096 },
    ],
  },
  {
    zone: "IN-WE",
    name: "Western India",
    cities: [
      { name: "Mumbai", lat: 19.076, lng: 72.8777 },
      { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
      { name: "Pune", lat: 18.5204, lng: 73.8567 },
      { name: "Nagpur", lat: 21.1458, lng: 79.0882 },
    ],
  },
  {
    zone: "IN-SO",
    name: "Southern India",
    cities: [
      { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
      { name: "Chennai", lat: 13.0827, lng: 80.2707 },
      { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
      { name: "Kochi", lat: 9.9312, lng: 76.2673 },
    ],
  },
];

const cityDataSchema = z.object({
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  zone: z.string(),
  zoneName: z.string(),
  carbonIntensity: z.number(),
});

type CityData = z.infer<typeof cityDataSchema>;

export const carbonRouter = createTRPCRouter({
  getCarbonIntensity: protectedProcedure.query(
    async (): Promise<CityData[]> => {
      const cached = await redis.get(CACHE_KEY);
      if (cached) {
        const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
        return z.array(cityDataSchema).parse(parsed);
      }

      const results: CityData[] = [];

      for (const region of INDIA_ZONES) {
        try {
          const { data } = await axios.get(
            `https://api.electricitymap.org/v3/carbon-intensity/latest`,
            {
              params: { zone: region.zone },
              headers: { "auth-token": process.env.EM_API_KEY! },
            },
          );
          const intensity = data.carbonIntensity ?? 0;
          for (const city of region.cities) {
            results.push({
              name: city.name,
              lat: city.lat,
              lng: city.lng,
              zone: region.zone,
              zoneName: region.name,
              carbonIntensity: intensity,
            });
          }
        } catch {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to fetch carbon intensity for zone ${region.zone}`,
          });
        }
      }

      await redis.set(CACHE_KEY, results, { ex: TTL_SECONDS });
      return results;
    },
  ),
});
