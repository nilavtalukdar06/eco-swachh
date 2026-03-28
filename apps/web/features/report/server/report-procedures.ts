import { createTRPCRouter, protectedProcedure } from "@/dal/init";
import { prisma } from "@workspace/db";
import { inngest } from "@/jobs/client";
import * as z from "zod";

const PAGE_SIZE = 12;

export const reportRouter = createTRPCRouter({
  submit: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string(),
        userDescription: z
          .string()
          .min(3, "Description is too short")
          .max(500, "Description is too long"),
        latitude: z.number().nullable(),
        longitude: z.number().nullable(),
        manualLocation: z.string().nullable(),
      }),
    )
    .mutation(async (opts) => {
      const report = await prisma.report.create({
        data: {
          imageUrl: opts.input.imageUrl,
          userDescription: opts.input.userDescription,
          latitude: opts.input.latitude,
          longitude: opts.input.longitude,
          manualLocation: opts.input.manualLocation,
          userId: opts.ctx.user.id,
          status: "PROCESSING",
          priority: "LOW",
          aiTitle: "",
          aiDescription: "",
          wasteType: "",
          wasteDetails: "",
          estimatedWeight: 0,
          disposalInstructions: "",
          warnings: "",
        },
      });
      await prisma.user.update({
        where: {
          id: opts.ctx.user.id,
        },
        data: {
          points: {
            increment: 10,
          },
        },
      });
      await inngest.send({
        name: "report/submitted",
        data: {
          reportId: report.id,
          imageUrl: opts.input.imageUrl,
          userDescription: opts.input.userDescription,
          userId: opts.ctx.user.id,
        },
      });

      return { success: true, reportId: report.id };
    }),

  getAll: protectedProcedure
    .input(
      z.object({
        status: z.enum(["PROCESSING", "SPAM", "PENDING", "RESOLVED"]).optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
        cursor: z.string().optional(),
      }),
    )
    .query(async (opts) => {
      const { status, priority, cursor } = opts.input;
      const items = await prisma.report.findMany({
        where: {
          userId: opts.ctx.user.id,
          ...(status ? { status } : {}),
          ...(priority ? { priority } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE + 1,
        ...(cursor
          ? { cursor: { id: cursor }, skip: 1 }
          : {}),
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
          userId: opts.ctx.user.id,
        },
      });
      return report;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        reportId: z.string().uuid("Report ID is not valid"),
      }),
    )
    .mutation(async (opts) => {
      const result = await prisma.report.delete({
        where: {
          id: opts.input.reportId,
          userId: opts.ctx.user.id,
        },
      });
      return result;
    }),
});
