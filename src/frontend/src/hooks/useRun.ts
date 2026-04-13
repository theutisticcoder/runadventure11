import { useCallback, useEffect, useRef, useState } from "react";
import { totalTrailDistance } from "../lib/gps";
import type {
  Chapter,
  Genre,
  GpsCoord,
  RunChoice,
  RunStatus,
} from "../lib/types";

interface RunState {
  runStatus: RunStatus;
  genre: Genre | null;
  chapters: Chapter[];
  choices: RunChoice[];
  gpsTrail: GpsCoord[];
  distance: number; // meters
  elapsedSeconds: number;
  startedAt: number | null;
  endedAt: number | null;
}

interface UseRunReturn extends RunState {
  startRun: (genre: Genre) => void;
  pauseRun: () => void;
  resumeRun: () => void;
  endRun: () => void;
  addChapter: (chapter: Chapter) => void;
  recordChoice: (choice: RunChoice) => void;
  appendGpsPoint: (coord: GpsCoord) => void;
  resetRun: () => void;
}

const INITIAL_STATE: RunState = {
  runStatus: "idle",
  genre: null,
  chapters: [],
  choices: [],
  gpsTrail: [],
  distance: 0,
  elapsedSeconds: 0,
  startedAt: null,
  endedAt: null,
};

export function useRun(): UseRunReturn {
  const [state, setState] = useState<RunState>(INITIAL_STATE);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedAtRef = useRef<number>(0);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setState((prev) => ({
        ...prev,
        elapsedSeconds: prev.elapsedSeconds + 1,
      }));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startRun = useCallback(
    (genre: Genre) => {
      setState({
        ...INITIAL_STATE,
        runStatus: "active",
        genre,
        startedAt: Date.now(),
      });
      startTimer();
    },
    [startTimer],
  );

  const pauseRun = useCallback(() => {
    pausedAtRef.current = Date.now();
    stopTimer();
    setState((prev) => ({ ...prev, runStatus: "paused" }));
  }, [stopTimer]);

  const resumeRun = useCallback(() => {
    startTimer();
    setState((prev) => ({ ...prev, runStatus: "active" }));
  }, [startTimer]);

  const endRun = useCallback(() => {
    stopTimer();
    setState((prev) => ({ ...prev, runStatus: "ended", endedAt: Date.now() }));
  }, [stopTimer]);

  const addChapter = useCallback((chapter: Chapter) => {
    setState((prev) => ({ ...prev, chapters: [...prev.chapters, chapter] }));
  }, []);

  const recordChoice = useCallback((choice: RunChoice) => {
    setState((prev) => ({ ...prev, choices: [...prev.choices, choice] }));
  }, []);

  const appendGpsPoint = useCallback((coord: GpsCoord) => {
    setState((prev) => {
      const newTrail = [...prev.gpsTrail, coord];
      return {
        ...prev,
        gpsTrail: newTrail,
        distance: totalTrailDistance(newTrail),
      };
    });
  }, []);

  const resetRun = useCallback(() => {
    stopTimer();
    setState(INITIAL_STATE);
  }, [stopTimer]);

  return {
    ...state,
    startRun,
    pauseRun,
    resumeRun,
    endRun,
    addChapter,
    recordChoice,
    appendGpsPoint,
    resetRun,
  };
}
