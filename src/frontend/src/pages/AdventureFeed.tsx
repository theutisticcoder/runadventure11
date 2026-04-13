import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useSearch } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Route,
  Sword,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useAllRuns, useMyRuns } from "../hooks/useBackend";
import type { Genre, Run } from "../lib/types";
import { GENRE_BG_COLORS, GENRE_COLORS, GENRE_GLOW } from "../lib/types";

const GENRES: Genre[] = ["Fantasy", "SciFi", "Horror", "Mystery", "Romance"];
const GENRE_LABELS: Record<Genre, string> = {
  Fantasy: "Fantasy",
  SciFi: "Sci-Fi",
  Horror: "Horror",
  Mystery: "Mystery",
  Romance: "Romance",
};

const GENRE_ACCENT_BORDER: Record<Genre, string> = {
  Fantasy: "border-t-amber-400",
  SciFi: "border-t-cyan-400",
  Horror: "border-t-red-500",
  Mystery: "border-t-purple-400",
  Romance: "border-t-rose-400",
};

const PAGE_SIZE = 9;

function formatDistance(meters: number): string {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(2)} km`
    : `${Math.round(meters)} m`;
}

function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function RunCard({ run, index }: { run: Run; index: number }) {
  const genre = run.genre as Genre;
  const accentBorder =
    genre in GENRE_ACCENT_BORDER
      ? GENRE_ACCENT_BORDER[genre]
      : "border-t-border";
  const glowClass = genre in GENRE_GLOW ? GENRE_GLOW[genre] : "";
  const colorClass = genre in GENRE_COLORS ? GENRE_COLORS[genre] : "";
  const bgClass = genre in GENRE_BG_COLORS ? GENRE_BG_COLORS[genre] : "";
  const preview = run.chapters[0]?.text?.slice(0, 150) ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
    >
      <Link
        to="/story/$slug"
        params={{ slug: run.slug }}
        data-ocid={`run-card-${run.slug}`}
        className={[
          "group block rounded-xl bg-card border-t-2 border border-border/40",
          "hover:border-border/70 hover:-translate-y-1 hover:scale-[1.01]",
          "transition-all duration-300 overflow-hidden cursor-pointer",
          `${accentBorder} hover:${glowClass}`,
        ].join(" ")}
      >
        {/* Body */}
        <div className="p-4 flex flex-col gap-3">
          {/* Title + genre badge */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-bold text-base text-foreground leading-tight line-clamp-2 group-hover:text-accent transition-colors">
              {run.title}
            </h3>
            <Badge
              variant="outline"
              className={`flex-shrink-0 text-xs font-semibold border ${colorClass} ${bgClass}`}
            >
              {GENRE_LABELS[genre] ?? run.genre}
            </Badge>
          </div>

          {/* Preview text */}
          {preview && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {preview}
              {run.chapters[0]?.text && run.chapters[0].text.length > 150
                ? "…"
                : ""}
            </p>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-2 border-t border-border/30">
            <span className="flex items-center gap-1">
              <Route size={11} className="shrink-0" />
              {formatDistance(run.totalDistance)}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen size={11} className="shrink-0" />
              {run.chapters.length} ch.
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} className="shrink-0" />
              {formatDate(run.startTime)}
            </span>
            {run.userName && (
              <span className="flex items-center gap-1 ml-auto min-w-0">
                <User size={11} className="shrink-0" />
                <span className="truncate max-w-[80px]">{run.userName}</span>
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-xl bg-card border border-border/30 overflow-hidden">
      <div className="h-1 bg-border/30" />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <div className="flex gap-4 pt-2 border-t border-border/30">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export default function AdventureFeed() {
  const { my: showMyRuns } = useSearch({ from: "/feed" });
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const isShowingMine = showMyRuns && isAuthenticated;
  const allRunsQuery = useAllRuns();
  const myRunsQuery = useMyRuns();

  const runs: Run[] =
    (isShowingMine ? myRunsQuery.data : allRunsQuery.data) ?? [];
  const isLoading = isShowingMine
    ? myRunsQuery.isLoading
    : allRunsQuery.isLoading;

  const [activeGenre, setActiveGenre] = useState<Genre | null>(null);
  const [page, setPage] = useState(1);

  // Filter
  const filtered = activeGenre
    ? runs.filter((r) => r.genre === activeGenre)
    : runs;

  // Sort newest first
  const sorted = [...filtered].sort(
    (a, b) => Number(b.startTime) - Number(a.startTime),
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleGenreFilter(genre: Genre) {
    setActiveGenre((prev) => (prev === genre ? null : genre));
    setPage(1);
  }

  return (
    <div className="flex-1 flex flex-col bg-background min-h-screen">
      {/* Header zone */}
      <div className="bg-card border-b border-border/40 px-4 py-8">
        <div className="max-w-screen-lg mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <Sword size={22} className="text-accent shrink-0" />
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground tracking-tight">
              {isShowingMine ? "My Adventures" : "Adventure Feed"}
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base mt-2 pl-1">
            {isShowingMine
              ? "Your saved runs and stories — every adventure you've completed."
              : "Real streets. Real choices. Every story written by a runner — and the streets they run."}
          </p>

          {/* Genre filter chips */}
          <div className="flex flex-wrap gap-2 mt-5" data-ocid="genre-filters">
            <button
              type="button"
              onClick={() => {
                setActiveGenre(null);
                setPage(1);
              }}
              data-ocid="filter-all"
              className={[
                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all min-h-[36px]",
                !activeGenre
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-card text-muted-foreground border-border/50 hover:border-border",
              ].join(" ")}
            >
              All
            </button>
            {GENRES.map((g) => {
              const isActive = activeGenre === g;
              const colorClass = GENRE_COLORS[g];
              const bgClass = GENRE_BG_COLORS[g];
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleGenreFilter(g)}
                  data-ocid={`filter-${g.toLowerCase()}`}
                  className={[
                    "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all min-h-[36px]",
                    isActive
                      ? `${colorClass} ${bgClass}`
                      : "bg-card text-muted-foreground border-border/50 hover:border-border",
                  ].join(" ")}
                >
                  {GENRE_LABELS[g]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content zone */}
      <div className="flex-1 px-4 py-8 max-w-screen-lg mx-auto w-full">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => `sk-${i}`).map((k) => (
              <CardSkeleton key={k} />
            ))}
          </div>
        ) : paginated.length > 0 ? (
          <>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              data-ocid="runs-grid"
            >
              {paginated.map((run, i) => (
                <RunCard key={run.slug} run={run} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                className="flex items-center justify-center gap-3 mt-10"
                data-ocid="pagination"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  data-ocid="prev-page"
                  className="min-h-[44px] min-w-[44px] px-3"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </Button>

                <span className="text-sm text-muted-foreground font-medium px-2">
                  Page {page} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  data-ocid="next-page"
                  className="min-h-[44px] min-w-[44px] px-3"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}

            {/* Result count */}
            <p className="text-center text-xs text-muted-foreground/60 mt-4">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}{" "}
              adventures
            </p>
          </>
        ) : (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-24 text-center"
            data-ocid="empty-feed"
          >
            <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
              <Sword size={36} className="text-accent/60" />
            </div>
            <h3 className="font-display font-bold text-2xl text-foreground mb-3">
              {activeGenre
                ? `No ${GENRE_LABELS[activeGenre]} Adventures Yet`
                : "No Adventures Yet"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs mb-8 leading-relaxed">
              {activeGenre
                ? `Be the first to complete a ${GENRE_LABELS[activeGenre]} RunQuest and share your story with the world.`
                : "No adventures yet — be the first to run! Complete a RunQuest and your story will appear here for the world to read."}
            </p>
            {activeGenre ? (
              <Button
                variant="outline"
                onClick={() => setActiveGenre(null)}
                data-ocid="clear-genre-filter"
                className="min-h-[44px]"
              >
                View All Adventures
              </Button>
            ) : (
              <Link to="/run" search={{ genre: undefined }}>
                <Button
                  data-ocid="empty-start-run"
                  className="min-h-[44px] px-8 font-semibold text-base"
                >
                  Start Your First Run
                </Button>
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
