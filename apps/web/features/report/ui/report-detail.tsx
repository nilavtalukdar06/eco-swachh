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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
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
      <div className="relative w-full h-64 sm:h-80 rounded-lg overflow-hidden border">
        <Image
          src={report.imageUrl}
          alt={report.aiTitle}
          fill
          className="object-cover"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">AI Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {report.aiDescription}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Your Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {report.userDescription}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Waste Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {report.wasteDetails}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Disposal Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {report.disposalInstructions}
            </p>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm text-destructive">
              ⚠ Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{report.warnings}</p>
          </CardContent>
        </Card>
        {(hasCoordinates || report.manualLocation) && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin weight="fill" className="text-primary" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasCoordinates ? (
                <p className="text-sm text-muted-foreground">
                  Coordinates: {report.latitude?.toFixed(6)},{" "}
                  {report.longitude?.toFixed(6)}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {report.manualLocation}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
