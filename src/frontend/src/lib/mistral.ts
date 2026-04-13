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
  currentStreet: string;
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
    currentStreet,
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
The story is told in second person ("you"). Every chapter must be exactly 150-200 words, immersive, and visceral.

CRITICAL IMMERSION RULE: The character is physically running THROUGH the current street right now.
Describe the street's sensory environment in vivid detail — the look and feel of "${currentStreet}", 
what surrounds it (buildings, trees, pavement, atmosphere), the ${direction}ward momentum of running.
Make the reader FEEL they are on this exact street. Weave in the street name naturally, not just as a label.
Then build to a cliffhanger at the next intersection where two paths diverge.

RESPONSE FORMAT (use this EXACT JSON structure, no other text):
{
  "chapterText": "<the full chapter text, 150-200 words, vividly describing ${currentStreet} heading ${direction}>",
  "choice1": {
    "streetName": "${streetName1}",
    "direction": "left",
    "choiceSummary": "<brief 1-sentence narrative consequence of turning onto ${streetName1}>"
  },
  "choice2": {
    "streetName": "${streetName2}",
    "direction": "right",
    "choiceSummary": "<brief 1-sentence narrative consequence of turning onto ${streetName2}>"
  }
}`;

  const userPrompt = `Chapter ${chapterNumber}: You are running ${direction} along ${currentStreet}.
Ahead, the road meets an intersection with ${streetName1} on one side and ${streetName2} on the other.
Genre: ${genre}. Vividly describe running along ${currentStreet} — its atmosphere, the feeling underfoot, what you see — then end at the intersection with a cliffhanger. 150-200 words.${historyContext}`;

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

/**
 * Fetch TTS audio and return a raw ArrayBuffer.
 * The caller (ActiveRun) uses Web Audio API (AudioContext.decodeAudioData)
 * for reliable playback on iOS Safari & Android Chrome.
 */
export async function generateTTS(text: string): Promise<string> {
  // Trim text to reasonable length for TTS (API limits)
  const trimmed = text;

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
    const errText = await response.text();
    throw new Error(`TTS API error: ${response.status} ${errText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  console.log(
    `[TTS] arrayBuffer received — size: ${arrayBuffer.byteLength} bytes`,
  );

  if (arrayBuffer.byteLength === 0) {
    throw new Error("TTS returned empty audio buffer");
  }
var url = URL.createObjectURL(new Blob([arrayBuffer], {type: "audio/mp3"}))
  return url;
}
