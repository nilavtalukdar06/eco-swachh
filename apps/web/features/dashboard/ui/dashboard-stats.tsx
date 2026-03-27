"use client";

import {
  CoinsIcon,
  type Icon,
  LeafIcon,
  MapPinIcon,
  RecycleIcon,
} from "@phosphor-icons/react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

export function DashboardStats() {
  return (
    <div className="w-full my-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 place-items-center">
      <StatusCard title="Reports Submitted" data="4" icon={MapPinIcon} />
      <StatusCard title="Waste Reported" data="250kg" icon={RecycleIcon} />
      <StatusCard title="Points Earned" data="45" icon={CoinsIcon} />
      <StatusCard title="CO2 Offset" data="125" icon={LeafIcon} />
    </div>
  );
}

export function StatusCard({
  title,
  icon: Icon,
  data,
}: {
  title: string;
  icon: Icon;
  data: string;
}) {
  return (
    <Card className="w-full h-full shadow-none bg-sidebar">
      <CardHeader>
        <div className="p-2 mb-2 bg-green-50 dark:bg-green-950 w-fit border border-green-200 dark:border-green-800">
          <Icon className="size-4 text-green-600" />
        </div>
        <div className="flex flex-col-reverse justify-center items-start gap-2">
          <CardTitle>{data}</CardTitle>
          <CardDescription>{title}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}
