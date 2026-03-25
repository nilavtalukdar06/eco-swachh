import { getQueryClient, trpc } from "@/dal/server";
import { UserTable } from "@/features/users/ui/user-table";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

export default async function ManageUsers() {
  const queryClient = getQueryClient();
  const result = await auth.api.getSession({
    headers: await headers(),
  });
  if (result?.session) {
    void queryClient.prefetchQuery(trpc.user.getAll.queryOptions());
  }
  return (
    <div className="w-full p-4">
      <div className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight">Manage Users</h1>
        <p className="text-sm text-muted-foreground font-light max-w-lg mt-1">
          Manage all of your users at one place
        </p>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ErrorBoundary fallback={<ErrorComponent />}>
          <Suspense fallback={<LoadingComponent />}>
            <UserTable />
          </Suspense>
        </ErrorBoundary>
      </HydrationBoundary>
    </div>
  );
}

export function ErrorComponent() {
  return (
    <div className="w-full my-4">
      <p className="text-sm text-red-500 font-light">
        Failed to fetch the users
      </p>
    </div>
  );
}

export function LoadingComponent() {
  return (
    <div className="w-full my-4 flex justify-start items-center">
      <p className="text-sm text-muted-foreground font-extralight animate-pulse">
        Loading all the users...
      </p>
    </div>
  );
}
