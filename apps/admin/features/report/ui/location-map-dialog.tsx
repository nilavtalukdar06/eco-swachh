"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { MapPin } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
// @ts-ignore
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";

interface LocationMapDialogProps {
  latitude: number | null;
  longitude: number | null;
  manualLocation: string | null;
}

export function LocationMapDialog({
  latitude,
  longitude,
  manualLocation,
}: LocationMapDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const hasCoordinates = latitude != null && longitude != null;

  useEffect(() => {
    if (!isOpen || !hasCoordinates) return;
    let frameId: number;
    let timeoutId: NodeJS.Timeout;

    const initMap = () => {
      if (!mapContainer.current) return;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [longitude!, latitude!],
        zoom: 16,
        pitch: 60,
        bearing: -30,
        antialias: true,
      });

      map.addControl(new mapboxgl.NavigationControl(), "top-right");

      new mapboxgl.Marker({ color: "#ef4444" })
        .setLngLat([longitude!, latitude!])
        .addTo(map);

      const directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken,
        unit: "metric",
        profile: "mapbox/driving",
        controls: {
          inputs: false,
          instructions: true,
        },
      });

      map.addControl(directions, "top-left");

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userCoords: [number, number] = [
            pos.coords.longitude,
            pos.coords.latitude,
          ];

          directions.setOrigin(userCoords);
          directions.setDestination([longitude!, latitude!]);

          map.flyTo({
            center: userCoords,
            zoom: 14,
            pitch: 60,
            bearing: -20,
            speed: 0.8,
          });
        },
        () => {
          directions.setOrigin([78.9629, 22.5937]);
          directions.setDestination([longitude!, latitude!]);
        },
        { timeout: 5000, enableHighAccuracy: false }
      );

      map.on("style.load", () => {
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });

        map.setTerrain({
          source: "mapbox-dem",
          exaggeration: 1.5,
        });

        map.addLayer({
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": "#aaa",
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": ["get", "min_height"],
            "fill-extrusion-opacity": 0.6,
          },
        });
      });

      mapRef.current = map;

      // Ensure map resizes correctly on mobile and within dialogs
      const resizeObserver = new ResizeObserver(() => {
        map.resize();
      });
      resizeObserver.observe(mapContainer.current);

      // Clean up observer when map is destroyed
      map.on('remove', () => {
        resizeObserver.disconnect();
      });
    };

    frameId = requestAnimationFrame(() => {
      timeoutId = setTimeout(initMap, 200); // slightly longer timeout for mobile dialog animation
    });

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
    };
  }, [isOpen, hasCoordinates, latitude, longitude]);

  useEffect(() => {
    if (!isOpen && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <MapPin weight="fill" />
          Show Location
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin weight="fill" className="text-primary" />
            Route to Report Location
          </DialogTitle>
          <DialogDescription>
            {hasCoordinates
              ? `Showing route from your location`
              : `Manual location: ${manualLocation}`}
          </DialogDescription>
        </DialogHeader>
        {hasCoordinates ? (
          <div
            ref={mapContainer}
            className="w-full h-[400px] rounded-lg overflow-hidden border"
          />
        ) : (
          <div className="w-full h-[200px] flex items-center justify-center border rounded-lg bg-muted">
            <div className="text-center">
              <MapPin className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Manual Location</p>
              <p className="text-sm text-muted-foreground mt-1">
                {manualLocation}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
