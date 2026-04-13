import { c as createLucideIcon, f as useSearch, u as useInternetIdentity, r as reactExports, j as jsxRuntimeExports, d as Button, L as Link, e as Skeleton, B as BookOpen } from "./index-ymYNhal3.js";
import { a as GENRE_COLORS, b as GENRE_BG_COLORS, B as Badge, c as GENRE_GLOW } from "./types-DyhVcTQh.js";
import { a as useAllRuns, b as useMyRuns } from "./useBackend-DocdoYzJ.js";
import { C as ChevronLeft, R as Route, a as Clock } from "./route-CaXf1Vyi.js";
import { C as ChevronRight } from "./chevron-right-sYAhB7gZ.js";
import { m as motion } from "./proxy-Bg103kUM.js";
import { U as User } from "./user-B2TJ_Ed2.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["polyline", { points: "14.5 17.5 3 6 3 3 6 3 17.5 14.5", key: "1hfsw2" }],
  ["line", { x1: "13", x2: "19", y1: "19", y2: "13", key: "1vrmhu" }],
  ["line", { x1: "16", x2: "20", y1: "16", y2: "20", key: "1bron3" }],
  ["line", { x1: "19", x2: "21", y1: "21", y2: "19", key: "13pww6" }]
];
const Sword = createLucideIcon("sword", __iconNode);
const GENRES = ["Fantasy", "SciFi", "Horror", "Mystery", "Romance"];
const GENRE_LABELS = {
  Fantasy: "Fantasy",
  SciFi: "Sci-Fi",
  Horror: "Horror",
  Mystery: "Mystery",
  Romance: "Romance"
};
const GENRE_ACCENT_BORDER = {
  Fantasy: "border-t-amber-400",
  SciFi: "border-t-cyan-400",
  Horror: "border-t-red-500",
  Mystery: "border-t-purple-400",
  Romance: "border-t-rose-400"
};
const PAGE_SIZE = 9;
function formatDistance(meters) {
  return meters >= 1e3 ? `${(meters / 1e3).toFixed(2)} km` : `${Math.round(meters)} m`;
}
function formatDate(ts) {
  const ms = Number(ts) / 1e6;
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}
function RunCard({ run, index }) {
  var _a, _b, _c;
  const genre = run.genre;
  const accentBorder = genre in GENRE_ACCENT_BORDER ? GENRE_ACCENT_BORDER[genre] : "border-t-border";
  const glowClass = genre in GENRE_GLOW ? GENRE_GLOW[genre] : "";
  const colorClass = genre in GENRE_COLORS ? GENRE_COLORS[genre] : "";
  const bgClass = genre in GENRE_BG_COLORS ? GENRE_BG_COLORS[genre] : "";
  const preview = ((_b = (_a = run.chapters[0]) == null ? void 0 : _a.text) == null ? void 0 : _b.slice(0, 150)) ?? "";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 24 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.35, delay: index * 0.06, ease: "easeOut" },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/story/$slug",
          params: { slug: run.slug },
          "data-ocid": `run-card-${run.slug}`,
          className: [
            "group block rounded-xl bg-card border-t-2 border border-border/40",
            "hover:border-border/70 hover:-translate-y-1 hover:scale-[1.01]",
            "transition-all duration-300 overflow-hidden cursor-pointer",
            `${accentBorder} hover:${glowClass}`
          ].join(" "),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 flex flex-col gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-bold text-base text-foreground leading-tight line-clamp-2 group-hover:text-accent transition-colors", children: run.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  variant: "outline",
                  className: `flex-shrink-0 text-xs font-semibold border ${colorClass} ${bgClass}`,
                  children: GENRE_LABELS[genre] ?? run.genre
                }
              )
            ] }),
            preview && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground leading-relaxed line-clamp-3", children: [
              preview,
              ((_c = run.chapters[0]) == null ? void 0 : _c.text) && run.chapters[0].text.length > 150 ? "…" : ""
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-2 border-t border-border/30", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Route, { size: 11, className: "shrink-0" }),
                formatDistance(run.totalDistance)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { size: 11, className: "shrink-0" }),
                run.chapters.length,
                " ch."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 11, className: "shrink-0" }),
                formatDate(run.startTime)
              ] }),
              run.userName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 ml-auto min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(User, { size: 11, className: "shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate max-w-[80px]", children: run.userName })
              ] })
            ] })
          ] })
        }
      )
    }
  );
}
function CardSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-card border border-border/30 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 bg-border/30" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-3/4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-16 rounded-full" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-5/6" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-4/6" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 pt-2 border-t border-border/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-14" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-12" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-20" })
      ] })
    ] })
  ] });
}
function AdventureFeed() {
  const { my: showMyRuns } = useSearch({ from: "/feed" });
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isShowingMine = showMyRuns && isAuthenticated;
  const allRunsQuery = useAllRuns();
  const myRunsQuery = useMyRuns();
  const runs = (isShowingMine ? myRunsQuery.data : allRunsQuery.data) ?? [];
  const isLoading = isShowingMine ? myRunsQuery.isLoading : allRunsQuery.isLoading;
  const [activeGenre, setActiveGenre] = reactExports.useState(null);
  const [page, setPage] = reactExports.useState(1);
  const filtered = activeGenre ? runs.filter((r) => r.genre === activeGenre) : runs;
  const sorted = [...filtered].sort(
    (a, b) => Number(b.startTime) - Number(a.startTime)
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  function handleGenreFilter(genre) {
    setActiveGenre((prev) => prev === genre ? null : genre);
    setPage(1);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col bg-background min-h-screen", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border-b border-border/40 px-4 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-screen-lg mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sword, { size: 22, className: "text-accent shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display font-bold text-3xl sm:text-4xl text-foreground tracking-tight", children: isShowingMine ? "My Adventures" : "Adventure Feed" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm sm:text-base mt-2 pl-1", children: isShowingMine ? "Your saved runs and stories — every adventure you've completed." : "Real streets. Real choices. Every story written by a runner — and the streets they run." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mt-5", "data-ocid": "genre-filters", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              setActiveGenre(null);
              setPage(1);
            },
            "data-ocid": "filter-all",
            className: [
              "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all min-h-[36px]",
              !activeGenre ? "bg-accent text-accent-foreground border-accent" : "bg-card text-muted-foreground border-border/50 hover:border-border"
            ].join(" "),
            children: "All"
          }
        ),
        GENRES.map((g) => {
          const isActive = activeGenre === g;
          const colorClass = GENRE_COLORS[g];
          const bgClass = GENRE_BG_COLORS[g];
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => handleGenreFilter(g),
              "data-ocid": `filter-${g.toLowerCase()}`,
              className: [
                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all min-h-[36px]",
                isActive ? `${colorClass} ${bgClass}` : "bg-card text-muted-foreground border-border/50 hover:border-border"
              ].join(" "),
              children: GENRE_LABELS[g]
            },
            g
          );
        })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 px-4 py-8 max-w-screen-lg mx-auto w-full", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: Array.from({ length: 6 }, (_, i) => `sk-${i}`).map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx(CardSkeleton, {}, k)) }) : paginated.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
          "data-ocid": "runs-grid",
          children: paginated.map((run, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(RunCard, { run, index: i }, run.slug))
        }
      ),
      totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex items-center justify-center gap-3 mt-10",
          "data-ocid": "pagination",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => setPage((p) => Math.max(1, p - 1)),
                disabled: page === 1,
                "data-ocid": "prev-page",
                className: "min-h-[44px] min-w-[44px] px-3",
                "aria-label": "Previous page",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 16 })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground font-medium px-2", children: [
              "Page ",
              page,
              " of ",
              totalPages
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
                disabled: page === totalPages,
                "data-ocid": "next-page",
                className: "min-h-[44px] min-w-[44px] px-3",
                "aria-label": "Next page",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 16 })
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-muted-foreground/60 mt-4", children: [
        "Showing ",
        (page - 1) * PAGE_SIZE + 1,
        "–",
        Math.min(page * PAGE_SIZE, sorted.length),
        " of ",
        sorted.length,
        " ",
        "adventures"
      ] })
    ] }) : (
      /* Empty state */
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4 },
          className: "flex flex-col items-center justify-center py-24 text-center",
          "data-ocid": "empty-feed",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sword, { size: 36, className: "text-accent/60" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-bold text-2xl text-foreground mb-3", children: activeGenre ? `No ${GENRE_LABELS[activeGenre]} Adventures Yet` : "No Adventures Yet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm max-w-xs mb-8 leading-relaxed", children: activeGenre ? `Be the first to complete a ${GENRE_LABELS[activeGenre]} RunQuest and share your story with the world.` : "No adventures yet — be the first to run! Complete a RunQuest and your story will appear here for the world to read." }),
            activeGenre ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outline",
                onClick: () => setActiveGenre(null),
                "data-ocid": "clear-genre-filter",
                className: "min-h-[44px]",
                children: "View All Adventures"
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/run", search: { genre: void 0 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                "data-ocid": "empty-start-run",
                className: "min-h-[44px] px-8 font-semibold text-base",
                children: "Start Your First Run"
              }
            ) })
          ]
        }
      )
    ) })
  ] });
}
export {
  AdventureFeed as default
};
