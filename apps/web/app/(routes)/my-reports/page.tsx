import { getQueryClient, trpc } from "@/dal/server";
import { AddReport } from "@/features/report/ui/add-report";
import {
  MyReports,
  cursorParser,
  statusParser,
  priorityParser,
} from "@/features/report/ui/my-reports";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { createSearchParamsCache } from "nuqs/server";

const searchParamsCache = createSearchParamsCache({
  cursor: cursorParser,
  status: statusParser,
  priority: priorityParser,
});

export default async function MyReportsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const result = await auth.api.getSession({ headers: await headers() });
  const queryClient = getQueryClient();

  if (result?.session) {
    const { cursor, status, priority } = searchParamsCache.parse(searchParams);
    void queryClient.prefetchQuery(
      trpc.reports.getAll.queryOptions({
        cursor: cursor ?? undefined,
        status: status ?? undefined,
        priority: priority ?? undefined,
      }),
    );
  }

  return (
    <div className="w-full p-4">
      <p className="text-lg">My Reports</p>
      <p className="text-xs text-muted-foreground font-light max-w-lg">
        Submit waste reports with photos and let our AI analyze them. Track your
        submissions and contribute to cleaner communities.
      </p>
      <div className="my-2">
        <AddReport />
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary fallback={<ErrorComponent />}>
          <Suspense fallback={<LoadingComponent />}>
            <MyReports />
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
        Failed to fetch reports
      </p>
    </div>
  );
}

function LoadingComponent() {
  return (
    <div className="w-full my-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="w-full h-32" />
          <Skeleton className="w-3/4 h-4" />
          <Skeleton className="w-full h-3" />
        </div>
      ))}
    </div>
  );
}
