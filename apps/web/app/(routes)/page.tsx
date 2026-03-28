import { DashboardStats } from "@/features/dashboard/ui/dashboard-stats";
import { LeaderboardTable } from "@/features/leaderboard/ui/leaderboard-table";
import { getQueryClient, trpc } from "@/dal/server";
import { auth } from "@/lib/auth";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import {
  LeaderboardError,
  LeaderboardLoading,
} from "./_components/leaderboard";
import {
  DashboardStatsError,
  DashboardStatsLoading,
} from "./_components/dashboard-stats";

export default async function Home() {
  const queryClient = getQueryClient();
  const result = await auth.api.getSession({
    headers: await headers(),
  });
  if (result?.session) {
    void queryClient.prefetchQuery(trpc.leaderboard.getTopUsers.queryOptions());
    void queryClient.prefetchQuery(trpc.dashboard.getStats.queryOptions());
  }

  return (
    <div className="w-full p-4">
      <p className="text-lg">Dashboard</p>
      <p className="text-xs text-muted-foreground font-light max-w-2xl">
        Welcome to Eco Swachh, your intelligent waste management dashboard for
        tracking reports, monitoring collection, and visualizing impact in real
        time across communities.
      </p>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary fallback={<DashboardStatsError />}>
          <Suspense fallback={<DashboardStatsLoading />}>
            <DashboardStats />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary fallback={<LeaderboardError />}>
          <Suspense fallback={<LeaderboardLoading />}>
            <LeaderboardTable />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </div>
  );
}
