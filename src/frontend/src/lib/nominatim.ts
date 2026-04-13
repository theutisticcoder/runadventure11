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

/** Reverse geocode a GPS coordinate using Nominatim.
 *  After getting the primary road via /reverse, makes a second request to
 *  /search with a small viewbox to find nearby named cross-streets.
 *  This enables real intersection detection with actual street names.
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
    // Silently fail — return empty result
    return { street: "", nearbyStreets: [] };
  }

  // Step 2: Search nearby streets using /search with a viewbox of ±0.0005° (~50m)
  // This finds actual cross-streets at or near the intersection
  const delta = 0.0005;
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
        // Only include highway/road type results
        if (item.class !== "highway" && item.type !== "road") {
          // Also check the address for a road name as fallback
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
