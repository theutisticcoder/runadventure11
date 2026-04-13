import type { GpsCoord } from "./types";

const EARTH_RADIUS_M = 6371000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Haversine formula — returns distance in meters */
export function calculateDistance(a: GpsCoord, b: GpsCoord): number {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLon * sinDLon;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Returns cardinal direction string from two GPS points */
export function calculateHeading(from: GpsCoord, to: GpsCoord): string {
  const dLon = toRad(to.lon - from.lon);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;

  if (bearing < 22.5 || bearing >= 337.5) return "north";
  if (bearing < 67.5) return "northeast";
  if (bearing < 112.5) return "east";
  if (bearing < 157.5) return "southeast";
  if (bearing < 202.5) return "south";
  if (bearing < 247.5) return "southwest";
  if (bearing < 292.5) return "west";
  return "northwest";
}

/**
 * Checks whether the runner is near an intersection by looking at the last
 * N GPS points. Returns true when the latest point is within 30 m of a
 * position that is at least 30 m away from a recent prior point — i.e. the
 * runner has been moving and is now close to some significant location.
 * The caller is responsible for confirming via Nominatim that a real
 * intersection exists at the position.
 */
export function isNearIntersection(
  current: GpsCoord,
  previous: GpsCoord[],
): boolean {
  if (previous.length < 3) return false;
  // Need at least 30 m of cumulative travel in the window
  const windowSize = Math.min(previous.length, 6);
  const window = previous.slice(-windowSize);
  const totalTravel = window.reduce((sum, pt, i) => {
    if (i === 0) return sum;
    return sum + calculateDistance(window[i - 1], pt);
  }, 0);
  if (totalTravel < 30) return false;
  // Make sure we haven't triggered very recently (last point within 5 m of current)
  const lastPt = previous[previous.length - 1];
  const distFromLast = calculateDistance(lastPt, current);
  return distFromLast >= 5;
}

/** Sum all segment distances in a trail */
export function totalTrailDistance(trail: GpsCoord[]): number {
  return trail.reduce((sum, pt, i) => {
    if (i === 0) return sum;
    return sum + calculateDistance(trail[i - 1], pt);
  }, 0);
}
