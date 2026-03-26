import { protectedProcedure, createTRPCRouter } from "@/dal/init";
import { auth } from "@/lib/auth";
import { TRPCError } from "@trpc/server";
import { prisma } from "@workspace/db";
import { headers } from "next/headers";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async (opts) => {
    const role = opts.ctx.auth?.user.role;
    if (role !== "admin") {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "only an admin can access this feature",
      });
    }
    const result = await prisma.user.findMany({
      where: {
        role: "user",
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return result;
  }),
  banUser: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid({ message: "the user id is not valid" }),
        banReason: z
          .string()
          .min(5, { message: "ban reason is too short" })
          .max(200, { message: "ban reason is too long" }),
      }),
    )
    .mutation(async (opts) => {
      const role = opts.ctx.user.role;
      if (role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "you are not authorized to perform this action",
        });
      }
      await auth.api.banUser({
        body: {
          userId: opts.input.userId,
          banReason: opts.input.banReason,
        },
        headers: await headers(),
      });
    }),
  unbanUser: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid({ message: "the user id is not valid" }),
      }),
    )
    .mutation(async (opts) => {
      const role = opts.ctx.user.role;
      if (role !== "admin") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "you are not authorized to perform this action",
        });
      }
      await auth.api.unbanUser({
        body: { userId: opts.input.userId },
        headers: await headers(),
      });
    }),
});
