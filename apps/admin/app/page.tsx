import { LogoutButton } from "@/features/auth/ui/logout-button";

export default function Home() {
  return (
    <div className="w-full p-4">
      <p className="text-muted-foreground font-light">Home</p>
      <div className="my-2">
        <LogoutButton />
      </div>
    </div>
  );
}
