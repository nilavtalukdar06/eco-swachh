"use client";

import { SignOutIcon } from "@phosphor-icons/react";
import { Button } from "@workspace/ui/components/button";
import { useLogout } from "../hooks/use-auth";
import { Spinner } from "@workspace/ui/components/spinner";

export function LogoutButton() {
  const { isLoading, logout } = useLogout();
  async function handleLogout() {
    await logout();
  }
  return (
    <Button disabled={isLoading} onClick={handleLogout} variant="destructive">
      <span>{isLoading ? "Loading..." : "Logout"}</span>
      {isLoading ? <Spinner /> : <SignOutIcon />}
    </Button>
  );
}
