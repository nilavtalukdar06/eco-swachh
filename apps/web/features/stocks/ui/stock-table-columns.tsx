"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LuArrowUpDown } from "react-icons/lu";
import { Button } from "@workspace/ui/components/button";
import type { StockQuote } from "../server/stock-procedures";

export const columns: ColumnDef<StockQuote>[] = [
  {
    accessorKey: "symbol",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Symbol
        <LuArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-semibold px-4 tracking-wide">
        {row.getValue("symbol")}
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Company
        <LuArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-muted-foreground px-4">
        {row.getValue("name")}
      </div>
    ),
  },
  {
    accessorKey: "currentPrice",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Price
        <LuArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const price = row.getValue("currentPrice") as number;
      return (
        <div className="font-medium px-4 tabular-nums">
          ${price.toFixed(2)}
        </div>
      );
    },
  },
  {
    accessorKey: "change",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Change
        <LuArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const change = row.getValue("change") as number;
      const isPositive = change >= 0;
      return (
        <div
          className={`font-medium px-4 tabular-nums ${isPositive ? "text-green-500" : "text-red-500"}`}
        >
          {isPositive ? "+" : ""}
          {change.toFixed(2)}
        </div>
      );
    },
  },
  {
    accessorKey: "changePercent",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Change %
        <LuArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const pct = row.getValue("changePercent") as number;
      const isPositive = pct >= 0;
      return (
        <div className="px-4">
          <span
            className={`inline-flex items-center rounded-none px-2 py-0.5 text-xs font-semibold tabular-nums ${
              isPositive
                ? "bg-green-500/10 text-green-500"
                : "bg-red-500/10 text-red-500"
            }`}
          >
            {isPositive ? "+" : ""}
            {pct.toFixed(2)}%
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "high",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Day High
        <LuArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const high = row.getValue("high") as number;
      return (
        <div className="px-4 tabular-nums text-muted-foreground">
          ${high.toFixed(2)}
        </div>
      );
    },
  },
  {
    accessorKey: "low",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Day Low
        <LuArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const low = row.getValue("low") as number;
      return (
        <div className="px-4 tabular-nums text-muted-foreground">
          ${low.toFixed(2)}
        </div>
      );
    },
  },
  {
    accessorKey: "open",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Open
        <LuArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const open = row.getValue("open") as number;
      return (
        <div className="px-4 tabular-nums text-muted-foreground">
          ${open.toFixed(2)}
        </div>
      );
    },
  },
  {
    accessorKey: "previousClose",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Prev Close
        <LuArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const pc = row.getValue("previousClose") as number;
      return (
        <div className="px-4 tabular-nums text-muted-foreground">
          ${pc.toFixed(2)}
        </div>
      );
    },
  },
];
