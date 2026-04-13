import { useCallback, useRef, useState } from "react";
import { calculateHeading } from "../lib/gps";
import type { GpsCoord } from "../lib/types";

interface UseGpsReturn {
  coords: GpsCoord | null;
  heading: string;
  isTracking: boolean;
  error: string | null;
  startTracking: () => void;
  stopTracking: () => void;
  gpsTrail: GpsCoord[];
}

export function useGps(): UseGpsReturn {
  const [coords, setCoords] = useState<GpsCoord | null>(null);
  const [heading, setHeading] = useState<string>("north");
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gpsTrail, setGpsTrail] = useState<GpsCoord[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const prevCoordsRef = useRef<GpsCoord | null>(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setError(null);
    setIsTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newCoord: GpsCoord = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };

        setCoords(newCoord);
        setGpsTrail((prev) => [...prev, newCoord]);

        if (prevCoordsRef.current) {
          const newHeading = calculateHeading(prevCoordsRef.current, newCoord);
          setHeading(newHeading);
        }
        prevCoordsRef.current = newCoord;
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError(
              "Location access denied. Please enable GPS permissions in your device settings to use RunQuest.",
            );
            break;
          case err.POSITION_UNAVAILABLE:
            setError(
              "Location unavailable. Make sure you're outdoors with GPS signal.",
            );
            break;
          case err.TIMEOUT:
            setError("Location request timed out. Please try again.");
            break;
          default:
            setError("An unknown location error occurred.");
        }
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 10000,
      },
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  return {
    coords,
    heading,
    isTracking,
    error,
    startTracking,
    stopTracking,
    gpsTrail,
  };
}
