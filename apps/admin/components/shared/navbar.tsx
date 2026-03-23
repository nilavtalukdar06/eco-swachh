"use client";

import { LogoutButton } from "@/features/auth/ui/logout-button";
import { Sun, Moon } from "@phosphor-icons/react";
import { Button } from "@workspace/ui/components/button";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import React from "react";

export function Navbar() {
  const { setTheme } = useTheme();
  return (
    <header className="w-full flex justify-between items-center gap-2 p-2 border-b">
      <SidebarTrigger />
      <div className="flex justify-center items-center gap-x-2">
        <ThemeChanger setTheme={setTheme} />
        <LogoutButton />
      </div>
    </header>
  );
}

function ThemeChanger({
  setTheme,
}: {
  setTheme: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
