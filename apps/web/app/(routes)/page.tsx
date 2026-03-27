import { DashboardStats } from "@/features/dashboard/ui/dashboard-stats";
import { LeaderboardTable } from "@/features/leaderboard/ui/leaderboard-table";

export default function Home() {
  return (
    <div className="w-full p-4">
      <p className="text-lg">Dashboard</p>
      <p className="text-xs text-muted-foreground font-light max-w-2xl">
        Welcome to Eco Swachh, your intelligent waste management dashboard for
        tracking reports, monitoring collection, and visualizing impact in real
        time across communities.
      </p>
      <DashboardStats />
      <LeaderboardTable />
    </div>
  );
}
