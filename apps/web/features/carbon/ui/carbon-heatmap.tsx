"use client";

import { useTRPC } from "@/dal/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

function getIntensityColor(value: number): string {
  if (value <= 150) return "#22c55e";
  if (value <= 300) return "#84cc16";
  if (value <= 500) return "#eab308";
  if (value <= 700) return "#f97316";
  return "#ef4444";
}

function getIntensityLabel(value: number): string {
  if (value <= 150) return "Very Low";
  if (value <= 300) return "Low";
  if (value <= 500) return "Moderate";
  if (value <= 700) return "High";
  return "Very High";
}

const LEGEND_ITEMS = [
  { label: "Very Low", range: "≤150", color: "#22c55e" },
  { label: "Low", range: "151–300", color: "#84cc16" },
  { label: "Moderate", range: "301–500", color: "#eab308" },
  { label: "High", range: "501–700", color: "#f97316" },
  { label: "Very High", range: ">700", color: "#ef4444" },
];

export function CarbonHeatmap() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.carbon.getCarbonIntensity.queryOptions(),
  );
  const { resolvedTheme } = useTheme();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  const isDark = resolvedTheme === "dark";
  const mapStyle = isDark
    ? "mapbox://styles/mapbox/dark-v11"
    : "mapbox://styles/mapbox/light-v11";

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [78.9629, 22.5937],
      zoom: 4.2,
      attributionControl: false,
      minZoom: 3,
      maxZoom: 8,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right",
    );

    mapRef.current = map;

    map.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, [mapStyle]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !data) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    data.forEach((city) => {
      const color = getIntensityColor(city.carbonIntensity);
      const label = getIntensityLabel(city.carbonIntensity);

      const el = document.createElement("div");
      el.className = "carbon-marker";
      el.style.cssText = `
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: ${color};
        border: 2px solid ${isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"};
        box-shadow: 0 0 8px ${color}80, 0 0 16px ${color}40;
        cursor: pointer;
        transition: transform 0.2s ease;
      `;
      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.4)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
      });

      const popup = new mapboxgl.Popup({
        offset: 12,
        closeButton: false,
        className: "carbon-popup",
      }).setHTML(`
        <div style="
          padding: 8px 12px;
          font-family: var(--font-mono), monospace;
          font-size: 12px;
          line-height: 1.5;
          background: ${isDark ? "#1c1c1c" : "#ffffff"};
          color: ${isDark ? "#f5f5f5" : "#171717"};
          border: 1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"};
          border-radius: 8px;
        ">
          <div style="font-weight: 600; margin-bottom: 4px;">${city.name}</div>
          <div style="color: ${isDark ? "#a3a3a3" : "#737373"}; font-size: 10px; margin-bottom: 6px;">${city.zoneName} (${city.zone})</div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="
              display: inline-block;
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: ${color};
              box-shadow: 0 0 4px ${color}80;
            "></span>
            <span style="font-weight: 500;">${Math.round(city.carbonIntensity)} gCO₂/kWh</span>
            <span style="
              font-size: 9px;
              padding: 1px 6px;
              border-radius: 4px;
              background: ${color}20;
              color: ${color};
              font-weight: 600;
            ">${label}</span>
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([city.lng, city.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [mapLoaded, data, isDark]);

  return (
    <div className="w-full my-2">
      <div className="relative w-full rounded-lg overflow-hidden border border-border">
        <div
          ref={mapContainer}
          className="w-full h-[350px] sm:h-[400px] md:h-[500px]"
        />

        {/* Legend overlay */}
        <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
          <p className="text-[10px] font-semibold text-card-foreground mb-2 tracking-wider uppercase">
            CO₂ Intensity (gCO₂/kWh)
          </p>
          <div className="flex flex-col gap-1">
            {LEGEND_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    background: item.color,
                    boxShadow: `0 0 4px ${item.color}60`,
                  }}
                />
                <span className="text-[10px] text-muted-foreground font-light">
                  {item.range}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
          <p className="text-xs font-semibold text-card-foreground">
            Carbon Emission Heatmap
          </p>
          <p className="text-[10px] text-muted-foreground font-light">
            Live electricity carbon intensity across India
          </p>
        </div>
      </div>
    </div>
  );
}
