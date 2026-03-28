"use client";

import { useTRPC } from "@/dal/client";
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
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/utils";
import { Trash, MapPin, ArrowLeft } from "@phosphor-icons/react";
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

export function ReportDetail({ reportId }: { reportId: string }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: report } = useSuspenseQuery(
    trpc.reports.getById.queryOptions({ reportId }),
  );

  const deleteMutation = useMutation(
    trpc.reports.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Report deleted successfully");
        queryClient.invalidateQueries({
          queryKey: trpc.reports.getAll.queryKey(),
        });
        router.push("/my-reports");
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to delete report");
      },
    }),
  );

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/my-reports")}
          >
            <ArrowLeft weight="bold" />
          </Button>
          <div>
            <h1 className="text-lg font-medium">{report.aiTitle}</h1>
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
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash weight="bold" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Delete Report</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this report? This action
                  cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate({ reportId: report.id })}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending && <Spinner />}
                  {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant="outline"
          className={cn("border-0", STATUS_STYLES[report.status])}
        >
          {report.status}
        </Badge>
        <Badge
          variant="outline"
          className={cn("border-0", PRIORITY_STYLES[report.priority])}
        >
          {report.priority} Priority
        </Badge>
        <Badge variant="outline">{report.wasteType}</Badge>
        <Badge variant="secondary">~{report.estimatedWeight} kg</Badge>
      </div>
      <div className="relative w-full h-64 sm:h-80 overflow-hidden border">
        <Image
          src={report.imageUrl}
          alt={report.aiTitle}
          fill
          className="object-cover"
        />
      </div>
      <div>
        <h3 className="text-sm mb-4">Report Details</h3>

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
      </div>
    </div>
  );
}
