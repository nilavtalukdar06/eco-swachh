"use client";

import {
  CoinsIcon,
  LeafIcon,
  MapPinIcon,
  RecycleIcon,
} from "@phosphor-icons/react";
import { StatusCard } from "@/features/dashboard/ui/dashboard-stats";

export function DashboardStatsError() {
  return (
    <div className="w-full my-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 place-items-center">
      <StatusCard title="Reports Submitted" data="0" icon={MapPinIcon} />
      <StatusCard title="Waste Reported" data="0kg" icon={RecycleIcon} />
      <StatusCard title="Points Earned" data="0" icon={CoinsIcon} />
      <StatusCard title="CO2 Offset" data="0kg" icon={LeafIcon} />
    </div>
  );
}

export function DashboardStatsLoading() {
  return (
    <div className="w-full my-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 place-items-center animate-pulse">
      <StatusCard title="Reports Submitted" data="..." icon={MapPinIcon} />
      <StatusCard title="Waste Reported" data="..." icon={RecycleIcon} />
      <StatusCard title="Points Earned" data="..." icon={CoinsIcon} />
      <StatusCard title="CO2 Offset" data="..." icon={LeafIcon} />
    </div>
  );
}
