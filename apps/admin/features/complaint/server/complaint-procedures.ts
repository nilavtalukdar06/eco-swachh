import { createTRPCRouter, protectedProcedure } from "@/dal/init";
import { prisma } from "@workspace/db";
import * as z from "zod";

const PAGE_SIZE = 12;

export const complaintRouter = createTRPCRouter({
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
          deletedForAdmin: false,
          ...(status ? { status } : {}),
        },
        include: {
          user: true,
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
  delete: protectedProcedure
    .input(
      z.object({
        complaintId: z.string().uuid({ message: "complaint id is not valid" }),
      }),
    )
    .mutation(async (opts) => {
      const result = await prisma.complaint.update({
        where: {
          id: opts.input.complaintId,
        },
        data: {
          deletedForAdmin: true,
        },
      });
      return result;
    }),
  resolve: protectedProcedure
    .input(
      z.object({
        complaintId: z.string().uuid({ message: "complaint id is not valid" }),
        comment: z
          .string()
          .min(5, "Comment is too short")
          .max(200, "Comment is too long"),
      }),
    )
    .mutation(async (opts) => {
      const { complaintId, comment } = opts.input;
      const adminId = opts.ctx.user.id;

      const result = await prisma.$transaction([
        prisma.complaint.update({
          where: { id: complaintId },
          data: {
            status: "RESOLVED",
            resolvedAt: new Date(),
          },
        }),
        prisma.complaintComment.create({
          data: {
            complaintId,
            adminId,
            comment,
          },
        }),
      ]);

      return result[0];
    }),
});
