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
import { FaHackerNews } from "react-icons/fa";
import { LuRecycle } from "react-icons/lu";

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
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
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
                      Dashboard
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={
                    isActive("/my-reports") ? "bg-background border" : ""
                  }
                >
                  <Link href="/my-reports">
                    <LuRecycle />
                    <span className="group-data-[collapsible=icon]:hidden">
                      My Reports
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Other Items</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={
                    isActive("/news-feed") ? "bg-background border" : ""
                  }
                >
                  <Link href="/news-feed">
                    <FaHackerNews />
                    <span className="group-data-[collapsible=icon]:hidden">
                      News Feed
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
                      Complaint
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
