"use client";

import { useTRPC } from "@/dal/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Report } from "@workspace/db";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";
import { parseAsString, parseAsStringEnum, useQueryState } from "nuqs";
import Link from "next/link";
import Image from "next/image";
import { useCallback } from "react";

export const cursorParser = parseAsString;
export const statusParser = parseAsStringEnum([
  "PROCESSING",
  "SPAM",
  "PENDING",
]);
export const priorityParser = parseAsStringEnum(["LOW", "MEDIUM", "HIGH"]);

const PRIORITY_STYLES: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  MEDIUM:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  HIGH: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
};

const STATUS_STYLES: Record<string, string> = {
  PROCESSING:
    "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400",
  PENDING:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400",
  SPAM: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  RESOLVED:
    "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
};

export function MyReports() {
  const trpc = useTRPC();
  const [cursor, setCursor] = useQueryState("cursor", cursorParser);
  const [status, setStatus] = useQueryState("status", statusParser);
  const [priority, setPriority] = useQueryState("priority", priorityParser);

  const { data } = useSuspenseQuery({
    ...trpc.reports.getAll.queryOptions({
      cursor: cursor ?? undefined,
      status: status ?? undefined,
      priority: priority ?? undefined,
    }),
    refetchInterval: (query) => {
      const reports = query.state.data?.items;
      if (reports?.some((r) => r.status === "PROCESSING")) {
        return 3000;
      }
      return false;
    },
  });

  const handleStatus = useCallback(
    (value: string) => {
      setCursor(null);
      setStatus(
        value === "all" ? null : (value as "PROCESSING" | "SPAM" | "PENDING"),
      );
    },
    [setCursor, setStatus],
  );

  const handlePriority = useCallback(
    (value: string) => {
      setCursor(null);
      setPriority(
        value === "all" ? null : (value as "LOW" | "MEDIUM" | "HIGH"),
      );
    },
    [setCursor, setPriority],
  );

  return (
    <div className="my-3">
      <div className="mb-4 w-full flex flex-wrap gap-4">
        <Select value={status ?? "all"} onValueChange={handleStatus}>
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SPAM">Spam</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={priority ?? "all"} onValueChange={handlePriority}>
          <SelectTrigger className="w-full max-w-48">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Priority</SelectLabel>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {data.items.length === 0 ? (
        <p className="font-light text-muted-foreground text-sm">
          No reports found. Submit your first waste report above.
        </p>
      ) : (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.items.map((report) =>
            report.status === "PROCESSING" ? (
              <ProcessingCard key={report.id} />
            ) : (
              <ReportCard key={report.id} report={report} />
            ),
          )}
        </div>
      )}
      <div className="mt-4 flex items-center gap-x-3">
        <Button
          variant="outline"
          size="sm"
          disabled={!cursor}
          onClick={() => setCursor(null)}
        >
          First page
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!data.nextCursor}
          onClick={() => setCursor(data.nextCursor ?? null)}
        >
          Next page
        </Button>
      </div>
    </div>
  );
}

function ProcessingCard() {
  return (
    <Card className="h-full overflow-hidden animate-pulse pt-0">
      <div className="w-full h-32 bg-muted" />
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="outline"
            className="bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-0"
          >
            Processing
          </Badge>
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full mt-2" />
        <Skeleton className="h-3 w-2/3 mt-1" />
      </CardHeader>
    </Card>
  );
}

function ReportCard({ report }: { report: Report }) {
  return (
    <Card className="h-full overflow-hidden group pt-0 bg-sidebar">
      <div className="relative w-full h-32 overflow-hidden">
        <Image
          src={report.imageUrl}
          alt={report.aiTitle || "Waste report"}
          fill
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={cn("border-0 text-xs", STATUS_STYLES[report.status])}
          >
            {report.status}
          </Badge>
          {report.status !== "SPAM" && (
            <Badge
              variant="outline"
              className={cn(
                "border-0 text-xs",
                PRIORITY_STYLES[report.priority],
              )}
            >
              {report.priority}
            </Badge>
          )}
        </div>
        <CardTitle className="text-sm line-clamp-1">
          {report.aiTitle || "Untitled Report"}
        </CardTitle>
        <CardDescription className="text-xs line-clamp-2">
          {report.aiDescription || report.userDescription}
        </CardDescription>
        <Link href={`/my-reports/${report.id}`}>
          <Button size="sm" className="w-fit mt-2">
            View Report
          </Button>
        </Link>
      </CardHeader>
    </Card>
  );
}
