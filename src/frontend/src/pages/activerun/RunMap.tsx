import L from "leaflet";
import { useEffect, useRef } from "react";
import type { GpsCoord } from "../../lib/types";

// Fix default marker icon path issue with webpack/vite bundling
// biome-ignore lint/performance/noDelete: required to fix Leaflet's default icon resolution
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom dark circle marker for current position
function createPositionIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:18px;height:18px;border-radius:50%;
      background:oklch(0.72 0.24 200);
      border:3px solid white;
      box-shadow:0 0 12px oklch(0.72 0.24 200 / 0.8);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

// Chapter point marker
function createChapterIcon(num: number) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:24px;height:24px;border-radius:50%;
      background:oklch(0.75 0.22 60);
      border:2px solid white;
      display:flex;align-items:center;justify-content:center;
      font-size:10px;font-weight:bold;color:#000;
      box-shadow:0 0 8px oklch(0.75 0.22 60 / 0.6);
    ">${num}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

interface RunMapProps {
  coords: GpsCoord | null;
  trail: GpsCoord[];
  chapterPoints: GpsCoord[];
}

export default function RunMap({ coords, trail, chapterPoints }: RunMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const posMarkerRef = useRef<L.Marker | null>(null);
  const trailPolylineRef = useRef<L.Polyline | null>(null);
  const chapterMarkersRef = useRef<L.Marker[]>([]);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [51.505, -0.09],
      zoom: 17,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark tile layer
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        subdomains: "abcd",
      },
    ).addTo(map);

    // Compact attribution
    L.control.attribution({ prefix: "© OSM · CartoDB" }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update position marker
  useEffect(() => {
    if (!mapRef.current || !coords) return;
    const latlng: L.LatLngExpression = [coords.lat, coords.lon];

    if (!posMarkerRef.current) {
      posMarkerRef.current = L.marker(latlng, {
        icon: createPositionIcon(),
      }).addTo(mapRef.current);
    } else {
      posMarkerRef.current.setLatLng(latlng);
    }

    mapRef.current.setView(latlng, mapRef.current.getZoom(), { animate: true });
  }, [coords]);

  // Update trail polyline
  useEffect(() => {
    if (!mapRef.current || trail.length < 2) return;
    const points: L.LatLngExpression[] = trail.map((c) => [c.lat, c.lon]);

    if (!trailPolylineRef.current) {
      trailPolylineRef.current = L.polyline(points, {
        color: "oklch(0.75 0.22 60)",
        weight: 3,
        opacity: 0.85,
      }).addTo(mapRef.current);
    } else {
      trailPolylineRef.current.setLatLngs(points);
    }
  }, [trail]);

  // Update chapter markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Only add new markers (don't recreate existing ones)
    const existingCount = chapterMarkersRef.current.length;
    for (let i = existingCount; i < chapterPoints.length; i++) {
      const pt = chapterPoints[i];
      if (!pt || (pt.lat === 0 && pt.lon === 0)) continue;
      const marker = L.marker([pt.lat, pt.lon], {
        icon: createChapterIcon(i + 1),
      }).addTo(mapRef.current);
      chapterMarkersRef.current.push(marker);
    }
  }, [chapterPoints]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      aria-label="Run map"
      role="img"
    />
  );
}
