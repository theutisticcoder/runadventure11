import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import L from "leaflet";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  MapPin,
  Route,
  Share2,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRunBySlug } from "../hooks/useBackend";
import type { GpsCoord } from "../lib/types";
import { GENRE_BG_COLORS, GENRE_COLORS, GENRE_GLOW } from "../lib/types";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDistance(meters: number): string {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(2)} km`
    : `${Math.round(meters)} m`;
}

function formatDuration(start: bigint, end: bigint): string {
  const secs = Number(end - start) / 1_000_000_000;
  if (secs <= 0) return "—";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  if (ms <= 0) return "—";
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Route Map ──────────────────────────────────────────────────────────────

interface RouteMapProps {
  gpsRoute: GpsCoord[];
  chapterCoords: GpsCoord[];
  genreColor: string;
}

function RouteMap({ gpsRoute, chapterCoords, genreColor }: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Extract a CSS color value from Tailwind text-* class for the polyline
  const lineColor = genreColor.includes("amber")
    ? "#fbbf24"
    : genreColor.includes("cyan")
      ? "#22d3ee"
      : genreColor.includes("red")
        ? "#ef4444"
        : genreColor.includes("purple")
          ? "#a78bfa"
          : genreColor.includes("rose")
            ? "#fb7185"
            : "#f59e0b";

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
      dragging: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      className: "leaflet-dark-tiles",
    }).addTo(map);

    mapRef.current = map;

    // Draw GPS trail
    if (gpsRoute.length > 1) {
      const latLngs = gpsRoute.map((c) => L.latLng(c.lat, c.lon));
      L.polyline(latLngs, {
        color: lineColor,
        weight: 4,
        opacity: 0.85,
      }).addTo(map);

      // Fit bounds
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [32, 32] });
    } else if (chapterCoords.length > 0) {
      map.setView([chapterCoords[0].lat, chapterCoords[0].lon], 15);
    }

    // Chapter markers
    for (let idx = 0; idx < chapterCoords.length; idx++) {
      const coord = chapterCoords[idx];
      const markerHtml = `<div style="width:28px;height:28px;border-radius:50%;background:${lineColor};color:#000;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;border:2px solid rgba(0,0,0,0.5);box-shadow:0 0 8px ${lineColor}88;">${idx + 1}</div>`;
      const icon = L.divIcon({
        className: "",
        html: markerHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      L.marker([coord.lat, coord.lon], { icon }).addTo(map);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [gpsRoute, chapterCoords, lineColor]);

  return (
    <div
      ref={containerRef}
      className="w-full h-64 sm:h-80 rounded-xl overflow-hidden border border-border/40"
      data-ocid="story-map"
      aria-label="GPS route map"
    />
  );
}

// ─── Chapter Card ────────────────────────────────────────────────────────────

interface ChapterCardProps {
  chapterNum: number;
  street1: string;
  street2: string;
  direction: string;
  text: string;
  choiceMade: string | undefined;
  isLast: boolean;
}

function ChapterCard({
  chapterNum,
  street1,
  street2,
  direction,
  text,
  choiceMade,
  isLast,
}: ChapterCardProps) {
  return (
    <div
      className="flex flex-col gap-0"
      data-ocid={`chapter-card-${chapterNum}`}
    >
      {/* Card */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        {/* Chapter header */}
        <div className="bg-muted/30 border-b border-border/30 px-4 py-3 flex items-start gap-3">
          <span className="w-8 h-8 rounded-full bg-accent/20 text-accent text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
            {chapterNum}
          </span>
          <div className="min-w-0">
            <div className="font-display font-semibold text-base text-foreground leading-tight">
              At the corner of <span className="text-accent">{street1}</span>
              {" & "}
              <span className="text-accent">{street2}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <ArrowRight size={10} />
              Heading {direction}
            </div>
          </div>
        </div>

        {/* Chapter text */}
        <div className="px-4 py-4">
          <p className="text-base leading-relaxed text-foreground font-body">
            {text}
          </p>
        </div>
      </div>

      {/* Choice connector — shown between chapters */}
      {!isLast && choiceMade && (
        <div
          className="flex items-center gap-3 px-2 py-3"
          data-ocid={`chapter-choice-${chapterNum}`}
        >
          <div className="flex-shrink-0 w-8 flex justify-center">
            <div className="w-0.5 h-full bg-border/40 min-h-[28px]" />
          </div>
          <div className="flex items-center gap-2 bg-muted/20 border border-border/30 rounded-lg px-3 py-2 flex-1 min-w-0">
            <Check size={14} className="text-accent flex-shrink-0" />
            <span className="text-sm text-muted-foreground">
              Runner chose:{" "}
              <span className="font-medium text-foreground">{choiceMade}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div
      className="flex-1 px-4 py-6 max-w-screen-lg mx-auto w-full flex flex-col gap-4"
      data-ocid="story-loading"
    >
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-10 w-3/4" />
      <div className="flex gap-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-44 w-full rounded-xl" />
      <Skeleton className="h-44 w-full rounded-xl" />
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function StoryViewer() {
  const { slug } = useParams({ from: "/story/$slug" });
  const { data: run, isLoading } = useRunBySlug(slug);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!", {
        description: "Share your adventure with anyone.",
        duration: 3500,
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy link", {
        description: "Try copying the URL from your browser address bar.",
      });
    }
  };

  if (isLoading) return <LoadingSkeleton />;

  if (!run) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center"
        data-ocid="story-not-found"
      >
        <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mb-6">
          <BookOpen size={36} className="text-muted-foreground/50" />
        </div>
        <h2 className="font-display font-bold text-2xl text-foreground mb-3">
          Adventure Not Found
        </h2>
        <p className="text-muted-foreground text-base max-w-xs mb-8 leading-relaxed">
          This story may have been removed or the link is no longer valid.
        </p>
        <Link to="/feed" search={{ my: false }}>
          <Button variant="outline" className="gap-2 min-h-[44px]">
            <ChevronLeft size={16} />
            Back to Adventure Feed
          </Button>
        </Link>
      </div>
    );
  }

  const genre = run.genre as keyof typeof GENRE_COLORS;
  const genreColor = GENRE_COLORS[genre] ?? "text-accent";
  const genreBg = GENRE_BG_COLORS[genre] ?? "bg-muted/20 border-border/30";
  const genreGlow = GENRE_GLOW[genre] ?? "";

  // Build chapter GPS coords — use first GPS point near each chapter index
  // as a best-effort: evenly distribute route points across chapters
  const chapterCoords: GpsCoord[] = run.chapters.map((_, i) => {
    if (run.gpsRoute.length === 0) return { lat: 0, lon: 0 };
    const ratio = run.chapters.length > 1 ? i / (run.chapters.length - 1) : 0;
    const idx = Math.round(ratio * (run.gpsRoute.length - 1));
    return run.gpsRoute[idx];
  });

  const validChapterCoords = chapterCoords.filter(
    (c) => c.lat !== 0 || c.lon !== 0,
  );
  const showMap = run.gpsRoute.length > 0 || validChapterCoords.length > 0;

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* ── Story Header ─────────────────────────────────────── */}
      <div className="bg-card border-b border-border/40 px-4 pt-4 pb-5">
        <div className="max-w-screen-lg mx-auto">
          {/* Back link */}
          <Link
            to="/feed"
            search={{ my: false }}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            data-ocid="story-back-link"
          >
            <ChevronLeft size={15} />
            Back to Adventure Feed
          </Link>

          {/* Title row */}
          <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-foreground leading-tight">
                {run.title}
              </h1>
              {run.userName && (
                <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-1.5">
                  <User size={13} />
                  {run.userName}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge
                variant="secondary"
                className={`text-sm font-semibold px-3 py-1 border ${genreColor} ${genreBg} ${genreGlow}`}
              >
                {run.genre}
              </Badge>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-5 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5">
              <Route size={13} />
              {formatDistance(run.totalDistance)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} />
              {formatDuration(run.startTime, run.endTime)}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen size={13} />
              {run.chapters.length} chapter
              {run.chapters.length !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {formatDate(run.startTime)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={13} />
              {run.gpsRoute.length} GPS points
            </span>
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="flex-1 max-w-screen-lg mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* Share button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            data-ocid="story-share-btn"
            className="gap-2 min-h-[44px] border-border/60 hover:border-accent/60 hover:text-accent transition-smooth"
          >
            {copied ? (
              <>
                <Check size={15} className="text-accent" />
                Copied!
              </>
            ) : (
              <>
                <Share2 size={15} />
                Share
              </>
            )}
          </Button>
        </div>

        {/* Route Map */}
        {showMap && (
          <section aria-label="GPS route map">
            <RouteMap
              gpsRoute={run.gpsRoute}
              chapterCoords={validChapterCoords}
              genreColor={genreColor}
            />
          </section>
        )}

        {/* Chapters */}
        <section aria-label="Story chapters">
          {run.chapters.length > 0 ? (
            <div className="flex flex-col gap-0" data-ocid="chapters-list">
              {run.chapters.map((chapter, i) => (
                <ChapterCard
                  key={`chapter-${chapter.streetName1}-${chapter.streetName2}-${String(i)}`}
                  chapterNum={i + 1}
                  street1={chapter.streetName1}
                  street2={chapter.streetName2}
                  direction={chapter.direction}
                  text={chapter.text}
                  choiceMade={run.choices[i]}
                  isLast={i === run.chapters.length - 1}
                />
              ))}
            </div>
          ) : (
            <div
              className="flex flex-col items-center py-16 text-center text-muted-foreground"
              data-ocid="chapters-empty"
            >
              <BookOpen size={36} className="mb-4 opacity-40" />
              <p className="text-base">
                No chapters recorded for this adventure.
              </p>
            </div>
          )}
        </section>

        {/* Bottom CTA */}
        <div className="border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Want to write your own adventure?
          </p>
          <Link to="/run" search={{ genre: undefined }}>
            <Button
              className="gap-2 min-h-[44px] bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              data-ocid="story-start-run-cta"
            >
              Start Your Run
              <ArrowRight size={15} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
