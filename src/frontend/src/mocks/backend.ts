import type { backendInterface, Run } from "../backend";

const sampleRun1: Run = {
  id: BigInt(1),
  startTime: BigInt(Date.now() - 3600000),
  endTime: BigInt(Date.now() - 1800000),
  userId: { toText: () => "aaaaa-bbbbb" } as any,
  slug: "the-shadow-of-maplewood",
  title: "The Shadow of Maplewood",
  genre: "Fantasy",
  chapters: [
    {
      text: "You step onto Maplewood Avenue as dawn breaks. Ancient oaks line the path, their roots cracking the asphalt like forgotten magic. At the corner of Maplewood and Oak Street, a shimmer in the air catches your eye — the boundary between the mortal realm and something far older. The mist thickens. Which path calls to you?",
      direction: "North",
      streetName1: "Maplewood Avenue",
      streetName2: "Oak Street",
      choiceIndex: BigInt(0),
    },
    {
      text: "Turning onto Oak Street, you feel the ancient power surge beneath your feet. The old cathedral looms ahead, its stained glass casting rainbow shadows across the cobblestones at the junction with Elm Drive. A hooded figure beckons from the shadows. Your destiny awaits at this crossroads.",
      direction: "East",
      streetName1: "Oak Street",
      streetName2: "Elm Drive",
      choiceIndex: BigInt(1),
    },
  ],
  choices: ["Turn left onto Oak Street", "Continue down Elm Drive"],
  gpsRoute: [
    { lat: 51.505, lon: -0.09 },
    { lat: 51.506, lon: -0.091 },
    { lat: 51.507, lon: -0.092 },
  ],
  totalDistance: 3.14,
  userName: "RunnerAlex",
};

const sampleRun2: Run = {
  id: BigInt(2),
  startTime: BigInt(Date.now() - 86400000),
  endTime: BigInt(Date.now() - 82800000),
  userId: { toText: () => "ccccc-ddddd" } as any,
  slug: "neon-circuits-of-bay-street",
  title: "Neon Circuits of Bay Street",
  genre: "Sci-Fi",
  chapters: [
    {
      text: "The year is 2147. You jack into the augmented overlay running down Bay Street, neon holographics flickering in the rain. At the junction of Bay Street and Harbor Boulevard, a rogue AI signal pulses from a drainage grate. Your neural implant screams a warning. The quantum trail leads two ways — follow it?",
      direction: "South",
      streetName1: "Bay Street",
      streetName2: "Harbor Boulevard",
      choiceIndex: BigInt(0),
    },
  ],
  choices: ["Head toward Harbor Boulevard"],
  gpsRoute: [
    { lat: 43.644, lon: -79.386 },
    { lat: 43.645, lon: -79.387 },
  ],
  totalDistance: 5.72,
  userName: "CyberRunner",
};

const sampleRun3: Run = {
  id: BigInt(3),
  startTime: BigInt(Date.now() - 172800000),
  endTime: BigInt(Date.now() - 169200000),
  userId: { toText: () => "eeeee-fffff" } as any,
  slug: "whispers-on-crescent-lane",
  title: "Whispers on Crescent Lane",
  genre: "Horror",
  chapters: [
    {
      text: "Something watches from the shadows of Crescent Lane. The streetlights flicker as you cross the intersection with Burial Hill Road. Footsteps echo behind you — but when you turn, nothing is there. A cold wind carries a name... your name. The darkness splits at this crossroads. One path leads home. The other leads deeper into the night.",
      direction: "West",
      streetName1: "Crescent Lane",
      streetName2: "Burial Hill Road",
      choiceIndex: BigInt(0),
    },
  ],
  choices: ["Flee down Burial Hill Road"],
  gpsRoute: [
    { lat: 42.36, lon: -71.06 },
    { lat: 42.361, lon: -71.061 },
  ],
  totalDistance: 2.88,
  userName: "NightRunner",
};

export const mockBackend: backendInterface = {
  getAllRuns: async () => [sampleRun1, sampleRun2, sampleRun3],
  getMyRuns: async () => [sampleRun1],
  getRunBySlug: async (slug: string) => {
    if (slug === "the-shadow-of-maplewood") return sampleRun1;
    if (slug === "neon-circuits-of-bay-street") return sampleRun2;
    if (slug === "whispers-on-crescent-lane") return sampleRun3;
    return null;
  },
  getRunsByUser: async () => [sampleRun1],
  getUser: async () => "RunnerAlex",
  saveRun: async () => "the-shadow-of-maplewood",
  setUserName: async () => undefined,
};
