"use client";

import { useTRPC } from "@/dal/client";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
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
import { cn } from "@workspace/ui/lib/utils";
import { ArrowLeft, MapPin, CheckCircle, User } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import Image from "next/image";
import { useState } from "react";
import { LocationMapDialog } from "./location-map-dialog";

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

const resolveFormSchema = z.object({
  comment: z
    .string()
    .min(5, "Comment is too short")
    .max(500, "Comment is too long"),
});

export function AdminReportDetail({ reportId }: { reportId: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [resolveOpen, setResolveOpen] = useState(false);

  const { data: report } = useSuspenseQuery(
    trpc.report.getById.queryOptions({ reportId }),
  );

  const resolveMutation = useMutation(
    trpc.report.resolve.mutationOptions({
      onSuccess: () => {
        toast.success("Report resolved successfully! User awarded 20 points.");
        queryClient.invalidateQueries({
          queryKey: trpc.report.getAll.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.report.getById.queryKey(),
        });
        setResolveOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to resolve report");
      },
    }),
  );

  const form = useForm<z.infer<typeof resolveFormSchema>>({
    resolver: zodResolver(resolveFormSchema),
    defaultValues: {
      comment: "",
    },
  });

  function onResolveSubmit(values: z.infer<typeof resolveFormSchema>) {
    resolveMutation.mutate({
      reportId: report!.id,
      comment: values.comment,
    });
  }

  if (!report) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">Report not found.</p>
      </div>
    );
  }

  const hasCoordinates = report.latitude != null && report.longitude != null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
          >
            <ArrowLeft weight="bold" />
          </Button>
          <div>
            <h1 className="text-lg font-medium">{report.status === "SPAM" ? "Spam Report" : report.aiTitle}</h1>
            <p className="text-xs text-muted-foreground">
              Submitted {format(new Date(report.createdAt), "PPPp")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(hasCoordinates || report.manualLocation) && (
            <LocationMapDialog
              latitude={report.latitude}
              longitude={report.longitude}
              manualLocation={report.manualLocation}
            />
          )}
          {report.status === "PENDING" && (
            <Button
              size="sm"
              onClick={() => setResolveOpen(true)}
              className="gap-1.5"
            >
              <CheckCircle weight="bold" />
              Resolve Report
            </Button>
          )}
          {report.status === "RESOLVED" && (
            <Badge
              variant="outline"
              className="border-0 bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 text-sm px-3 py-1"
            >
              ✓ Resolved
            </Badge>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant="outline"
          className={cn("border-0", STATUS_STYLES[report.status])}
        >
          {report.status}
        </Badge>
        {report.status !== "SPAM" && (
          <>
            <Badge
              variant="outline"
              className={cn("border-0", PRIORITY_STYLES[report.priority])}
            >
              {report.priority} Priority
            </Badge>
            <Badge variant="outline">{report.wasteType}</Badge>
            <Badge variant="secondary">~{report.estimatedWeight} kg</Badge>
          </>
        )}
      </div>

      {/* Image */}
      <div className="relative w-full h-64 sm:h-80 overflow-hidden border">
        <Image
          src={report.imageUrl}
          alt={report.aiTitle}
          fill
          className="object-cover"
        />
      </div>

      {/* Submitted By */}
      <div className="p-4 border bg-sidebar rounded-lg">
        <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
          <User weight="fill" className="text-primary" />
          Submitted By
        </p>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Name:</span>{" "}
            {report.user.name}
          </p>
          <p>
            <span className="font-medium text-foreground">Email:</span>{" "}
            {report.user.email}
          </p>
        </div>
      </div>

      {/* Report Details */}
      <div>
        <h3 className="text-sm mb-4">Report Details</h3>

        {report.status === "SPAM" ? (
          <div className="space-y-5 text-sm text-muted-foreground">
            <div>
              <p className="text-foreground mb-1">Spam Reason</p>
              <p className="font-light">{(report as any).spamReports?.spamReason || "Identified as spam"}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-5 text-sm text-muted-foreground">
            <div>
              <p className="text-foreground mb-1">AI Analysis</p>
              <p className="font-light">{report.aiDescription}</p>
            </div>
            <div>
              <p className="text-foreground mb-1">Waste Details</p>
              <p className="font-light">{report.wasteDetails}</p>
            </div>
            <div className="p-4 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
              <p className="text-destructive mb-1">⚠ Warnings</p>
              <p className="text-destructive font-light">{report.warnings}</p>
            </div>
            <div className="p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
              <p className="mb-1 text-green-600">Disposal Instructions</p>
              <p className="text-green-500 font-light">
                {report.disposalInstructions}
              </p>
            </div>
            {(hasCoordinates || report.manualLocation) && (
              <div>
                <p className="font-medium text-foreground mb-1 flex items-center gap-2">
                  <MapPin weight="fill" className="text-primary" />
                  Location
                </p>
                {hasCoordinates ? (
                  <p>
                    Coordinates: {report.latitude?.toFixed(6)},{" "}
                    {report.longitude?.toFixed(6)}
                  </p>
                ) : (
                  <p>{report.manualLocation}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resolve Dialog */}
      <Dialog
        open={resolveOpen || resolveMutation.isPending}
        onOpenChange={setResolveOpen}
      >
        <DialogContent className="sm:max-w-sm">
          <form
            onSubmit={form.handleSubmit(onResolveSubmit)}
            id={`resolve-form-${reportId}`}
          >
            <DialogHeader>
              <DialogTitle>Resolve Report</DialogTitle>
              <DialogDescription>
                Provide a comment explaining how this report was resolved. The
                user will be awarded 20 points upon resolution.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <FieldGroup>
                <Controller
                  name="comment"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`resolve-comment-${reportId}`}>
                        Resolution Comment
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id={`resolve-comment-${reportId}`}
                        placeholder="Describe how this report was resolved..."
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
                form={`resolve-form-${reportId}`}
                disabled={resolveMutation.isPending}
              >
                {resolveMutation.isPending && <Spinner />}
                {resolveMutation.isPending ? "Resolving..." : "Resolve"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
