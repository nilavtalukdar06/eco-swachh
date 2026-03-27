"use client";

import { useTRPC } from "@/dal/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";

export function Summary() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.ai.generateSummary.queryOptions());
  return (
    <div className="my-2 p-2 bg-yellow-50 border border-yellow-200">
      <div className="text-yellow-600 font-light text-xs leading-snug tracking-wide">
        <ReactMarkdown>{data?.result}</ReactMarkdown>
      </div>
    </div>
  );
}
