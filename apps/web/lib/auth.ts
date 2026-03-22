import { prisma } from "@workspace/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    cookiePrefix: "web",
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
});
