"use client";

import { useTRPC } from "@/dal/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { StockDataTable } from "./stock-data-table";
import { columns } from "./stock-table-columns";

export function StockTable() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery({
    ...trpc.stocks.getStockQuotes.queryOptions(),
    refetchInterval: 30000,
  });

  return (
    <div className="my-2">
      <StockDataTable columns={columns as any} data={data} />
    </div>
  );
}
