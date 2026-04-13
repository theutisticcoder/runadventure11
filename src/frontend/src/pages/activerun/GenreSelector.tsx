import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Swords } from "lucide-react";
import { useState } from "react";
import type { Genre } from "../../lib/types";
import {
  GENRE_BG_COLORS,
  GENRE_BUTTON_COLORS,
  GENRE_COLORS,
} from "../../lib/types";

const GENRES: Genre[] = ["Fantasy", "SciFi", "Horror", "Mystery", "Romance"];

const GENRE_ICONS: Record<Genre, string> = {
  Fantasy: "🐉",
  SciFi: "🚀",
  Horror: "💀",
  Mystery: "🔍",
  Romance: "💫",
};

const GENRE_DESC: Record<Genre, string> = {
  Fantasy: "Dragons, magic & ancient ruins",
  SciFi: "Aliens, tech & cyberpunk worlds",
  Horror: "Shadows, monsters & dread",
  Mystery: "Clues, secrets & noir intrigue",
  Romance: "Chance encounters & passion",
};

interface GenreSelectorProps {
  onStart: (genre: Genre) => void;
}

export default function GenreSelector({ onStart }: GenreSelectorProps) {
  const [selected, setSelected] = useState<Genre | null>(null);

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-4 py-10 bg-background"
      data-ocid="genre-select-screen"
    >
      <div className="max-w-md w-full flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-accent/15 border border-accent/30 flex items-center justify-center">
            <Swords size={32} className="text-accent" />
          </div>
          <h1 className="font-display font-bold text-3xl text-foreground tracking-tight">
            New Adventure
          </h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-xs mx-auto">
            Choose your story genre. Your tale begins at the first real
            intersection you cross.
          </p>
        </div>

        {/* Genre grid */}
        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3"
          data-ocid="genre-selector"
        >
          {GENRES.map((genre) => {
            const isSelected = selected === genre;
            return (
              <button
                key={genre}
                type="button"
                data-ocid={`genre-btn-${genre.toLowerCase()}`}
                onClick={() => setSelected(genre)}
                className={`rounded-xl border p-4 flex flex-col items-center gap-2 transition-smooth min-h-[110px] text-left ${
                  isSelected
                    ? `${GENRE_BG_COLORS[genre]} scale-105 ring-2 ring-offset-2 ring-offset-background`
                    : "bg-card border-border/40 hover:bg-muted/50"
                }`}
              >
                <span className="text-3xl">{GENRE_ICONS[genre]}</span>
                <span
                  className={`font-display font-bold text-sm ${isSelected ? GENRE_COLORS[genre] : "text-foreground"}`}
                >
                  {genre}
                </span>
                <span
                  className={`text-xs text-center leading-tight ${isSelected ? `${GENRE_COLORS[genre]} opacity-80` : "text-muted-foreground"}`}
                >
                  {GENRE_DESC[genre]}
                </span>
                {isSelected && (
                  <Badge
                    variant="secondary"
                    className={`text-xs mt-auto ${GENRE_BG_COLORS[genre]} ${GENRE_COLORS[genre]} border`}
                  >
                    Selected
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Start button */}
        <Button
          size="lg"
          disabled={!selected}
          onClick={() => selected && onStart(selected)}
          data-ocid="start-run-btn"
          className={`w-full min-h-[56px] text-base font-bold gap-2 transition-smooth ${
            selected ? GENRE_BUTTON_COLORS[selected] : ""
          }`}
        >
          <Play size={20} />
          {selected ? `Start ${selected} Adventure` : "Select a Genre First"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          GPS access required — enable location before starting.
        </p>
      </div>
    </div>
  );
}
