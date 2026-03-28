export function LeaderboardError() {
  return (
    <div className="my-2 p-2 bg-red-50">
      <p className="text-red-500 font-light text-xs">
        Failed to fetch leaderboard
      </p>
    </div>
  );
}

export function LeaderboardLoading() {
  return (
    <div className="my-2 p-2 bg-muted">
      <p className="text-accent-foreground font-light text-xs animate-pulse">
        Loading the latest Eco Swachh top contributors.....
      </p>
    </div>
  );
}
