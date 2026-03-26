"use client";

import { useTRPC } from "@/dal/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { UserDataTable } from "./user-data-table";
import { columns } from "./user-table-columns";

export function UserTable() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.user.getAll.queryOptions());

  return (
    <div className="my-2">
      <UserDataTable columns={columns as any} data={data} />
    </div>
  );
}
