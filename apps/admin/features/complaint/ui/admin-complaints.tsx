"use client";

import { useTRPC } from "@/dal/client";
import { Trash, CheckCircle } from "@phosphor-icons/react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
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
import { useCallback, useState } from "react";
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

  const resolveMutation = useMutation(
    trpc.complaint.resolve.mutationOptions({
      onSuccess: () => {
        toast.success("Complaint Resolved Successfully");
        queryClient.invalidateQueries({
          queryKey: trpc.complaint.getAll.queryKey(),
        });
        setIsResolveOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to resolve complaint");
      },
    }),
  );

  const [isResolveOpen, setIsResolveOpen] = useState(false);

  const formSchema = z.object({
    comment: z
      .string()
      .min(5, "Comment is too short")
      .max(200, "Comment is too long"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: "",
    },
  });

  const handleDelete = (complaintId: string) =>
    mutation.mutate({ complaintId });

  function onResolveSubmit(values: z.infer<typeof formSchema>) {
    resolveMutation.mutate({
      complaintId: complaint.id,
      comment: values.comment,
    });
  }

  return (
    <>
      <Dialog
        open={isResolveOpen || resolveMutation.isPending}
        onOpenChange={setIsResolveOpen}
      >
        <DialogContent className="sm:max-w-sm">
          <form
            onSubmit={form.handleSubmit(onResolveSubmit)}
            id={`resolve-form-${complaint.id}`}
          >
            <DialogHeader>
              <DialogTitle>Resolve Complaint</DialogTitle>
              <DialogDescription>
                Provide a comment explaining how this complaint was resolved.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <FieldGroup>
                <Controller
                  name="comment"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`comment-${complaint.id}`}>
                        Resolution Comment
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id={`comment-${complaint.id}`}
                        placeholder="Enter your comment here"
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
              <DialogClose asChild disabled={resolveMutation.isPending}>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => form.reset()}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                form={`resolve-form-${complaint.id}`}
                disabled={resolveMutation.isPending}
              >
                {resolveMutation.isPending && <Spinner />}
                {resolveMutation.isPending ? "Resolving..." : "Resolve"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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
                  {complaint.status === "PENDING" && (
                    <DropdownMenuItem
                      onClick={() => setIsResolveOpen(true)}
                      disabled={mutation.isPending || resolveMutation.isPending}
                    >
                      <CheckCircle />
                      Resolve It
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-red-500 focus:text-red-500"
                    onClick={() => handleDelete(complaint.id)}
                    disabled={mutation.isPending || resolveMutation.isPending}
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
    </>
  );
}
