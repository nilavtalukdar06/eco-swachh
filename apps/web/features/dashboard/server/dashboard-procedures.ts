import { protectedProcedure, createTRPCRouter } from "@/dal/init";
import { prisma } from "@workspace/db";

export const dashboardRouter = createTRPCRouter({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    
    const reportsSubmitted = await prisma.report.count({
      where: { userId },
    });

    const wasteReportedQuery = await prisma.report.aggregate({
      where: { userId },
      _sum: { estimatedWeight: true },
    });

    const wasteReported = wasteReportedQuery._sum.estimatedWeight || 0;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });
    const pointsEarned = user?.points || 0;

    const co2Offset = wasteReported * 0.5;

    return {
      reportsSubmitted,
      wasteReported: `${wasteReported}kg`,
      pointsEarned,
      co2Offset: co2Offset.toFixed(1),
    };
  }),
});
