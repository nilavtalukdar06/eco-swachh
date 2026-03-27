export function HeatmapError() {
  return (
    <div className="my-2 p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
      <p className="text-red-500 font-light text-xs">
        Failed to load carbon emission heatmap data
      </p>
    </div>
  );
}

export function HeatmapLoading() {
  return (
    <div className="my-2 p-2 bg-muted">
      <p className="text-accent-foreground font-light text-xs animate-pulse">
        Loading carbon emission heatmap across India.....
      </p>
    </div>
  );
}
