"use client";

import { useTRPC } from "@/dal/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function UserTable() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.user.getAll.queryOptions());
  return (
    <div className="my-4">
      <p>User Table</p>
    </div>
  );
}
