"use client";

import { useTRPC } from "@/dal/client";
import { Trash } from "@phosphor-icons/react";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Complaint, User } from "@workspace/db";
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
import { toast } from "sonner";
import { useTheme } from "next-themes";

export const statusParser = parseAsStringEnum(["PENDING", "RESOLVED"]);
export const cursorParser = parseAsString;

type ComplaintWithUser = Complaint & { user: User };

export function AdminComplaints() {
  const trpc = useTRPC();

  const [status, setStatus] = useQueryState("status", statusParser);
  const [cursor, setCursor] = useQueryState("cursor", cursorParser);

  const { data } = useSuspenseQuery(
    trpc.complaint.getAll.queryOptions({
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
            <AdminComplaintCard
              key={complaint.id}
              complaint={complaint as ComplaintWithUser}
            />
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

export function AdminComplaintCard({
  complaint,
}: {
  complaint: ComplaintWithUser;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const mutation = useMutation(
    trpc.complaint.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Complaint Deleted Successfully");
        queryClient.invalidateQueries({
          queryKey: trpc.complaint.getAll.queryKey(),
        });
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to delete complaint");
      },
    }),
  );

  const handleDelete = (complaintId: string) =>
    mutation.mutate({ complaintId });
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="mb-1 w-full flex justify-between">
          <div
            className={cn(
              "w-fit h-fit p-1 text-xs",
              complaint.status === "PENDING"
                ? theme === "dark"
                  ? "text-red-500 bg-red-950"
                  : "text-red-500 bg-red-50"
                : theme === "dark"
                  ? "text-green-500 bg-green-950"
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
                <DropdownMenuItem
                  onClick={() => handleDelete(complaint.id)}
                  disabled={mutation.isPending}
                >
                  <Trash />
                  Delete Complaint
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle>{complaint.title}</CardTitle>
        <CardDescription>{complaint.description}</CardDescription>
        <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground border-t pt-2">
          <p>
            <span className="font-medium text-foreground">Submitted By:</span>{" "}
            {complaint.user.name}
          </p>
          <p>
            <span className="font-medium text-foreground">Submitted At:</span>{" "}
            {new Date(complaint.createdAt).toLocaleString()}
          </p>
        </div>
      </CardHeader>
    </Card>
  );
}
