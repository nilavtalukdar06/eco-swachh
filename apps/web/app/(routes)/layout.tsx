import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { SidebarProvider } from "@workspace/ui/components/sidebar";
import { AppSidebar } from "@/components/shared/sidebar";

export default async function Layout({
  children,
}: {
  children: Readonly<React.ReactNode>;
}) {
  const result = await auth.api.getSession({
    headers: await headers(),
  });
  if (!result?.session) {
    redirect("/auth/login");
  }
  return (
    <SidebarProvider>
      <AppSidebar />
      <React.Fragment>{children}</React.Fragment>
    </SidebarProvider>
  );
}
