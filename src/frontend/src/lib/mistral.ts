import type { ChapterResult, Genre, RunChoice } from "./types";

const MISTRAL_API_KEY = "nrayQwviJ8l6nyTdq5mTweYgrgnrz6DZ";
const CHAT_URL = "https://api.mistral.ai/v1/chat/completions";
const TTS_URL = "https://api.mistral.ai/v1/audio/speech";

const GENRE_PROMPTS: Record<Genre, string> = {
  Fantasy:
    "high fantasy with magic, dragons, ancient ruins, mystical creatures, and epic quests",
  SciFi:
    "science fiction with alien contact, advanced technology, space exploration references, and cyberpunk undertones",
  Horror:
    "atmospheric horror with creeping dread, shadowy monsters, unsettling omens, and psychological tension",
  Mystery:
    "noir mystery with hidden clues, suspicious characters, secret organizations, and detective intrigue",
  Romance:
    "romantic adventure with chance encounters, emotional tension, heartfelt moments, and passionate decisions",
};

interface GenerateChapterParams {
  streetName1: string;
  streetName2: string;
  direction: string;
  genre: Genre;
  storyHistory: string[];
  chapterNumber: number;
}

export async function generateChapter(
  params: GenerateChapterParams,
): Promise<ChapterResult> {
  const {
    streetName1,
    streetName2,
    direction,
    genre,
    storyHistory,
    chapterNumber,
  } = params;

  const historyContext =
    storyHistory.length > 0
      ? `\n\nSTORY SO FAR:\n${storyHistory.slice(-3).join("\n\n---\n\n")}`
      : "";

  const systemPrompt = `You are a master storyteller creating a ${GENRE_PROMPTS[genre]} story for a runner. 
The story is told in second person ("you"). Every chapter must be minimum 500 words, immersive, and visceral.
Always weave the real street names and direction of travel naturally into the narrative.
End every chapter with a cliffhanger that presents exactly two choices tied to the two streets.

RESPONSE FORMAT (use this EXACT JSON structure, no other text):
{
  "chapterText": "<the full chapter text, minimum 500 words>",
  "choice1": {
    "streetName": "${streetName1}",
    "direction": "left",
    "choiceSummary": "<brief 1-sentence narrative consequence of going this way>"
  },
  "choice2": {
    "streetName": "${streetName2}",
    "direction": "right",
    "choiceSummary": "<brief 1-sentence narrative consequence of going this way>"
  }
}`;

  const userPrompt = `Chapter ${chapterNumber}: The runner is heading ${direction} and reaches the intersection of ${streetName1} and ${streetName2}.
Write this chapter in the ${genre} genre. Reference the exact street names. Minimum 500 words.
${historyContext}`;

  const response = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: "mistral-large-latest",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.85,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Mistral API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content ?? "{}";

  interface RawChapterResponse {
    chapterText?: string;
    choice1?: Partial<RunChoice>;
    choice2?: Partial<RunChoice>;
  }

  let parsed: RawChapterResponse;
  try {
    parsed = JSON.parse(raw) as RawChapterResponse;
  } catch {
    // Fallback: extract text if JSON parse fails
    parsed = {
      chapterText: raw,
      choice1: {
        streetName: streetName1,
        direction: "left",
        choiceSummary: `Head left onto ${streetName1}.`,
      },
      choice2: {
        streetName: streetName2,
        direction: "right",
        choiceSummary: `Turn right onto ${streetName2}.`,
      },
    };
  }

  const chapterText = parsed.chapterText ?? raw;
  const choice1: RunChoice = {
    streetName: parsed.choice1?.streetName ?? streetName1,
    direction: parsed.choice1?.direction ?? "left",
    choiceSummary:
      parsed.choice1?.choiceSummary ?? `Continue onto ${streetName1}`,
  };
  const choice2: RunChoice = {
    streetName: parsed.choice2?.streetName ?? streetName2,
    direction: parsed.choice2?.direction ?? "right",
    choiceSummary: parsed.choice2?.choiceSummary ?? `Turn onto ${streetName2}`,
  };

  return { chapterText, choice1, choice2 };
}

export async function generateTTS(text: string): Promise<Blob> {
  // Trim text to reasonable length for TTS (API limits)
  const trimmed = text.length > 4000 ? `${text.slice(0, 4000)}...` : text;

  const response = await fetch(TTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: "voxtral-mini-tts-2603",
      voice: "en_paul_neutral",
      input: trimmed,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`TTS API error: ${response.status} ${err}`);
  }

  return response.blob();
}
