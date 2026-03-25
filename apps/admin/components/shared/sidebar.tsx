"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdDashboard, MdWarning } from "react-icons/md";
import { FaUserLock } from "react-icons/fa";

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="w-full flex justify-between items-center">
            <SidebarMenuButton asChild className="hover:bg-transparent!">
              <Link href="/">
                <Image
                  src="/logo.svg"
                  height={24}
                  width={120}
                  alt="eco-swachh logo"
                  className="group-data-[collapsible=icon]:hidden"
                />
                <Image
                  src="/icon.svg"
                  height={24}
                  width={24}
                  alt="eco-swachh icon"
                  className="hidden group-data-[collapsible=icon]:inline-flex"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Items</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={isActive("/") ? "bg-background border" : ""}
                >
                  <Link href="/">
                    <MdDashboard />
                    <span className="group-data-[collapsible=icon]:hidden">
                      All Reports
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={
                    isActive("/complaint") ? "bg-background border" : ""
                  }
                >
                  <Link href="/complaint">
                    <MdWarning />
                    <span className="group-data-[collapsible=icon]:hidden">
                      My Complaints
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={
                    isActive("/manage-users") ? "bg-background border" : ""
                  }
                >
                  <Link href="/manage-users">
                    <FaUserLock />
                    <span className="group-data-[collapsible=icon]:hidden">
                      Manage Users
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}
