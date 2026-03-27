"use client";

import { useTRPC } from "@/dal/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";

export function NewsFeed() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.news.fetchNews.queryOptions());
  return (
    <div className="w-full my-2">
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {data.web.map((item) => (
          <Card
            className="overflow-hidden pt-0 w-full h-full"
            key={item.position}
          >
            <CardContent className="px-0">
              <img
                src={item.metadata.ogImage ?? "/fallback.jpg"}
                alt="Banner"
                className="aspect-video w-92 object-cover"
              />
            </CardContent>
            <CardHeader>
              <CardTitle className="line-clamp-2">{item.title}</CardTitle>
              <CardDescription className="line-clamp-6">
                {item.summary}
              </CardDescription>
            </CardHeader>
            <CardFooter className="gap-3 max-sm:flex-col max-sm:items-stretch">
              <Button>
                <a href={item.url}>Open Article</a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
