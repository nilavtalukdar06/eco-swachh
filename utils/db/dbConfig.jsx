import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(
  "postgresql://neondb_owner:npg_3WtO1jXzVGhk@ep-muddy-term-a1f1mx5e.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
);

export const db = drizzle(sql, { schema });
