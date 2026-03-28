import { createTRPCRouter, protectedProcedure } from "@/dal/init";
import { prisma } from "@workspace/db";
import { z } from "zod";

export const walletRouter = createTRPCRouter({
  saveWalletAddress: protectedProcedure
    .input(
      z.object({
        walletAddress: z
          .string()
          .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.user.update({
        where: { id: ctx.user.id },
        data: { walletAddress: input.walletAddress },
      });
      return { success: true };
    }),

  getWalletAddress: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: { walletAddress: true },
    });
    return { walletAddress: user?.walletAddress ?? null };
  }),
});
