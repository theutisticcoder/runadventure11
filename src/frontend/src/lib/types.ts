export type Genre = "Fantasy" | "SciFi" | "Horror" | "Mystery" | "Romance";

export interface GpsCoord {
  lat: number;
  lon: number;
}

export interface RunChoice {
  streetName: string;
  direction: string;
  choiceSummary: string;
}

export interface Chapter {
  text: string;
  streetName1: string;
  streetName2: string;
  direction: string;
  choiceIndex: number;
}

export interface Run {
  id: bigint;
  slug: string;
  title: string;
  genre: string;
  chapters: Chapter[];
  choices: string[];
  gpsRoute: GpsCoord[];
  startTime: bigint;
  endTime: bigint;
  totalDistance: number;
  userId: string;
  userName?: string;
}

export type RunStatus = "idle" | "active" | "paused" | "ended";

export interface NominatimResult {
  street: string;
  nearbyStreets: string[];
}

export interface ChapterResult {
  chapterText: string;
  choice1: RunChoice;
  choice2: RunChoice;
}

export const GENRE_COLORS: Record<Genre, string> = {
  Fantasy: "text-amber-400",
  SciFi: "text-cyan-400",
  Horror: "text-red-500",
  Mystery: "text-purple-400",
  Romance: "text-rose-400",
};

export const GENRE_BG_COLORS: Record<Genre, string> = {
  Fantasy: "bg-amber-400/10 border-amber-400/30",
  SciFi: "bg-cyan-400/10 border-cyan-400/30",
  Horror: "bg-red-500/10 border-red-500/30",
  Mystery: "bg-purple-400/10 border-purple-400/30",
  Romance: "bg-rose-400/10 border-rose-400/30",
};

export const GENRE_GLOW: Record<Genre, string> = {
  Fantasy: "shadow-[0_0_20px_rgba(251,191,36,0.3)]",
  SciFi: "shadow-[0_0_20px_rgba(34,211,238,0.3)]",
  Horror: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
  Mystery: "shadow-[0_0_20px_rgba(167,139,250,0.3)]",
  Romance: "shadow-[0_0_20px_rgba(251,113,133,0.3)]",
};

export const GENRE_BUTTON_COLORS: Record<Genre, string> = {
  Fantasy: "bg-amber-400 hover:bg-amber-300 text-black",
  SciFi: "bg-cyan-400 hover:bg-cyan-300 text-black",
  Horror: "bg-red-600 hover:bg-red-500 text-white",
  Mystery: "bg-purple-500 hover:bg-purple-400 text-white",
  Romance: "bg-rose-500 hover:bg-rose-400 text-white",
};
