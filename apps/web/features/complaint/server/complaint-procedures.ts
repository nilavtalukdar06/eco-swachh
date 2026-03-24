import { createTRPCRouter, protectedProcedure } from "@/dal/init";
import { prisma } from "@workspace/db";
import * as z from "zod";

const PAGE_SIZE = 12;

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
          resolvedAt: new Date(),
        },
      });
      return { success: true, complaintId: result.id };
    }),
  getAll: protectedProcedure
    .input(
      z.object({
        status: z.enum(["PENDING", "RESOLVED"]).optional(),
        cursor: z.string().optional(),
      }),
    )
    .query(async (opts) => {
      const { status, cursor } = opts.input;
      const items = await prisma.complaint.findMany({
        where: {
          userId: opts.ctx.user.id,
          ...(status ? { status } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | undefined = undefined;
      if (items.length > PAGE_SIZE) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }
      return { items, nextCursor };
    }),
});
