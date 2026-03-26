"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LuArrowUpDown, LuEllipsis } from "react-icons/lu";
import { useState } from "react";
import { useTRPC } from "@/dal/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import { Textarea } from "@workspace/ui/components/textarea";
import { Spinner } from "@workspace/ui/components/spinner";

export type UserType = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  banned: boolean | null;
  createdAt: string | Date;
  points: number;
};

const banFormSchema = z.object({
  banReason: z
    .string()
    .min(5, { message: "Ban reason is too short" })
    .max(200, { message: "Ban reason is too long" }),
});

function UserRowActions({ user }: { user: UserType }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);

  const banMutation = useMutation(
    trpc.user.banUser.mutationOptions({
      onSuccess: () => {
        toast.success("User banned successfully");
        queryClient.invalidateQueries({
          queryKey: trpc.user.getAll.queryKey(),
        });
        setIsBanDialogOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to ban user");
      },
    }),
  );

  const unbanMutation = useMutation(
    trpc.user.unbanUser.mutationOptions({
      onSuccess: () => {
        toast.success("User unbanned successfully");
        queryClient.invalidateQueries({
          queryKey: trpc.user.getAll.queryKey(),
        });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to unban user");
      },
    }),
  );

  const form = useForm<z.infer<typeof banFormSchema>>({
    resolver: zodResolver(banFormSchema),
    defaultValues: {
      banReason: "",
    },
  });

  const onBanSubmit = (values: z.infer<typeof banFormSchema>) => {
    banMutation.mutate({
      userId: user.id,
      banReason: values.banReason,
    });
  };

  return (
    <>
      <Dialog
        open={isBanDialogOpen || banMutation.isPending}
        onOpenChange={setIsBanDialogOpen}
      >
        <DialogContent className="sm:max-w-sm">
          <form
            onSubmit={form.handleSubmit(onBanSubmit)}
            id={`ban-form-${user.id}`}
          >
            <DialogHeader>
              <DialogTitle>Ban User</DialogTitle>
              <DialogDescription>
                Provide a reason for banning this user.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <FieldGroup>
                <Controller
                  name="banReason"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`banReason-${user.id}`}>
                        Ban Reason
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id={`banReason-${user.id}`}
                        placeholder="Enter ban reason here..."
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>
            <DialogFooter>
              <DialogClose asChild disabled={banMutation.isPending}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                form={`ban-form-${user.id}`}
                disabled={banMutation.isPending}
              >
                {banMutation.isPending && <Spinner />}
                {banMutation.isPending ? "Banning..." : "Ban User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <LuEllipsis className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(user.id);
            }}
          >
            Copy User ID
          </DropdownMenuItem>
          {user.banned ? (
            <DropdownMenuItem
              onClick={() => unbanMutation.mutate({ userId: user.id })}
              disabled={unbanMutation.isPending}
            >
              {unbanMutation.isPending ? "Unbanning..." : "Unban User"}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => setIsBanDialogOpen(true)}
              disabled={banMutation.isPending || unbanMutation.isPending}
            >
              Ban User
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

export const columns: ColumnDef<UserType>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        User ID
        <LuArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <div
          className="text-muted-foreground font-mono text-xs max-w-[120px] truncate"
          title={row.getValue("id")}
        >
          {row.getValue("id")}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <LuArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <LuArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "points",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Points
        <LuArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const points = row.getValue("points") as number;
      return (
        <div className="font-medium px-4">
          {points?.toLocaleString()} Points
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Role
        <LuArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return <div className="capitalize px-4">{role || "User"}</div>;
    },
  },
  {
    accessorKey: "banned",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <LuArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const isBanned = row.getValue("banned") as boolean;
      return (
        <div
          className={`capitalize font-medium px-4 ${isBanned ? "text-red-500" : "text-green-500"}`}
        >
          {isBanned ? "Banned" : "Active"}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Joined At
        <LuArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const val = row.getValue("createdAt");
      const date = val instanceof Date ? val : new Date(val as string);
      return <div className="px-4">{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <UserRowActions user={row.original} />,
  },
];
