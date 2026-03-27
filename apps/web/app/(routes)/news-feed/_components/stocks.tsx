export function StocksError() {
  return (
    <div className="my-2 p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
      <p className="text-red-500 font-light text-xs">
        Failed to load sustainability stock data
      </p>
    </div>
  );
}

export function StocksLoading() {
  return (
    <div className="my-2 p-2 bg-muted">
      <p className="text-accent-foreground font-light text-xs animate-pulse">
        Loading real-time sustainability stock quotes.....
      </p>
    </div>
  );
}
