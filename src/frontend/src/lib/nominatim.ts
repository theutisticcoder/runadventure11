import type { GpsCoord, NominatimResult } from "./types";

interface NominatimReverseResponse {
  address?: {
    road?: string;
    pedestrian?: string;
    footway?: string;
    path?: string;
    cycleway?: string;
    residential?: string;
    [key: string]: string | undefined;
  };
  error?: string;
}

interface NominatimSearchResult {
  display_name?: string;
  addresstype?: string;
  type?: string;
  class?: string;
  address?: {
    road?: string;
    pedestrian?: string;
    footway?: string;
    path?: string;
    cycleway?: string;
    residential?: string;
    [key: string]: string | undefined;
  };
}

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
  nodes?: number[];
}

interface OverpassResponse {
  elements: OverpassElement[];
}

const DEBOUNCE_MS = 1000;
let lastCallTime = 0;

async function throttledFetch(url: string): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastCallTime;
  if (elapsed < DEBOUNCE_MS) {
    await new Promise<void>((resolve) =>
      setTimeout(resolve, DEBOUNCE_MS - elapsed),
    );
  }
  lastCallTime = Date.now();
  return fetch(url, { headers: { "Accept-Language": "en" } });
}

/** Extract the primary road name from a Nominatim address object */
function extractRoadName(
  addr: Record<string, string | undefined> | undefined,
): string {
  if (!addr) return "";
  return (
    addr.road ??
    addr.pedestrian ??
    addr.footway ??
    addr.path ??
    addr.cycleway ??
    addr.residential ??
    ""
  );
}

/**
 * Use Overpass API to find named streets that INTERSECT the current street
 * within a ~50m radius. This finds only streets that actually cross/touch
 * the current road — not random nearby places.
 */
async function findIntersectingStreets(
  coord: GpsCoord,
  currentStreet: string,
  radiusMeters = 50,
): Promise<string[]> {
  // Overpass query: find all highway ways within radius, then collect named ones
  // that share a node with the current street vicinity
  const query = `
[out:json][timeout:10];
(
  way(around:${radiusMeters},${coord.lat},${coord.lon})[highway][name];
);
out body;
>;
out skel qt;`;

  const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  const seen = new Set<string>();
  const intersecting: string[] = [];
  const currentLower = currentStreet.toLowerCase();

  if (currentStreet) seen.add(currentLower);

  try {
    const res = await fetch(overpassUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return intersecting;

    const data: OverpassResponse = await res.json();

    // Collect all named highway ways in the area
    const wayNames: string[] = [];
    for (const el of data.elements) {
      if (el.type === "way" && el.tags?.name) {
        const name = el.tags.name;
        if (!seen.has(name.toLowerCase())) {
          wayNames.push(name);
          seen.add(name.toLowerCase());
        }
      }
    }

    // Filter to streets that are meaningfully different from the current street
    // and appear to be crossing (not just parallel) by having at least 1 way
    for (const name of wayNames) {
      // Skip if it's clearly a sub-part of the current street name
      if (currentStreet && name.toLowerCase().includes(currentLower)) continue;
      intersecting.push(name);
    }
  } catch {
    // Overpass failed — caller falls back to Nominatim search results
  }

  return intersecting;
}

/** Reverse geocode a GPS coordinate using Nominatim.
 *  After getting the primary road via /reverse, uses Overpass API to find
 *  streets that actually INTERSECT the current road (not just nearby streets).
 *  Falls back to Nominatim /search if Overpass returns nothing.
 *  Throttled to respect Nominatim's usage policy.
 */
export async function reverseGeocode(
  coord: GpsCoord,
): Promise<NominatimResult> {
  // Step 1: Get the primary road from /reverse
  const reverseUrl = `https://nominatim.openstreetmap.org/reverse?lat=${coord.lat}&lon=${coord.lon}&format=json&addressdetails=1`;

  let primaryRoad = "";
  try {
    const res = await throttledFetch(reverseUrl);
    if (res.ok) {
      const data: NominatimReverseResponse = await res.json();
      if (!data.error) {
        primaryRoad = extractRoadName(data.address);
      }
    }
  } catch {
    return { street: "", nearbyStreets: [] };
  }

  // Step 2: Try Overpass to find streets that actually intersect the current road
  if (primaryRoad) {
    const intersecting = await findIntersectingStreets(coord, primaryRoad, 45);
    if (intersecting.length > 0) {
      return { street: primaryRoad, nearbyStreets: intersecting };
    }
  }

  // Step 3: Fallback — Nominatim /search with tight viewbox (~40m)
  const delta = 0.0004; // ~40m
  const minLon = coord.lon - delta;
  const minLat = coord.lat - delta;
  const maxLon = coord.lon + delta;
  const maxLat = coord.lat + delta;

  const searchUrl = `https://nominatim.openstreetmap.org/search?q=&format=json&addressdetails=1&limit=10&bounded=1&viewbox=${minLon},${minLat},${maxLon},${maxLat}`;

  const seen = new Set<string>();
  const nearbyStreets: string[] = [];

  if (primaryRoad) {
    seen.add(primaryRoad.toLowerCase());
  }

  try {
    const searchRes = await throttledFetch(searchUrl);
    if (searchRes.ok) {
      const results: NominatimSearchResult[] = await searchRes.json();
      for (const item of results) {
        if (item.class !== "highway" && item.type !== "road") {
          const roadFromAddr = extractRoadName(item.address);
          if (
            roadFromAddr &&
            roadFromAddr.length > 2 &&
            !seen.has(roadFromAddr.toLowerCase())
          ) {
            seen.add(roadFromAddr.toLowerCase());
            nearbyStreets.push(roadFromAddr);
          }
          continue;
        }
        const roadName = extractRoadName(item.address);
        if (
          roadName &&
          roadName.length > 2 &&
          !seen.has(roadName.toLowerCase())
        ) {
          seen.add(roadName.toLowerCase());
          nearbyStreets.push(roadName);
        }
      }
    }
  } catch {
    // Search failed — return what we have from /reverse
  }

  return { street: primaryRoad, nearbyStreets };
}

/**
 * Check whether the runner is now on a specific street by reverse-geocoding
 * their current GPS position. Used for turn detection after a choice is made.
 */
export async function isOnStreet(
  coord: GpsCoord,
  targetStreet: string,
): Promise<boolean> {
  const reverseUrl = `https://nominatim.openstreetmap.org/reverse?lat=${coord.lat}&lon=${coord.lon}&format=json&addressdetails=1`;

  try {
    const res = await fetch(reverseUrl, {
      headers: { "Accept-Language": "en" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const data: NominatimReverseResponse = await res.json();
    if (data.error) return false;

    const road = extractRoadName(data.address).toLowerCase();
    const target = targetStreet.toLowerCase();

    // Check if the current road matches or contains the target street name
    return road === target || road.includes(target) || target.includes(road);
  } catch {
    return false;
  }
}
