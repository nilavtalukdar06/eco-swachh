import { protectedProcedure, createTRPCRouter } from "@/dal/init";
import { TRPCError } from "@trpc/server";
import { prisma } from "@workspace/db";

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
});
