# RunQuest Adventure — Design Brief

## Tone & Aesthetic
Epic adventure quest. Bold, commanding, immersive. Dark brutalist minimalism optimized for outdoor sunlight readability.

## Differentiation
Genre-specific accent colors that dynamically shift UI mood. Fantasy (amber), Sci-Fi (cyan), Horror (crimson), Mystery (purple), Romance (rose). Every screen inherits genre color through accent tokens.

## Color Palette (OKLCH)
| Role | Light | Dark | Usage |
| --- | --- | --- | --- |
| Background | N/A | 0.12 0 0 | App background |
| Card | N/A | 0.18 0 0 | Story chapters, choice cards |
| Foreground | N/A | 0.96 0 0 | Text, high contrast |
| Muted BG | N/A | 0.25 0 0 | Secondary sections |
| Muted Text | N/A | 0.6 0 0 | Hint text, metadata |
| Primary (Sci-Fi default) | N/A | 0.72 0.24 200 | Buttons, highlights |
| Accent (Fantasy default) | N/A | 0.75 0.22 60 | Borders, icons |
| Destructive | N/A | 0.65 0.27 20 | Error, end run |
| Border | N/A | 0.3 0 0 | Subtle dividers |
| Success | N/A | 0.68 0.25 150 | Saved, completed |

## Typography
| Tier | Font | Usage |
| --- | --- | --- |
| Display | Bricolage Grotesque (bold, geometric) | Headings, story titles, genre picker |
| Body | Plus Jakarta Sans (clear, outdoor-legible) | Story chapters, button text, metadata |
| Mono | JetBrains Mono | Location coordinates, debug info |

Type Scale: 16px (body), 18px (body-lg), 20px (display-sm), 24px (display-md), 32px (display-lg).

## Elevation & Depth
Dark card stack: background (0.12) → muted sections (0.25) → cards (0.18 with shadow) → surface elements. Shadows use dark overlays (20-50% opacity). No gradients; depth via layer stacking.

## Structural Zones
| Zone | Background | Treatment |
| --- | --- | --- |
| Header/Nav | 0.18 0 0 | Card with border-b, genre color accent |
| Live Map | 0.12 0 0 | Full-bleed container, rounded-sm border |
| Story Chapter | 0.18 0 0 | Card with padding, left accent stripe (genre color) |
| Choice Buttons | 0.25 0 0 → 0.18 0 0 (hover) | Sharp corners (rounded-sm), high contrast text |
| Footer | 0.12 0 0 | Bare or minimal divider |

## Spacing & Rhythm
Mobile-first: 16px base unit. Cards: 20px padding. Buttons: 16px padding vertical, 24px horizontal. Text line-height: 1.5. Between sections: 24px gap.

## Component Patterns
- **Story Chapter Card**: Card bg with left 4px accent stripe (genre color), heading + body text, TTS indicator (pulsing icon)
- **Choice Buttons**: 2-column grid (mobile stacked, md+ side-by-side), 44px+ tap target, genre accent on active
- **Genre Picker**: 5 equal columns, each with icon + name, tap to select
- **Live Map**: Leaflet container with sharp border, current position marker, trail overlay
- **Header**: Logo/title left, genre badge top-right with accent background
- **TTS Indicator**: Pulsing animated icon + "Listening..." text during playback

## Motion
- **Fade-in**: Chapter text on load (0.5s)
- **Pulse-subtle**: Muted elements, breathing effect (2s loop)
- **Glow-pulse**: Active choice button when audio playing (cyan glow on sci-fi, etc.)
- **No flicker**: Subtle, intentional motion only

## Constraints
- Mobile-first, min-width 320px responsive to 1280px+
- Dark mode only (always-on)
- AA+ contrast minimum (0.96 foreground on 0.12 background = 8.8:1)
- 44px tap targets for all interactive elements
- Text min 16px body, 20px headings for outdoor readability
- No parallax, no heavy animations—GPS tracking is real-time priority

## Signature Detail
Left accent stripe on story cards (genre color). Pulsing glow on active choice button during TTS playback. Genre color accent in header changes as user selects new genre.
