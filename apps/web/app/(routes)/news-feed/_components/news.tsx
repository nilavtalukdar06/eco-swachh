export function NewsError() {
  return (
    <div className="my-2 p-2 bg-red-50">
      <p className="text-red-500 font-light text-xs">
        Failed to fetch latest news from scrappers
      </p>
    </div>
  );
}

export function NewsLoading() {
  return (
    <div className="my-2 p-2 bg-muted">
      <p className="text-accent-foreground font-light text-xs animate-pulse">
        Loading a news feed of what happened in the India in the last 24 hours in
        the field of sustainability.....
      </p>
    </div>
  );
}
