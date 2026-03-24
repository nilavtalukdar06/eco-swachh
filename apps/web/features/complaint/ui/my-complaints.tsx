"use client";

import { useTRPC } from "@/dal/client";
import { Trash } from "@phosphor-icons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Complaint } from "@workspace/db";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
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
import { MdMoreHoriz } from "react-icons/md";
import { parseAsString, parseAsStringEnum, useQueryState } from "nuqs";
import { useCallback } from "react";

export const statusParser = parseAsStringEnum(["PENDING", "RESOLVED"]);
export const cursorParser = parseAsString;

export function MyComplaints() {
  const trpc = useTRPC();

  const [status, setStatus] = useQueryState("status", statusParser);
  const [cursor, setCursor] = useQueryState("cursor", cursorParser);

  const { data } = useSuspenseQuery(
    trpc.complaints.getAll.queryOptions({
      status: status ?? undefined,
      cursor: cursor ?? undefined,
    }),
  );

  const handleStatus = useCallback(
    (value: string) => {
      setCursor(null);
      setStatus(value === "all" ? null : (value as "PENDING" | "RESOLVED"));
    },
    [setCursor, setStatus],
  );

  return (
    <div className="my-3">
      <div className="mb-3 w-full flex justify-between items-center gap-x-4">
        <Select value={status ?? "all"} onValueChange={handleStatus}>
          <SelectTrigger className="w-full max-w-24 sm:max-w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {data.items.length === 0 ? (
        <p className="font-light text-muted-foreground text-sm">
          No complaints found.
        </p>
      ) : (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.items.map((complaint) => (
            <ComplaintCard key={complaint.id} complaint={complaint} />
          ))}
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

export function ComplaintCard({ complaint }: { complaint: Complaint }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="mb-1 w-full flex justify-between">
          <div
            className={cn(
              "w-fit h-fit p-1 text-xs",
              complaint.status === "PENDING"
                ? "text-red-500 bg-red-50"
                : "text-green-500 bg-green-50",
            )}
          >
            <p>{complaint.status}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MdMoreHoriz />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Trash />
                  Delete Complaint
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle>{complaint.title}</CardTitle>
        <CardDescription>{complaint.description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
