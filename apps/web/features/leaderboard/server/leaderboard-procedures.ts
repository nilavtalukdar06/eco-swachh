import { protectedProcedure, createTRPCRouter } from "@/dal/init";
import { prisma } from "@workspace/db";

export const leaderboardRouter = createTRPCRouter({
  getTopUsers: protectedProcedure.query(async () => {
    const result = await prisma.user.findMany({
      where: {
        role: "user",
      },
      orderBy: {
        points: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        banned: true,
        createdAt: true,
        points: true,
      },
    });
    return result;
  }),
});
