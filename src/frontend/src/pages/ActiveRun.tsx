import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  AlertTriangle,
  MapPin,
  Pause,
  Play,
  SkipForward,
  Square,
  Swords,
  Volume2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBackend } from "../hooks/useBackend";
import { useGps } from "../hooks/useGps";
import { useRun } from "../hooks/useRun";
import { isNearIntersection } from "../lib/gps";
import { generateChapter, generateTTS } from "../lib/mistral";
import { reverseGeocode } from "../lib/nominatim";
import type { ChapterResult, Genre } from "../lib/types";
import { GENRE_BG_COLORS, GENRE_COLORS, GENRE_GLOW } from "../lib/types";
import GenreSelector from "./activerun/GenreSelector";
import RunMap from "./activerun/RunMap";
import SaveRunModal from "./activerun/SaveRunModal";

type RunPhase = "genre-select" | "running" | "save";

export default function ActiveRun() {
  const navigate = useNavigate();
  const { genre: urlGenre } = useSearch({ from: "/run" });
  const [phase, setPhase] = useState<RunPhase>(
    urlGenre ? "running" : "genre-select",
  );
  const [chapterResult, setChapterResult] = useState<ChapterResult | null>(
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [storyHistory, setStoryHistory] = useState<string[]>([]);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [saveSlug, setSaveSlug] = useState<string | null>(null);

  // Web Audio API — most reliable approach for mobile browsers (iOS Safari, Android Chrome)
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  // Callback to resolve/skip the current playback promise early (skip narration)
  const skipCallbackRef = useRef<(() => void) | null>(null);

  const intersectionCheckRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const lastIntersectionRef = useRef<string>("");
  const chapterTextRef = useRef<HTMLDivElement>(null);
  const hasGeneratedOpeningChapterRef = useRef(false);
  const currentStreetRef = useRef<string>("");

  const run = useRun();
  const gps = useGps();
  const { saveRun, isSaving } = useBackend();

  // ─── Clean up AudioContext on unmount ────────────────────────────────────
  useEffect(() => {
    return () => {
      currentSourceRef.current?.stop();
      audioContextRef.current?.close();
      audioContextRef.current = null;
    };
  }, []);

  // ─── Stop any in-progress narration ───────────────────────────────────────
  const stopNarration = useCallback(() => {
    try {
      currentSourceRef.current?.stop();
    } catch {
      // source may already be stopped — safe to ignore
    }
    currentSourceRef.current = null;
    // Fire skip callback so downstream state cleans up
    if (skipCallbackRef.current) {
      skipCallbackRef.current();
      skipCallbackRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // ─── Skip narration button handler ────────────────────────────────────────
  const handleSkipNarration = useCallback(() => {
    stopNarration();
  }, [stopNarration]);

  // ─── Play TTS using Web Audio API ────────────────────────────────────────
  // ArrayBuffer → AudioContext.decodeAudioData → createBufferSource().start()
  // This approach works reliably on iOS Safari and Android Chrome where
  // HTMLAudioElement.play() throws NotSupportedError (code 9).
  const playTTS = async (text: string) => {
    setIsPlaying(true);
    try {
      console.log("[TTS] Fetching audio buffer…");
      const url = await generateTTS(text);

      // Ensure AudioContext exists and is running
      
      var au = new Audio(url);
      au.controls = true;
      document.body.appendChild(au)
      
      
    } catch (err) {
      console.error("[TTS] playback error:", err);
      setIsPlaying(false);
    }
  }

  // ─── Auto-start run when genre is in URL ──────────────────────────────────
  const autoStartedRef = useRef(false);
  const startRun = run.startRun;
  useEffect(() => {
    if (autoStartedRef.current) return;
    if (!urlGenre) return;
    autoStartedRef.current = true;
    const validGenres: Genre[] = [
      "Fantasy",
      "SciFi",
      "Horror",
      "Mystery",
      "Romance",
    ];
    const genre = validGenres.includes(urlGenre as Genre)
      ? (urlGenre as Genre)
      : "Fantasy";
    startRun(genre);
  }, [urlGenre, startRun]);

  // ─── Generate a chapter at the current intersection ───────────────────────
  const triggerChapter = useCallback(
    async (street1: string, street2: string, onStreet?: string) => {
      if (!run.genre) return;

      const activeStreet = onStreet ?? currentStreetRef.current ?? street1;

      setIsGenerating(true);
      setChapterResult(null);
      const chapterNumber = run.chapters.length + 1;
      try {
        const result = await generateChapter({
          streetName1: street1,
          streetName2: street2,
          currentStreet: activeStreet,
          direction: gps.heading,
          genre: run.genre,
          storyHistory,
          chapterNumber,
        });
        setChapterResult(result);
        setStoryHistory((prev) => [...prev, result.chapterText]);
        run.addChapter({
          text: result.chapterText,
          streetName1: street1,
          streetName2: street2,
          direction: gps.heading,
          choiceIndex: -1,
        });
        setIsGenerating(false);
        setTimeout(() => {
          chapterTextRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 200);
        playTTS(result.chapterText);
      } catch (err) {
        setIsGenerating(false);
        setGeocodeError(
          err instanceof Error ? err.message : "Story generation failed.",
        );
      }
    },
    [run, gps.heading, storyHistory, playTTS],
  );

  // ─── Start GPS when run begins ────────────────────────────────────────────
  const startTracking = gps.startTracking;
  const stopTracking = gps.stopTracking;
  useEffect(() => {
    if (phase !== "running") return;
    startTracking();
    return () => {
      stopTracking();
      if (intersectionCheckRef.current)
        clearInterval(intersectionCheckRef.current);
    };
  }, [phase, startTracking, stopTracking]);

  // ─── Append GPS points to run state ───────────────────────────────────────
  const appendGpsPoint = run.appendGpsPoint;
  const runStatus = run.runStatus;
  useEffect(() => {
    if (gps.coords && phase === "running" && runStatus === "active") {
      appendGpsPoint(gps.coords);
    }
  }, [gps.coords, phase, runStatus, appendGpsPoint]);

  // ─── Opening chapter on first GPS fix ─────────────────────────────────────
  useEffect(() => {
    if (phase !== "running") return;
    if (!gps.coords) return;
    if (hasGeneratedOpeningChapterRef.current) return;
    if (isGenerating || isPlaying) return;
    hasGeneratedOpeningChapterRef.current = true;

    (async () => {
      try {
        const geo = await reverseGeocode(gps.coords!);
        const allStreets = [geo.street, ...geo.nearbyStreets].filter(Boolean);
        const street1 = allStreets[0] ?? "the starting line";
        const street2 = allStreets[1] ?? "the open road";
        currentStreetRef.current = street1;
        lastIntersectionRef.current = `${street1}|${street2}`;
        await triggerChapter(street1, street2, street1);
      } catch {
        hasGeneratedOpeningChapterRef.current = false;
      }
    })();
  }, [phase, gps.coords, isGenerating, isPlaying, triggerChapter]);

  // ─── Intersection detection loop — every 7 seconds ───────────────────────
  const gpsTrail = gps.gpsTrail;
  useEffect(() => {
    if (phase !== "running") return;
    intersectionCheckRef.current = setInterval(async () => {
      if (!gps.coords || runStatus !== "active" || isGenerating || isPlaying)
        return;
      if (!isNearIntersection(gps.coords, gpsTrail)) return;

      const geo = await reverseGeocode(gps.coords);
      const allStreets = [geo.street, ...geo.nearbyStreets].filter(Boolean);
      if (allStreets.length < 2) return;

      const key = `${allStreets[0]}|${allStreets[1]}`;
      if (key === lastIntersectionRef.current) return;
      lastIntersectionRef.current = key;

      currentStreetRef.current = allStreets[0];
      await triggerChapter(allStreets[0], allStreets[1], allStreets[0]);
    }, 7000);
    return () => {
      if (intersectionCheckRef.current)
        clearInterval(intersectionCheckRef.current);
    };
  }, [
    phase,
    gps.coords,
    runStatus,
    isGenerating,
    isPlaying,
    gpsTrail,
    triggerChapter,
  ]);

  // ─── Start Run handler ────────────────────────────────────────────────────
  // Create (or resume) the AudioContext on the user gesture so the browser
  // autoplay policy is satisfied before the first TTS call.
  const handleStartRun = (genre: Genre) => {
    if (
      !audioContextRef.current ||
      audioContextRef.current.state === "closed"
    ) {
      audioContextRef.current = new AudioContext();
      console.log("[TTS] AudioContext created on user gesture");
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume().then(() => {
        console.log("[TTS] AudioContext resumed on user gesture");
      });
    }
    run.startRun(genre);
    setPhase("running");
  };

  const handleEndRun = () => {
    run.endRun();
    gps.stopTracking();
    stopNarration();
    setPhase("save");
  };

  const handleSaveRun = async (title: string) => {
    if (!run.genre) return;
    const slug = await saveRun({
      title,
      genre: run.genre,
      chapters: run.chapters,
      choices: run.choices.map((c) => c.choiceSummary),
      gpsRoute: run.gpsTrail,
      startTime: run.startedAt ?? Date.now(),
      endTime: run.endedAt ?? Date.now(),
      totalDistance: run.distance,
    });
    setSaveSlug(slug);
    navigate({ to: "/story/$slug", params: { slug } });
  };

  // ─── Genre select screen ──────────────────────────────────────────────────
  if (phase === "genre-select") {
    return <GenreSelector onStart={handleStartRun} />;
  }

  // ─── Save screen ──────────────────────────────────────────────────────────
  if (phase === "save") {
    return (
      <SaveRunModal
        run={run}
        isSaving={isSaving}
        saveSlug={saveSlug}
        onSave={handleSaveRun}
        onDiscard={() => navigate({ to: "/" })}
      />
    );
  }

  // ─── Active run screen ────────────────────────────────────────────────────
  const genre = run.genre ?? "Fantasy";
  const genreColor = GENRE_COLORS[genre];
  const genreBg = GENRE_BG_COLORS[genre];
  const genreGlow = GENRE_GLOW[genre];

  const mins = Math.floor(run.elapsedSeconds / 60);
  const secs = run.elapsedSeconds % 60;
  const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  const distKm = (run.distance / 1000).toFixed(2);

  return (
    <div className="flex-1 flex flex-col bg-background min-h-0 overflow-hidden">
      {/* GPS permission error */}
      {gps.error && (
        <div
          className="flex items-start gap-3 p-4 bg-destructive/10 border-b border-destructive/30 text-sm"
          data-ocid="gps-error-banner"
        >
          <AlertTriangle
            size={18}
            className="text-destructive mt-0.5 flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="font-semibold text-destructive">GPS Unavailable</p>
            <p className="text-muted-foreground mt-0.5">{gps.error}</p>
            <p className="text-muted-foreground mt-1">
              To enable:{" "}
              <strong>
                Settings → Privacy → Location Services → RunQuest → While Using
              </strong>
            </p>
          </div>
        </div>
      )}

      {/* Map */}
      <div
        className="h-[40vh] min-h-[220px] w-full relative"
        data-ocid="run-map"
      >
        <RunMap
          coords={gps.coords}
          trail={gps.gpsTrail}
          chapterPoints={run.chapters.map((_ch, i) => ({
            lat: run.gpsTrail[i * 10]
              ? run.gpsTrail[i * 10].lat
              : (run.gpsTrail[run.gpsTrail.length - 1]?.lat ?? 0),
            lon: run.gpsTrail[i * 10]
              ? run.gpsTrail[i * 10].lon
              : (run.gpsTrail[run.gpsTrail.length - 1]?.lon ?? 0),
          }))}
        />
        {/* Genre badge overlay */}
        <div className="absolute top-3 left-3 z-[500]">
          <Badge
            className={`font-display font-bold tracking-widest text-xs px-2.5 py-1 border ${genreBg} ${genreColor} uppercase`}
            data-ocid="genre-badge"
          >
            {genre} RUN
          </Badge>
        </div>
        {/* Stats bar overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 z-[500] bg-background/80 backdrop-blur-sm border-t border-border/40 px-4 py-2 flex items-center justify-between"
          data-ocid="run-stats"
        >
          <StatCell label="DIST" value={`${distKm} km`} />
          <StatCell label="TIME" value={timeStr} />
          <StatCell label="CHAPTERS" value={String(run.chapters.length)} />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={
                run.runStatus === "paused" ? run.resumeRun : run.pauseRun
              }
              className="min-h-[44px] min-w-[44px] px-3 border-border/60 text-xs gap-1.5"
              data-ocid="pause-resume-btn"
            >
              {run.runStatus === "paused" ? (
                <Play size={14} />
              ) : (
                <Pause size={14} />
              )}
              {run.runStatus === "paused" ? "Resume" : "Pause"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEndRun}
              className="min-h-[44px] min-w-[44px] px-3 text-xs gap-1.5"
              data-ocid="end-run-btn"
            >
              <Square size={14} />
              End
            </Button>
          </div>
        </div>
      </div>

      {/* Story panel */}
      <div className="flex-1 flex flex-col overflow-y-auto overscroll-contain pb-4">
        {/* Generation loading */}
        {isGenerating && (
          <div
            className="flex flex-col items-center gap-4 p-8 text-center"
            data-ocid="chapter-loading"
          >
            <div
              className={`w-16 h-16 rounded-full border-4 border-t-transparent ${genreColor.replace("text-", "border-")} animate-spin`}
              role="status"
              aria-label="Generating chapter"
            />
            <div>
              <p className={`font-display font-bold text-lg ${genreColor}`}>
                The Story Unfolds…
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Weaving your adventure through these streets
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        )}

        {/* Chapter text */}
        {!isGenerating && chapterResult && (
          <div
            ref={chapterTextRef}
            className={`mx-4 mt-4 rounded-xl border p-4 ${genreBg} ${genreGlow} transition-smooth`}
            data-ocid="chapter-panel"
          >
            <div className="flex items-center justify-between mb-3">
              <p className={`font-display font-bold text-base ${genreColor}`}>
                Chapter {run.chapters.length}
              </p>
              <Badge variant="secondary" className="text-xs">
                <MapPin size={10} className="mr-1" />
                {chapterResult.choice1.streetName} &amp;{" "}
                {chapterResult.choice2.streetName}
              </Badge>
            </div>
            <p className="text-foreground text-base leading-relaxed whitespace-pre-wrap break-words">
              {chapterResult.chapterText}
            </p>
          </div>
        )}

        {/* Empty / waiting state */}
        {!isGenerating && !chapterResult && !gps.error && (
          <div
            className="flex flex-col items-center gap-3 p-8 text-center"
            data-ocid="waiting-state"
          >
            <Swords size={36} className={`${genreColor} opacity-60`} />
            <p className={`font-display font-bold text-lg ${genreColor}`}>
              Your Adventure Awaits
            </p>
            <p className="text-muted-foreground text-sm max-w-xs">
              {gps.coords
                ? "Summoning your opening chapter…"
                : "Acquiring GPS signal — your story begins the moment you're located."}
            </p>
          </div>
        )}

        {/* API error */}
        {geocodeError && (
          <div className="mx-4 mt-3 flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/30 text-sm">
            <AlertTriangle
              size={16}
              className="text-destructive flex-shrink-0 mt-0.5"
            />
            <p className="text-muted-foreground">{geocodeError}</p>
          </div>
        )}

        {/* TTS narration indicator + skip button */}
        {isPlaying && (
          <div
            className={`mx-4 mt-4 rounded-xl border px-4 py-3 flex items-center gap-3 animate-glow-pulse ${genreBg}`}
            data-ocid="tts-indicator"
            aria-live="polite"
          >
            <Volume2 size={20} className={`${genreColor} flex-shrink-0`} />
            <div className="min-w-0 flex-1">
              <p className={`font-display font-semibold text-sm ${genreColor}`}>
                Listening to your story…
              </p>
              <p className="text-xs text-muted-foreground">
                Keep running — next chapter triggers automatically
              </p>
            </div>
            {/* Animated bars */}
            <div className="flex items-center gap-0.5 shrink-0">
              {[1, 2, 3, 4, 5].map((b) => (
                <div
                  key={b}
                  className={`w-1 rounded-full ${genreColor.replace("text-", "bg-")} animate-pulse`}
                  style={{
                    height: `${8 + b * 4}px`,
                    animationDelay: `${b * 0.12}s`,
                  }}
                />
              ))}
            </div>
            {/* Skip narration */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkipNarration}
              className="shrink-0 h-8 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
              aria-label="Skip narration"
              data-ocid="skip-narration-btn"
            >
              <SkipForward size={14} />
              Skip
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center min-w-0">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        {label}
      </span>
      <span className="font-display font-bold text-base text-foreground tabular-nums">
        {value}
      </span>
    </div>
  );
}
