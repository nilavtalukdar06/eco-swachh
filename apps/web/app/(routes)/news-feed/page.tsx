import { getQueryClient, trpc } from "@/dal/server";
import { Summary } from "@/features/news/ui/summary";
import { auth } from "@/lib/auth";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { ErrorBoundary } from "react-error-boundary";
import { SummaryError, SummaryLoading } from "./_components/summary";
import { Suspense } from "react";

export default async function NewsFeed() {
  const queryClient = getQueryClient();
  const result = await auth.api.getSession({
    headers: await headers(),
  });
  if (result?.session) {
    void queryClient.prefetchQuery(trpc.ai.generateSummary.queryOptions());
  }
  return (
    <div className="w-full p-4">
      <p className="text-lg">Your Daily Intelligence Feed</p>
      <p className="text-xs text-muted-foreground font-light max-w-lg">
        Stay updated with real-time global insights, breaking developments, and
        AI-curated analysis from across the web.
      </p>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary fallback={<SummaryError />}>
          <Suspense fallback={<SummaryLoading />}>
            <Summary />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </div>
  );
}
