import { getQueryClient, trpc } from "@/dal/server";
import { Summary } from "@/features/news/ui/summary";
import { auth } from "@/lib/auth";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { headers } from "next/headers";
import { ErrorBoundary } from "react-error-boundary";
import { SummaryError, SummaryLoading } from "./_components/summary";
import { Suspense } from "react";
import { NewsError, NewsLoading } from "./_components/news";
import { NewsFeed } from "@/features/news/ui/news-feed";

export default async function NewsFeedPage() {
  const queryClient = getQueryClient();
  const result = await auth.api.getSession({
    headers: await headers(),
  });
  if (result?.session) {
    void queryClient.prefetchQuery(trpc.ai.generateSummary.queryOptions());
  }
  if (result?.session) {
    void queryClient.prefetchQuery(trpc.news.fetchNews.queryOptions());
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
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary fallback={<NewsError />}>
          <Suspense fallback={<NewsLoading />}>
            <NewsFeed />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </div>
  );
}
