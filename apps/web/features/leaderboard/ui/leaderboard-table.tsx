"use client";

import { useTRPC } from "@/dal/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LeaderboardDataTable } from "./leaderboard-data-table";
import { columns } from "./leaderboard-table-columns";

export function LeaderboardTable() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.leaderboard.getTopUsers.queryOptions());

  return (
    <div className="my-2">
      <LeaderboardDataTable columns={columns as any} data={data} />
    </div>
  );
}
