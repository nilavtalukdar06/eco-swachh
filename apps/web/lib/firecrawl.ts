import axios from "axios";

export const firecrawlClient = axios.create({
  baseURL: process.env.FIRECRAWL_API_URL!,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
  },
});
