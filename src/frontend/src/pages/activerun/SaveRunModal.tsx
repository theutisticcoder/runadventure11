import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ExternalLink, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import type { useRun } from "../../hooks/useRun";

type UseRunReturn = ReturnType<typeof useRun>;

interface SaveRunModalProps {
  run: UseRunReturn;
  isSaving: boolean;
  saveSlug: string | null;
  onSave: (title: string) => Promise<void>;
  onDiscard: () => void;
}

function generateTitle(genre: string | null, chapterCount: number): string {
  const prefixes: Record<string, string[]> = {
    Fantasy: [
      "The Dragon's Path",
      "Quest of the Ancient Roads",
      "The Runecrossing",
    ],
    SciFi: ["Sector Zero Run", "Neon Circuit Marathon", "The Hyperline"],
    Horror: ["The Midnight Crossing", "Shadows on the Trail", "The Dark Mile"],
    Mystery: ["The Street Cipher", "Trail of Shadows", "The Unknown Route"],
    Romance: ["Hearts in Motion", "The Running Encounter", "Paths That Cross"],
  };
  const g = genre ?? "Fantasy";
  const list = prefixes[g] ?? prefixes.Fantasy;
  const base = list[chapterCount % list.length];
  return `${base} — ${chapterCount} Chapter${chapterCount !== 1 ? "s" : ""}`;
}

export default function SaveRunModal({
  run,
  isSaving,
  saveSlug,
  onSave,
  onDiscard,
}: SaveRunModalProps) {
  const [title, setTitle] = useState(() =>
    generateTitle(run.genre, run.chapters.length),
  );

  const distKm = (run.distance / 1000).toFixed(2);
  const mins = Math.floor(run.elapsedSeconds / 60);
  const secs = run.elapsedSeconds % 60;
  const timeStr = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-4 py-10 bg-background"
      data-ocid="save-run-screen"
    >
      <div className="max-w-md w-full flex flex-col gap-5">
        <div className="text-center">
          <BookOpen size={36} className="text-accent mx-auto mb-3" />
          <h2 className="font-display font-bold text-2xl text-foreground">
            Adventure Complete!
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {run.chapters.length} chapters · {distKm} km · {timeStr}
          </p>
        </div>

        {/* Title input */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="run-title"
            className="text-sm font-semibold text-foreground"
          >
            Adventure Title
          </label>
          <input
            id="run-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-foreground text-base font-display focus:outline-none focus:ring-2 focus:ring-accent/50 min-h-[44px]"
            data-ocid="run-title-input"
            disabled={isSaving}
          />
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Distance", value: `${distKm} km` },
            { label: "Duration", value: timeStr },
            { label: "Chapters", value: String(run.chapters.length) },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-card border border-border/40 rounded-lg p-3 text-center"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
                {s.label}
              </p>
              <p className="font-display font-bold text-lg text-foreground">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Actions */}
        {isSaving ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              onClick={() => onSave(title)}
              disabled={!title.trim()}
              data-ocid="save-run-btn"
              className="min-h-[52px] font-bold gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Save size={18} />
              Save &amp; View Story
            </Button>
            {saveSlug && (
              <Button
                variant="outline"
                size="lg"
                data-ocid="view-story-btn"
                className="min-h-[52px] gap-2"
                onClick={() => onDiscard()}
              >
                <ExternalLink size={18} />
                View Shared Story
              </Button>
            )}
            <Button
              variant="ghost"
              size="lg"
              onClick={onDiscard}
              data-ocid="discard-run-btn"
              className="min-h-[52px] gap-2 text-muted-foreground hover:text-destructive"
            >
              <Trash2 size={18} />
              Discard Run
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
