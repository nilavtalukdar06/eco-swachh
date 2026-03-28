import { getQueryClient, trpc } from "@/dal/server";
import {
  AdminReports,
  cursorParser,
  statusParser,
  priorityParser,
} from "@/features/report/ui/admin-reports";
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

export default async function AllReportsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const result = await auth.api.getSession({ headers: await headers() });
  const queryClient = getQueryClient();

  if (result?.session) {
    const { status, cursor, priority } = searchParamsCache.parse(searchParams);
    void queryClient.prefetchQuery(
      trpc.report.getAll.queryOptions({
        status: status ?? undefined,
        cursor: cursor ?? undefined,
        priority: priority ?? undefined,
      }),
    );
  }

  return (
    <div className="w-full p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">All Reports</h1>
        <p className="text-sm text-muted-foreground font-light max-w-lg mt-1">
          View and manage waste reports submitted by users. Resolve reports to
          award users 20 points.
        </p>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary fallback={<ErrorComponent />}>
          <Suspense fallback={<LoadingComponent />}>
            <AdminReports />
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
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton className="w-full h-48" key={i} />
      ))}
    </div>
  );
}
