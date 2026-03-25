import { prisma } from "@workspace/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  user: {
    additionalFields: {
      points: {
        type: "number",
        required: true,
        defaultValue: 0,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    cookiePrefix: "web",
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    admin({
      defaultRole: "user",
    }),
  ],
});
