import { getQueryClient, trpc } from "@/dal/server";
import { AdminReportDetail } from "@/features/report/ui/admin-report-detail";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Skeleton } from "@workspace/ui/components/skeleton";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const result = await auth.api.getSession({ headers: await headers() });
  const queryClient = getQueryClient();
  const { id } = await params;

  if (result?.session) {
    void queryClient.prefetchQuery(
      trpc.report.getById.queryOptions({ reportId: id }),
    );
  }

  return (
    <div className="w-full p-4">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary fallback={<ErrorComponent />}>
          <Suspense fallback={<LoadingComponent />}>
            <AdminReportDetail reportId={id} />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </div>
  );
}

function ErrorComponent() {
  return (
    <div className="w-full my-4">
      <p className="text-sm font-light text-red-500">
        Failed to load report details
      </p>
    </div>
  );
}

function LoadingComponent() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Skeleton className="w-48 h-6" />
      <div className="flex gap-2">
        <Skeleton className="w-20 h-6" />
        <Skeleton className="w-20 h-6" />
      </div>
      <Skeleton className="w-full h-64 rounded-lg" />
      <Skeleton className="w-full h-24 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-32 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
