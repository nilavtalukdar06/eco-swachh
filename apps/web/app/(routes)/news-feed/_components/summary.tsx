export function SummaryError() {
  return (
    <div className="my-2 p-2 bg-red-50">
      <p className="text-red-500 font-light text-xs">
        Failed to fetch summary from AI and Web Scrappers
      </p>
    </div>
  );
}

export function SummaryLoading() {
  return (
    <div className="my-2 p-2 bg-muted">
      <p className="text-accent-foreground font-light text-xs animate-pulse">
        Loading summary of what happened in the world in the last 24 hours in
        the field of sustainability.....
      </p>
    </div>
  );
}
