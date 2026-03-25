import { getQueryClient, trpc } from "@/dal/server";
import {
  AdminComplaints,
  statusParser,
  cursorParser,
} from "@/features/complaint/ui/admin-complaints";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { createSearchParamsCache } from "nuqs/server";

const searchParamsCache = createSearchParamsCache({
  status: statusParser,
  cursor: cursorParser,
});

export default async function ComplaintPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const result = await auth.api.getSession({ headers: await headers() });
  const queryClient = getQueryClient();
  
  if (result?.session) {
    const { status, cursor } = searchParamsCache.parse(searchParams);
    void queryClient.prefetchQuery(
      trpc.complaint.getAll.queryOptions({
        status: status ?? undefined,
        cursor: cursor ?? undefined,
      }),
    );
  }

  return (
    <div className="w-full p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Complaints</h1>
        <p className="text-sm text-muted-foreground font-light max-w-lg mt-1">
          View and manage complaints submitted by users.
        </p>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary fallback={<ErrorComponent />}>
          <Suspense fallback={<LoadingComponent />}>
            <AdminComplaints />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </div>
  );
}

export function ErrorComponent() {
  return (
    <div className="w-full my-4">
      <p className="text-sm font-light text-red-500">
        Failed to fetch complaints
      </p>
    </div>
  );
}

export function LoadingComponent() {
  return (
    <div className="w-full my-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton className="w-full h-32" key={i} />
      ))}
    </div>
  );
}
