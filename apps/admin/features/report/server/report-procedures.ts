import { createTRPCRouter, protectedProcedure } from "@/dal/init";
import { prisma } from "@workspace/db";
import * as z from "zod";

const PAGE_SIZE = 12;

export const reportRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["PROCESSING", "SPAM", "PENDING", "RESOLVED"])
          .optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
        cursor: z.string().optional(),
      }),
    )
    .query(async (opts) => {
      const { status, priority, cursor } = opts.input;
      const items = await prisma.report.findMany({
        where: {
          ...(status ? { status } : {}),
          ...(priority ? { priority } : {}),
        },
        include: {
          user: true,
          spamReports: true,
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

  getById: protectedProcedure
    .input(
      z.object({
        reportId: z.string().uuid("Report ID is not valid"),
      }),
    )
    .query(async (opts) => {
      const report = await prisma.report.findFirst({
        where: {
          id: opts.input.reportId,
        },
        include: {
          user: true,
          spamReports: true,
        },
      });
      return report;
    }),

  resolve: protectedProcedure
    .input(
      z.object({
        reportId: z.string().uuid("Report ID is not valid"),
        comment: z
          .string()
          .min(5, "Comment is too short")
          .max(500, "Comment is too long"),
      }),
    )
    .mutation(async (opts) => {
      const { reportId, comment } = opts.input;
      const adminId = opts.ctx.user.id;

      // Fetch the report to get the userId for awarding points
      const report = await prisma.report.findUnique({
        where: { id: reportId },
        select: { userId: true, status: true },
      });

      if (!report) {
        throw new Error("Report not found");
      }

      if (report.status === "RESOLVED") {
        throw new Error("Report is already resolved");
      }

      const result = await prisma.$transaction([
        prisma.report.update({
          where: { id: reportId },
          data: {
            status: "RESOLVED",
          },
        }),
        prisma.resolvedRerport.create({
          data: {
            reportId,
            userId: adminId,
            comment,
          },
        }),
        prisma.user.update({
          where: { id: report.userId },
          data: {
            points: {
              increment: 20,
            },
          },
        }),
      ]);

      return result[0];
    }),
});
