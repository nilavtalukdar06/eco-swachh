import { getQueryClient, trpc } from "@/dal/server";
import { AddComplaint } from "@/features/complaint/ui/add-complaint";
import {
  MyComplaints,
  statusParser,
  cursorParser,
} from "@/features/complaint/ui/my-complaints";
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
      trpc.complaints.getAll.queryOptions({
        status: status ?? undefined,
        cursor: cursor ?? undefined,
      }),
    );
  }

  return (
    <div className="w-full p-4">
      <p className="text-lg">Submit a complaint</p>
      <p className="text-xs text-muted-foreground font-light max-w-lg">
        Please describe your concerns in detail so we can forward them to the
        appropriate authority.
      </p>
      <div className="my-2">
        <AddComplaint />
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary fallback={<ErrorComponent />}>
          <Suspense fallback={<LoadingComponent />}>
            <MyComplaints />
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
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton className="w-full h-24" key={i} />
      ))}
    </div>
  );
}
