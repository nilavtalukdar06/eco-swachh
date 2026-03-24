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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import { cn } from "@workspace/ui/lib/utils";
import { MdMoreHoriz } from "react-icons/md";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { CiSearch } from "react-icons/ci";

export function MyComplaints() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.complaints.getAll.queryOptions());
  return (
    <div className="my-3">
      <div className="mb-3 w-full flex justify-between items-center gap-x-4">
        <InputGroup className="max-w-sm">
          <InputGroupInput placeholder="Search complaints by title" />
          <InputGroupAddon>
            <CiSearch />
          </InputGroupAddon>
        </InputGroup>
        <Select>
          <SelectTrigger className="w-full max-w-24 sm:max-w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {data && data.length === 0 ? (
        <p className="font-light text-muted-foreground text-sm">
          You have not submitted any complaints
        </p>
      ) : (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.map((complaint) => (
            <div key={complaint.id}>
              <ComplaintCard complaint={complaint} />
            </div>
          ))}
        </div>
      )}
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
              "w-fit h-fit p-1",
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
