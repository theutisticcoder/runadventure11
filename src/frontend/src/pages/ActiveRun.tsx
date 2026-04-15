import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from “@/components/ui/alert-dialog”;
import { Badge } from “@/components/ui/badge”;
import { Button } from “@/components/ui/button”;
import { useNavigate, useParams } from “@tanstack/react-router”;
import { Compass, Pause, Play, Square, Volume2, VolumeX } from “lucide - react”;
import { AnimatePresence, motion } from “motion / react”;
import { useCallback, useEffect, useRef, useState } from “react”;
import { Genre as BackendGenre, Direction } from “../backend.d”;
import { ChoiceButton } from “../components/ChoiceButton”;
import { RunStatsBar } from “../components/RunStatsBar”;
import { StoryPanel } from “../components/StoryPanel”;
import { useAuth } from “../hooks/use - auth”;
import { useBackend } from “../hooks/use - backend”;
import { useRunActive } from “../hooks/use - run - active”;
import type { Genre, StoryNode } from “../types”;

const INF = Number.POSITIVE_INFINITY;

// ── Genre label map ───────────────────────────────────────────────────────────
const GENRE_LABEL: Record<string, string> = {
  Fantasy: “Fantasy”,
  SciFi: “Sci- Fi”,
  Thriller: “Thriller”,
  Comedy: “Comedy”,
  Horror: “Horror”,
  fantasy: “Fantasy”,
  scifi: “Sci-Fi”,
thriller: “Thriller”,
comedy: “Comedy”,
horror: “Horror”,
mystery: “Mystery”,
};

// ── Static map URL builder ────────────────────────────────────────────────────
function buildMapUrl(lat: number, lng: number, zoom = 16): string {
  const width = Math.min(window.innerWidth, 640);
  const height = 320;
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=osm&markers=${lat},${lng},red-pushpin`;
}

// ── Map marker SVG ────────────────────────────────────────────────────────────
function LocationPin({ className }: { className?: string }) {
  return (
    <svg
      width="28"
      height="36"
      viewBox="0 0 28 36"
      fill="none"
      className={className}
      aria-label="Current location"
    >
      <title>Current location</title>
      <ellipse cx="14" cy="34" rx="6" ry="2" fill="rgba(0,0,0,0.3)" />
      <path
        d="M14 0C7.373 0 2 5.373 2 12c0 9 12 22 12 22S26 21 26 12C26 5.373 20.627 0 14 0z"
        fill="oklch(var(--primary))"
        stroke="white"
        strokeWidth="2"
      />
      <circle cx="14" cy="12" r="4" fill="white" />
    </svg>
  );
}

// ── GPS Map Component ─────────────────────────────────────────────────────────
const GPS_DOTS = [“gps - dot - 0”, “gps - dot - 1”, “gps - dot - 2”] as const;
const GPS_DOT_DELAYS: Record<string, number> = {
“gps - dot - 0”: 0,
“gps - dot - 1”: 0.2,
“gps - dot - 2”: 0.4,
};

function RunMap({
  lat,
  lng,
  hasGps,
}: {
  lat: number | null;
  lng: number | null;
  hasGps: boolean;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [mapSrc, setMapSrc] = useState<string>(””);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (lat === null || lng === null) return;
    const src = buildMapUrl(lat, lng);
    setMapSrc(src);
    setMapError(false);
  }, [lat, lng]);

  if (!hasGps || !mapSrc || mapError) {
    return (
<div className="absolute inset-0 map-grid flex flex-col items-center justify-center gap-3">
<motion.div
animate={{ rotate: 360 }}
transition={{ duration: 8, repeat: INF, ease: “linear” }}
>
<Compass size={52} className="text-accent/50" />
</motion.div>
<p className="font-display text-xs uppercase tracking-widest text-muted-foreground">
{hasGps ? “Loading map…” : “Acquiring GPS signal…”}
</p>
<div className="flex gap-1.5 mt-1">
{GPS_DOTS.map((key) => (
<motion.span
key={key}
className=“w-1.5 h-1.5 rounded-full bg-accent/40”
animate={{ opacity: [0.3, 1, 0.3] }}
transition={{
duration: 1.2,
delay: GPS_DOT_DELAYS[key],
repeat: INF,
}}
/>
))}
</div>
</div >
);
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <img
        ref={imgRef}
        src={mapSrc}
        alt=“OpenStreetMap showing current run location”
      className=“w-full h-full object-cover opacity-85”
      onError={() => setMapError(true)}
      style={{ filter: “brightness(0.75) saturate(0.8)” }}
/>
      {/* Vignette for immersive overlay */}
      <div
        className=“absolute inset-0 pointer-events-none”
      style={{
        background:
“radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)”,
}}
/>
      {/* Current location marker — centered */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: INF, ease: “easeInOut” }}
        style={{ marginTop: -18 }}
>
        <LocationPin />
      </motion.div>
    </div>
{/* GPS accuracy pulse ring */ }
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <motion.div
      className=“rounded-full border-2 border-primary/40”
    animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
    transition={{ duration: 2.5, repeat: INF, ease: “easeOut” }}
    style={{ width: 24, height: 24 }}
/>
  </div>
</div >
);
}

// ── TTS Narrating overlay ─────────────────────────────────────────────────────
const WAVE_BARS = [
  { key: “bar- 0”, height: 0.6, delay: 0 },
{ key: “bar - 1”, height: 1, delay: 0.1 },
{ key: “bar - 2”, height: 0.7, delay: 0.2 },
{ key: “bar - 3”, height: 1, delay: 0.3 },
{ key: “bar - 4”, height: 0.5, delay: 0.4 },
];

function NarratingBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className=“ flex items-center gap-2 bg-accent /20 border border - accent / 40 rounded - full px - 3 py - 1.5”
>
<div className="flex gap-0.5 items-end h-4">
{WAVE_BARS.map(({ key, height, delay }) => (
<motion.span
key={key}
className=“w-0.5 rounded-full bg-accent”
animate={{ scaleY: [height, 1, height] }}
transition={{ duration: 0.6, delay, repeat: INF }}
style={{ height: “100%”, transformOrigin: “bottom” }}
/>
))}
</div>
<span className="font-display text-xs uppercase tracking-widest text-accent">
Narrating…
</span>
</motion.div >
);
}

// ── Spinner dots ──────────────────────────────────────────────────────────────
const SPIN_DOTS = [
  { key: “sd- 0”, delay: 0 },
{ key: “sd - 1”, delay: 0.15 },
{ key: “sd - 2”, delay: 0.3 },
];

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ActiveRunPage() {
  const { runId } = useParams({ from: “/ run / $runId” });
const navigate = useNavigate();
const { backend } = useBackend();
const { principal } = useAuth();

const {
  state,
  startRun,
  stopRun,
  pauseRun,
  resumeRun,
  setCurrentNode,
  makeChoice: makeChoiceLocal,
  setGenerating,
  playTts,
  toggleTts,
} = useRunActive();

const [isStarted, setIsStarted] = useState(false);
const [showEndDialog, setShowEndDialog] = useState(false);
const [genre, setGenre] = useState<Genre>(“fantasy” as Genre);

// Prevent double-generating
const generatingRef = useRef(false);

// ── Init run from backend ────────────────────────────────────────────────
useEffect(() => {
  if (isStarted || !backend) return;
  setIsStarted(true);

  ```
const runIdNum = BigInt(runId);
backend
  .getRun(runIdNum)
  .then(async (run) => {
    if (!run) return;
    const g = run.genre as unknown as Genre;
    setGenre(g);

    // Load TTS preference from user profile
    let ttsOn = false;
    if (principal) {
      try {
        const profile = await backend.getProfile(principal);
        ttsOn = profile?.ttsEnabled ?? false;
      } catch {
        /* use default */
      }
    }
    startRun(runId, g, ttsOn);

    if (run.storyNodes.length > 0) {
      const last = run.storyNodes[run.storyNodes.length - 1];
      setCurrentNode(adaptBackendNode(last));
    }
  })
  .catch(() => {
    startRun(runId, genre, false);
  });
```

}, [backend, runId, isStarted, startRun, setCurrentNode, genre, principal]);

// ── Sync GPS coords to backend ────────────────────────────────────────────
const lastSyncedTrailLen = useRef(0);
useEffect(() => {
  if (!backend || !state.runId) return;
  const trail = state.gpsTrail;
  if (trail.length <= lastSyncedTrailLen.current) return;

  ```
const newCoords = trail.slice(lastSyncedTrailLen.current);
lastSyncedTrailLen.current = trail.length;

const runIdNum = BigInt(runId);
for (const coord of newCoords) {
  backend
    .appendGpsCoords(runIdNum, {
      lat: coord.lat,
      lon: coord.lng,
      timestamp: coord.timestamp,
    })
    .catch(() => {
      /* silent — non-critical */
    });
}
```

}, [state.gpsTrail, backend, runId, state.runId]);

// ── Intersection detected → generate story node ──────────────────────────
useEffect(() => {
  if (
    !state.pendingIntersection ||
    state.isGeneratingStory ||
    state.isAwaitingChoice ||
    generatingRef.current ||
    !backend
  )
    return;

  ```
generatingRef.current = true;
setGenerating(true);

const intersection = state.pendingIntersection;
const runIdNum = BigInt(runId);
const prevNarrative = state.currentNode?.narrativeText ?? "";
const genreKey = (
  genre as string
).toLowerCase() as keyof typeof BackendGenre;
const backendGenre = BackendGenre[genreKey] ?? BackendGenre.fantasy;

const req = {
  genre: backendGenre,
  context: `Run in progress.Previous: ${ prevNarrative.slice(0, 200) } `,
  prompt: `The runner has reached the intersection: ${ intersection.streetName }. Generate an immersive ${ genre } story node with 2 - 3 choices for which direction to go.`,
  intersectionHint: intersection.streetName,
};

backend
  .generateStoryNode(req)
  .then(async (aiResp) => {
    const newNode: StoryNode = {
      id: `node - ${ Date.now() } `,
      runId,
      nodeIndex: (state.currentNode?.nodeIndex ?? -1) + 1,
      narrativeText: aiResp.narrative,
      choices: aiResp.choices.map((c) => ({
        id: String(c.id),
        direction: c.direction.toLowerCase() as
          | "left"
          | "right"
          | "straight"
          | "back",
        label: c.text,
        previewText: "",
      })),
      intersection,
      timestamp: BigInt(Date.now()),
    };

    // Persist the node
    const backendNode = {
      id: BigInt(Date.now()),
      createdAt: BigInt(Date.now()),
      narrative: aiResp.narrative,
      choices: aiResp.choices,
      generatedByAi: true,
      intersection: {
        heading: Direction.straight,
        streetNames: [intersection.streetName],
        coords: {
          lat: intersection.lat,
          lon: intersection.lng,
          timestamp: BigInt(Date.now()),
        },
      },
    };
    backend.addStoryNode(runIdNum, backendNode).catch(() => {
      /* silent */
    });

    // TTS flow
    if (state.ttsEnabled) {
      setCurrentNode(newNode);
      try {
        const ttsResp = await backend.generateTts({
          text: aiResp.narrative.slice(0, 400),
          voice: "alloy",
          speed: 1.0,
        });
        if (ttsResp.audioBase64) {
          await playTts(ttsResp.audioBase64);
        }
      } catch {
        // TTS failed silently
      }
    } else {
      setCurrentNode(newNode);
    }
  })
  .catch(() => {
    setGenerating(false);
  })
  .finally(() => {
    generatingRef.current = false;
  });
```

}, [
  state.pendingIntersection,
  state.isGeneratingStory,
  state.isAwaitingChoice,
  backend,
  genre,
  runId,
  state.currentNode,
  state.ttsEnabled,
  setCurrentNode,
  setGenerating,
  playTts,
]);

// ── Handle choice selection ──────────────────────────────────────────────
const handleChoice = useCallback(
  (choiceId: string) => {
    if (!backend || generatingRef.current) return;
    makeChoiceLocal(choiceId);

    ```
  const runIdNum = BigInt(runId);
  const nodeIdStr = state.currentNode?.id?.replace(/\D/g, "") ?? "0";
  const nodeId = nodeIdStr ? BigInt(nodeIdStr) : BigInt(0);
  const choiceIdStr = choiceId.replace(/\D/g, "") ?? "0";
  const cId = choiceIdStr ? BigInt(choiceIdStr) : BigInt(0);

  backend.makeChoice(runIdNum, nodeId, cId).catch(() => {
    /* silent */
  });

  // ── Auto-generate next chapter after choice at intersection ────────
  if (state.currentNode?.intersection) {
    // Trigger chapter generation after a short delay to allow state update
    setTimeout(() => {
      if (generatingRef.current) return;

      generatingRef.current = true;
      setGenerating(true);

      const intersection = state.currentNode!.intersection!;
      const prevNarrative = state.currentNode?.narrativeText ?? "";
      const genreKey = (
        genre as string
      ).toLowerCase() as keyof typeof BackendGenre;
      const backendGenre = BackendGenre[genreKey] ?? BackendGenre.fantasy;

      const req = {
        genre: backendGenre,
        context: `Run in progress.Previous: ${ prevNarrative.slice(0, 200) }. The runner chose to go ${
      state.currentNode?.choices.find((c) => c.id === choiceId)?.direction || "ahead"
    }.`,
        prompt: `The runner chose to go ${
      state.currentNode?.choices.find((c) => c.id === choiceId)?.direction || "ahead"
    } at the intersection: ${ intersection.streetName }. Continue the ${ genre } story adventure with an immersive next chapter and generate 2 - 3 new directional choices.`,
        intersectionHint: intersection.streetName,
      };

      backend
        .generateStoryNode(req)
        .then(async (aiResp) => {
          const newNode: StoryNode = {
            id: `node - ${ Date.now() } `,
            runId,
            nodeIndex: (state.currentNode?.nodeIndex ?? -1) + 1,
            narrativeText: aiResp.narrative,
            choices: aiResp.choices.map((c) => ({
              id: String(c.id),
              direction: c.direction.toLowerCase() as
                | "left"
                | "right"
                | "straight"
                | "back",
              label: c.text,
              previewText: "",
            })),
            intersection,
            timestamp: BigInt(Date.now()),
          };

          // Persist the node
          const backendNode = {
            id: BigInt(Date.now()),
            createdAt: BigInt(Date.now()),
            narrative: aiResp.narrative,
            choices: aiResp.choices,
            generatedByAi: true,
            intersection: {
              heading: Direction.straight,
              streetNames: [intersection.streetName],
              coords: {
                lat: intersection.lat,
                lon: intersection.lng,
                timestamp: BigInt(Date.now()),
              },
            },
          };
          backend.addStoryNode(runIdNum, backendNode).catch(() => {
            /* silent */
          });

          // TTS flow
          if (state.ttsEnabled) {
            setCurrentNode(newNode);
            try {
              const ttsResp = await backend.generateTts({
                text: aiResp.narrative.slice(0, 400),
                voice: "alloy",
                speed: 1.0,
              });
              if (ttsResp.audioBase64) {
                await playTts(ttsResp.audioBase64);
              }
            } catch {
              // TTS failed silently
            }
          } else {
            setCurrentNode(newNode);
          }
        })
        .catch(() => {
          setGenerating(false);
        })
        .finally(() => {
          generatingRef.current = false;
        });
    }, 300); // Small delay to allow state to settle
  }
},
[backend, makeChoiceLocal, runId, state, genre, setGenerating, setCurrentNode, playTts],
```

);

// ── End run ──────────────────────────────────────────────────────────────
const handleFinishConfirm = useCallback(async () => {
  setShowEndDialog(false);

  ```
if (backend) {
  const runIdNum = BigInt(runId);
  const endTime = BigInt(Date.now());
  const distMeters = Math.round(state.stats.distanceKm * 1000);
  const paceSecPerKm =
    state.stats.paceMinPerKm > 0
      ? Math.round(state.stats.paceMinPerKm * 60)
      : 0;

  await backend
    .finishRun(runIdNum, endTime, distMeters, paceSecPerKm)
    .catch(() => {
      /* silent */
    });
}

stopRun();
navigate({ to: "/story/$runId", params: { runId } });
```

}, [backend, runId, state.stats, stopRun, navigate]);

const position =
  state.lastPosition ??
  (state.gpsTrail.length > 0
    ? state.gpsTrail[state.gpsTrail.length - 1]
    : null);

const choicesLocked = state.ttsEnabled && state.isTtsPlaying;
const showChoices =
  state.currentNode &&
  state.currentNode.choices.length > 0 &&
  !state.isGeneratingStory;

const genreLabel = GENRE_LABEL[genre as string] ?? String(genre);

return (
  <div
    className="relative flex flex-col h-screen overflow-hidden bg-background"
    data-ocid="active-run-page"
  >
    {/* ── Stats bar ── */}
    <RunStatsBar stats={state.stats} />

    ```
    {/* ── Map ── */}
    <div className="flex-1 relative overflow-hidden">
      <RunMap
        lat={position?.lat ?? null}
        lng={position?.lng ?? null}
        hasGps={state.gpsTrail.length > 0}
      />

      {/* Pause overlay */}
      <AnimatePresence>
        {state.isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-10"
          >
            <div className="w-16 h-16 rounded-full border-2 border-primary/40 bg-card/80 flex items-center justify-center shadow-story">
              <Pause size={28} className="text-primary" />
            </div>
            <p className="font-display text-lg uppercase tracking-[0.25em] text-foreground">
              Paused
            </p>
            <p className="font-body text-sm text-muted-foreground">
              GPS tracking suspended
            </p>
            <Button
              data-ocid="resume-run-btn"
              variant="outline"
              className="mt-2 border-primary/40 font-display uppercase tracking-wider text-sm"
              onClick={resumeRun}
            >
              <Play size={14} className="mr-1.5" />
              Resume Run
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intersection badge (floating on map) */}
      <AnimatePresence>
        {state.pendingIntersection && !state.isGeneratingStory && (
          <motion.div
            initial={{ x: -32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -32, opacity: 0 }}
            className="absolute top-3 left-3 z-20 bg-card/90 backdrop-blur border border-accent/40 rounded-xl px-3 py-2 shadow-story max-w-[200px]"
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <motion.div
                className="w-2 h-2 rounded-full bg-accent"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1, repeat: INF }}
              />
              <span className="font-display text-[10px] uppercase tracking-widest text-accent">
                Intersection
              </span>
            </div>
            <p className="font-mono text-xs text-foreground truncate">
              {state.pendingIntersection.streetName}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current street badge */}
      {state.currentStreetName && !state.pendingIntersection && (
        <div className="absolute top-3 left-3 z-20 bg-card/70 backdrop-blur border border-border/30 rounded-lg px-2.5 py-1.5">
          <p className="font-mono text-[10px] text-muted-foreground truncate max-w-[180px]">
            {state.currentStreetName}
          </p>
        </div>
      )}

      {/* Map attribution */}
      <div className="absolute bottom-1 right-1 z-10">
        <span className="text-[9px] text-muted-foreground/50 font-mono">
          © OpenStreetMap
        </span>
      </div>
    </div>

    {/* ── Bottom story + controls panel ── */}
    <div
      className="relative bg-background/97 backdrop-blur-md border-t border-border/40 px-4 pt-3 pb-safe space-y-3"
      style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
    >
      {/* Control row */}
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="border-primary/30 text-primary bg-primary/5 font-display uppercase tracking-widest text-[10px] shrink-0"
        >
          {genreLabel}
        </Badge>

        {/* Narrating indicator */}
        <div className="flex-1 flex justify-center">
          <AnimatePresence>
            {state.isTtsPlaying && <NarratingBadge />}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            data-ocid="tts-toggle-run"
            variant="ghost"
            size="sm"
            onClick={toggleTts}
            aria-label={
              state.ttsEnabled ? "Disable narration" : "Enable narration"
            }
            className="h-8 w-8 p-0"
          >
            {state.ttsEnabled ? (
              <Volume2 size={15} className="text-accent" />
            ) : (
              <VolumeX size={15} className="text-muted-foreground" />
            )}
          </Button>

          <Button
            data-ocid="pause-run-btn"
            variant="ghost"
            size="sm"
            onClick={state.isPaused ? resumeRun : pauseRun}
            aria-label={state.isPaused ? "Resume run" : "Pause run"}
            className="h-8 w-8 p-0"
          >
            {state.isPaused ? (
              <Play size={15} className="text-primary" />
            ) : (
              <Pause size={15} className="text-muted-foreground" />
            )}
          </Button>

          <Button
            data-ocid="finish-run-btn"
            variant="destructive"
            size="sm"
            onClick={() => setShowEndDialog(true)}
            className="h-8 px-3 font-display uppercase tracking-wider text-xs"
          >
            <Square size={10} className="mr-1" />
            End
          </Button>
        </div>
      </div>

      {/* Story panel */}
      <StoryPanel
        node={state.currentNode}
        isGenerating={state.isGeneratingStory}
      />

      {/* Choice buttons */}
      <AnimatePresence mode="wait">
        {showChoices && (
          <motion.div
            key={state.currentNode?.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
            data-ocid="choice-panel"
          >
            {state.currentNode!.choices.map((choice, idx) => (
              <motion.div
                key={choice.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
              >
                <ChoiceButton
                  choice={choice}
                  onChoose={handleChoice}
                  disabled={state.isGeneratingStory}
                  ttsBlocked={choicesLocked}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generating spinner */}
      <AnimatePresence>
        {state.isGeneratingStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2.5 justify-center py-1"
            data-ocid="generating-indicator"
          >
            <div className="flex gap-1">
              {SPIN_DOTS.map(({ key, delay }) => (
                <motion.span
                  key={key}
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.9, delay, repeat: INF }}
                />
              ))}
            </div>
            <span className="font-body text-xs text-muted-foreground italic">
              Weaving your fate…
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* ── End run confirmation dialog ── */}
    <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
      <AlertDialogContent className="bg-card border-border/60">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-foreground">
            End this adventure?
          </AlertDialogTitle>
          <AlertDialogDescription className="font-body text-muted-foreground">
            Your run will be saved and you can relive the full story. You've
            covered{" "}
            <span className="text-primary font-semibold">
              {state.stats.distanceKm.toFixed(2)} km
            </span>{" "}
            in this chapter.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            data-ocid="cancel-end-run"
            className="font-display"
          >
            Keep Running
          </AlertDialogCancel>
          <AlertDialogAction
            data-ocid="confirm-end-run"
            onClick={handleFinishConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-display"
          >
            End & Save Story
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
```

);
}

// ── Adapter ───────────────────────────────────────────────────────────────────
function adaptBackendNode(node: {
id: bigint;
narrative: string;
choices: Array<{
id: bigint;
direction: Direction;
text: string;
chosen: boolean;
}>;
intersection?: {
coords: { lat: number; lon: number };
streetNames: string[];
};
createdAt: bigint;
}): StoryNode {
return {
id: String(node.id),
runId: “”,
nodeIndex: 0,
narrativeText: node.narrative,
choices: node.choices.map((c) => ({
id: String(c.id),
direction: c.direction.toLowerCase() as
| “left”
| “right”
| “straight”
| “back”,
label: c.text,
previewText: “”,
})),
intersection: node.intersection
? {
lat: node.intersection.coords.lat,
lng: node.intersection.coords.lon,
streetName: node.intersection.streetNames.join(” & “),
approachBearing: 0,
distanceFromRunner: 0,
}
: undefined,
timestamp: node.createdAt,
};
}