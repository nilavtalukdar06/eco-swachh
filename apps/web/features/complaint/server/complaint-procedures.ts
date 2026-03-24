import { createTRPCRouter, protectedProcedure } from "@/dal/init";
import { prisma } from "@workspace/db";
import * as z from "zod";

export const complaintRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z
          .string()
          .min(2, "title is too short")
          .max(50, "title is too long"),
        description: z
          .string()
          .min(5, "description is too short")
          .max(200, "description is too long"),
      }),
    )
    .mutation(async (opts) => {
      const result = await prisma.complaint.create({
        data: {
          title: opts.input.title,
          description: opts.input.description,
          userId: opts.ctx.user.id,
          resolvedAt: new Date(Date.now()),
        },
      });
      return {
        success: true,
        complaintId: result.id,
      };
    }),
});
