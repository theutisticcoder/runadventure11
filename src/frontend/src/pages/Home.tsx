import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronRight,
  MapPin,
  Play,
  Swords,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Genre } from "../lib/types";
import {
  GENRE_BG_COLORS,
  GENRE_BUTTON_COLORS,
  GENRE_COLORS,
  GENRE_GLOW,
} from "../lib/types";

// ─── Genre metadata ────────────────────────────────────────────────────────────

const GENRES: Genre[] = ["Fantasy", "SciFi", "Horror", "Mystery", "Romance"];

const GENRE_ICONS: Record<Genre, string> = {
  Fantasy: "⚔️",
  SciFi: "🚀",
  Horror: "💀",
  Mystery: "🔍",
  Romance: "💕",
};

const GENRE_LABELS: Record<Genre, string> = {
  Fantasy: "Fantasy",
  SciFi: "Sci-Fi",
  Horror: "Horror",
  Mystery: "Mystery",
  Romance: "Romance",
};

const GENRE_DESC: Record<Genre, string> = {
  Fantasy:
    "Dragons, ancient prophecies, and enchanted crossroads. Magic stirs with every step.",
  SciFi:
    "Alien signals, quantum rifts, and rogue AI — the future bleeds into the present.",
  Horror:
    "Something follows you through every block. The shadows grow longer at each turn.",
  Mystery:
    "A dead man's map. Missing persons. The truth hides just around the next corner.",
  Romance:
    "A chance encounter, a racing heart. The city conspires to bring two souls together.",
};

const GENRE_BORDER_ACTIVE: Record<Genre, string> = {
  Fantasy: "border-amber-400",
  SciFi: "border-cyan-400",
  Horror: "border-red-500",
  Mystery: "border-purple-400",
  Romance: "border-rose-400",
};

// ─── Username storage ──────────────────────────────────────────────────────────

const USERNAME_KEY = "runquest_username";

function getStoredUsername(): string {
  return localStorage.getItem(USERNAME_KEY) ?? "";
}

function saveUsername(name: string): void {
  localStorage.setItem(USERNAME_KEY, name.trim());
}

// ─── Genre Card ────────────────────────────────────────────────────────────────

interface GenreCardProps {
  genre: Genre;
  isSelected: boolean;
  onSelect: (g: Genre) => void;
}

function GenreCard({ genre, isSelected, onSelect }: GenreCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(genre)}
      data-ocid={`genre-card-${genre.toLowerCase()}`}
      aria-pressed={isSelected}
      aria-label={`Select ${GENRE_LABELS[genre]} genre`}
      className={[
        "relative rounded-2xl border-2 p-5 flex flex-col items-center gap-3",
        "cursor-pointer text-left transition-all duration-200 outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "min-h-[140px] sm:min-h-[160px]",
        isSelected
          ? `${GENRE_BG_COLORS[genre]} ${GENRE_BORDER_ACTIVE[genre]} ${GENRE_GLOW[genre]}`
          : "bg-card border-border/50 hover:border-border",
      ].join(" ")}
    >
      {/* Selected check */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-3 right-3 w-5 h-5 rounded-full bg-current flex items-center justify-center"
          style={{ color: "transparent" }}
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center ${GENRE_BUTTON_COLORS[genre].split(" ")[0]}`}
          >
            <svg
              width="10"
              height="8"
              viewBox="0 0 10 8"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 4l2.5 2.5L9 1"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </motion.div>
      )}

      <span className="text-4xl leading-none" aria-hidden="true">
        {GENRE_ICONS[genre]}
      </span>
      <span
        className={`font-display font-bold text-lg leading-tight ${isSelected ? GENRE_COLORS[genre] : "text-foreground"}`}
      >
        {GENRE_LABELS[genre]}
      </span>
      <p className="text-sm text-muted-foreground text-center leading-snug line-clamp-2">
        {GENRE_DESC[genre]}
      </p>
    </motion.button>
  );
}

// ─── Username Prompt ───────────────────────────────────────────────────────────

interface UsernamePromptProps {
  onSave: (name: string) => void;
  onSkip: () => void;
}

function UsernamePrompt({ onSave, onSkip }: UsernamePromptProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (value.trim().length > 0) {
      onSave(value.trim());
    } else {
      onSkip();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="relative bg-card border border-border/60 rounded-2xl p-5 mx-4 mb-6 max-w-screen-sm w-full self-center shadow-lg"
    >
      <button
        type="button"
        onClick={onSkip}
        aria-label="Skip username setup"
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
        data-ocid="username-skip"
      >
        <X size={18} />
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
          <User size={18} className="text-accent" />
        </div>
        <div>
          <h3 className="font-display font-bold text-lg text-foreground leading-tight">
            Set your adventurer name
          </h3>
          <p className="text-sm text-muted-foreground">
            Shown on shared adventures
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder="e.g. DragonRunner88"
          maxLength={40}
          className="flex-1 min-h-[48px] text-base bg-muted/50 border-border/60"
          data-ocid="username-input"
          aria-label="Display name"
        />
        <Button
          onClick={handleSave}
          className="min-h-[48px] px-5 font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
          data-ocid="username-save"
        >
          {value.trim() ? "Save" : "Skip"}
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Home Page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const navigate = useNavigate();

  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [username, setUsername] = useState<string>("");

  // Check stored username on mount
  useEffect(() => {
    const stored = getStoredUsername();
    if (stored) {
      setUsername(stored);
    } else {
      // Delay the prompt slightly for a smoother entrance
      const t = setTimeout(() => setShowUsernamePrompt(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const handleUsernameSave = (name: string) => {
    saveUsername(name);
    setUsername(name);
    setShowUsernamePrompt(false);
  };

  const handleUsernameSkip = () => {
    saveUsername("Adventurer");
    setUsername("Adventurer");
    setShowUsernamePrompt(false);
  };

  const handleStartRun = () => {
    if (!selectedGenre) return;
    navigate({ to: "/run", search: { genre: selectedGenre } });
  };

  const selectedButtonClass = selectedGenre
    ? GENRE_BUTTON_COLORS[selectedGenre]
    : "";

  return (
    <div className="flex-1 flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center pt-10 pb-8 px-4 bg-background overflow-hidden">
        {/* Ambient radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, oklch(var(--accent)/0.10) 0%, transparent 65%)",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 w-full max-w-screen-sm mx-auto flex flex-col items-center gap-4 text-center">
          {/* Logo mark */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-16 h-16 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center mb-1"
          >
            <Swords size={32} className="text-accent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <Badge
              variant="secondary"
              className="text-accent border-accent/30 bg-accent/10 text-sm px-4 py-1 mb-3"
            >
              AI-Powered Running Stories
            </Badge>

            {username && (
              <p className="text-base text-muted-foreground mb-2">
                Welcome back,{" "}
                <span className="text-foreground font-semibold">
                  {username}
                </span>
              </p>
            )}

            <h1 className="font-display font-bold text-5xl sm:text-6xl text-foreground leading-none tracking-tight">
              Run
              <span className="text-accent">Quest</span>
            </h1>
            <p className="mt-3 text-lg sm:text-xl text-muted-foreground leading-snug max-w-sm mx-auto">
              Real GPS. Real streets. Every intersection triggers an AI-narrated
              story chapter — shaped by your choices.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Username Prompt ───────────────────────────────────────── */}
      <AnimatePresence>
        {showUsernamePrompt && (
          <div className="flex justify-center bg-background">
            <UsernamePrompt
              onSave={handleUsernameSave}
              onSkip={handleUsernameSkip}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ── Genre Selector ────────────────────────────────────────── */}
      <section className="bg-muted/20 border-t border-border/40 py-10 px-4">
        <div className="max-w-screen-sm mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="font-display font-bold text-3xl text-foreground text-center mb-1">
              Choose Your Genre
            </h2>
            <p className="text-muted-foreground text-center mb-7 text-base">
              Your genre shapes every chapter of the adventure.
            </p>
          </motion.div>

          <fieldset className="grid grid-cols-2 gap-3 sm:gap-4 border-0 p-0 m-0">
            <legend className="sr-only">Genre selection</legend>
            {GENRES.map((genre, i) => (
              <motion.div
                key={genre}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.35 }}
                className={
                  genre === "Romance" ? "col-span-2 sm:col-span-1" : ""
                }
              >
                <GenreCard
                  genre={genre}
                  isSelected={selectedGenre === genre}
                  onSelect={setSelectedGenre}
                />
              </motion.div>
            ))}
          </fieldset>

          {/* Start Run CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-6"
          >
            <AnimatePresence mode="wait">
              {selectedGenre ? (
                <motion.div
                  key="enabled"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    type="button"
                    onClick={handleStartRun}
                    data-ocid="start-run-btn"
                    aria-label={`Start run with ${selectedGenre} genre`}
                    className={[
                      "w-full min-h-[60px] rounded-2xl font-display font-bold text-xl",
                      "flex items-center justify-center gap-3 transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      "shadow-lg active:scale-[0.98]",
                      selectedButtonClass,
                    ].join(" ")}
                  >
                    <Play size={22} />
                    Start {GENRE_LABELS[selectedGenre]} Adventure
                    <ChevronRight size={20} />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="disabled"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    data-ocid="start-run-btn-disabled"
                    className="w-full min-h-[60px] rounded-2xl font-display font-bold text-xl flex items-center justify-center gap-3 bg-muted text-muted-foreground cursor-not-allowed border border-border/40"
                  >
                    <Play size={22} />
                    Select a genre to begin
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {!selectedGenre && (
              <p className="text-center text-sm text-muted-foreground mt-3">
                ↑ Tap a genre card above to unlock your adventure
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section className="py-10 px-4 bg-background border-t border-border/40">
        <div className="max-w-screen-sm mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display font-bold text-2xl text-foreground text-center mb-6"
          >
            How It Works
          </motion.h2>

          <div className="flex flex-col gap-4">
            {[
              {
                step: "01",
                icon: <Swords size={20} className="text-accent" />,
                title: "Pick Your Genre",
                desc: "Choose from Fantasy, Sci-Fi, Horror, Mystery, or Romance to flavor your story.",
              },
              {
                step: "02",
                icon: <MapPin size={20} className="text-accent" />,
                title: "Run Your Route",
                desc: "GPS tracks your path. Every real intersection triggers a new chapter narrated aloud.",
              },
              {
                step: "03",
                icon: <BookOpen size={20} className="text-accent" />,
                title: "Choose & Share",
                desc: "Pick directions that shape your story. Save and share your unique adventure.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.35 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/40"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">
                      {item.step}
                    </span>
                    <h3 className="font-display font-bold text-lg text-foreground">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-base text-muted-foreground leading-snug">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer Links ─────────────────────────────────────────── */}
      <section className="py-8 px-4 bg-muted/20 border-t border-border/40">
        <div className="max-w-screen-sm mx-auto flex flex-col gap-3">
          <Link
            to="/feed"
            search={{ my: false }}
            data-ocid="home-feed-link"
            className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-accent/40 hover:bg-accent/5 transition-all duration-200 group min-h-[64px]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
                <BookOpen size={18} className="text-accent" />
              </div>
              <div>
                <p className="font-display font-bold text-base text-foreground">
                  Adventure Feed
                </p>
                <p className="text-sm text-muted-foreground">
                  Browse stories from all runners
                </p>
              </div>
            </div>
            <ChevronRight
              size={18}
              className="text-muted-foreground group-hover:text-accent transition-colors"
            />
          </Link>

          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                to="/feed"
                search={{ my: true }}
                data-ocid="home-my-adventures-link"
                className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:border-accent/40 hover:bg-accent/5 transition-all duration-200 group min-h-[64px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
                    <User size={18} className="text-accent" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-base text-foreground">
                      My Adventures
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your saved runs and stories
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-muted-foreground group-hover:text-accent transition-colors"
                />
              </Link>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
