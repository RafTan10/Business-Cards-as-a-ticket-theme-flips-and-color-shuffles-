# CLAUDE.md — Rafid Tanim · Ticket Business Card

A one-page website that shows a personal "reach-out card" for **Rafid Tanim**, styled as an animated admission ticket (based on the 21st.dev `admit-one-ticket` component). The front introduces Rafid; clicking flips it to a back side with social links.

Read this whole file before writing code. If something here conflicts with a request in chat, ask.

---

## 1. Content (single source of truth)

All personal content lives in **`src/lib/card-data.ts`**. Components must read from it — never hard-code personal text inside components.

```ts
// src/lib/card-data.ts (abridged — the file is the source of truth)
export const CARD = {
  name: "Rafid Tanim",
  university: "BRAC University",
  department: "CSE Department",
  batch: "Batch '28",
  watermark: "'28",
  stubText: "Student",
  backNumber: "10",              // big faded jersey number behind the back side
  roles: [                       // front typewriter line, cycles one at a time
    "CSE Student", "Data Science", "Web Development", "Football Analytics",
    "Business Analytics", "Online Business", "Clothing", "Sports",
    "YouTube Creator", "Voiceover Artist",
  ],
  chips: ["Student", "Data Science", "Web Development"], // back side chips
  links: {
    instagram: "https://www.instagram.com/rafid__tanim/",
    facebook: "https://www.facebook.com/rafid.tanim/",
    github: "https://github.com/RafTan10",
  },
  email: "rafidtanim10@gmail.com",
} as const;
```

Rules:
- **Do NOT show the student ID anywhere** (not in text, barcode, metadata or alt text).
- Do not invent handles. All links are real now (Instagram added 2026-10-05).

---

## 2. Tech stack & setup

- **Vite + React 19** + **TypeScript** + **Tailwind CSS v4** + **shadcn/ui** structure (switched from Next.js: it's a single static page, and Vite can also build a one-file preview).
- No extra npm packages are needed for the ticket. The WebGL shader code is bundled inside the component.
- The project lives in the subfolder **`rafid-card/`** inside `E:\Business Card`. `create-next-app` rejects folder names with spaces or capital letters, and this CLAUDE.md stays in the parent folder.

**Status: already scaffolded and built.** To run it locally:

```bash
cd rafid-card
npm install
npm run dev        # http://localhost:5173
npm run build      # production build -> dist/
SINGLE=1 npm run build   # one self-contained HTML file (for previews)
```

Paths:
- UI components → `src/components/ui/` (shadcn convention; `@/` = `src/`).
- Card-specific components → `src/components/card/` (`reach-card.tsx` is the entry; `front-face`, `back-face`, `ticket-face`, `barcode`, `typewriter`, `icons`, and `shader.ts` = typed facade over the vendored component).
- Personal content → `src/lib/card-data.ts`; colours/shuffle → `src/lib/ticket-style.ts`.
- Global styles/animations → `src/index.css`. Fonts come from `@fontsource` packages (bundled, no network).

---

## 3. The base component: `components/ui/admit-one-ticket.tsx`

Rafid will paste the 21st.dev source into this file. Fix these before using it:

1. **Broken string:** in `TicketCard`, the label `children: [presenter, "\n", event]` got split by a real line break during copy-paste. Restore it to `"\n"`.
2. **TypeScript:** the source is compiled JS with no types. First pass: add `// @ts-nocheck` at the top so it compiles. Later (optional): add proper prop types (`TicketCardProps`, `TicketTexture`, etc.) and remove the directive.
3. **WebGL2 fallback:** `ShaderMount` throws if WebGL2 is unavailable. Catch the error and render a static CSS radial gradient using `TICKET_GRADIENT` colours instead of crashing.
4. Keep `"use client"` at the top.

Prefer **wrapping/extending** the base component from `components/card/` over editing its internals. Only edit internals when it's needed (e.g. exposing a slot for the typewriter line or the barcode).

---

## 4. Features to build (agreed)

### 4.1 Front side: ticket mapping
| Ticket slot | Content |
|---|---|
| `presenter` (top line 1) | `BRAC University` |
| `event` (top line 2) | `CSE Department` |
| `name` | `RAFID TANIM` (auto-uppercased, auto-fit) |
| Typewriter line (new, see 4.2) | Cycles through `roles` |
| Footer (`venue · dates`) | `Batch '28` · `Dhaka` (or just batch if it looks cleaner) |
| `stubText` | `Student` |
| `watermark` | `'28` |

### 4.2 Typewriter role line (idea 2)
- A single line under the name: `> ` + text that types out, pauses ~1.4s, deletes, then types the next item of `CARD.roles`, looping. Blinking caret.
- Monospace font, same ink colour as other text, sized like the footer.
- Move the name block up / reduce name max size as needed so the name, typewriter and footer never overlap at any width.
- `prefers-reduced-motion`: show the roles statically joined with ` · `.
- Screen readers: put the full list in an `sr-only` span and mark the animated text `aria-hidden`.

### 4.3 Flip card (front ↔ back)
- Clicking/tapping the card flips it 180° on the Y axis (~700ms, `cubic-bezier(0.22,1,0.36,1)`). Also a small "Flip ↻" hint label under the card.
- Keyboard: the card is a `button`-like element (`role="button"`, `tabIndex=0`, `aria-pressed`); Enter/Space flips.
- **Structure matters** because `clip-path` flattens 3D transforms:
  `TiltCard` → flip container (`transform-style: preserve-3d`, no clip-path) → **Front face** and **Back face**, each `position:absolute`, `backface-visibility:hidden`, each with its **own** ticket `clip-path`. The back face is pre-rotated `rotateY(180deg)`.
- Only the visible face's shader animates (set the hidden face's shader `speed` to 0) to save GPU.
- **Back side content** (same ticket shape and perforation, darker/inverted version of the front palette for contrast):
  - Small label: `Reach out` / `Find me online`
  - Clickable links with icons: **Instagram**, **Facebook**, **GitHub** → `target="_blank" rel="noopener noreferrer"`. Clicking a link must **not** flip the card (`stopPropagation`).
  - **Gmail:** shows the address as text with a small "Copy" button (copies to clipboard and shows "Copied!" for 1.5s). The address itself is not a link.
  - Role chips: `Student` · `Data Science` · `Web Development`.
  - Stub on back: vertical text `Say hi`.
- Icons: inline SVGs (or `lucide-react`, which comes with shadcn). Minimum tap target 40×40px.

### 4.4 Barcode on the stub (idea 3)
- A decorative vertical barcode strip on the front stub (near the right edge, beside the stub text), plus a tiny serial like `No. BRACU-CSE-28`.
- Generate bars deterministically from a string (e.g. hash of `"RAFID TANIM · CSE · 28"`) as an inline SVG. Same string, same bars, every render. **Never encode the student ID.**
- Bars use the ink colour at ~70% opacity so they sit inside the texture.

### 4.5 Shuffle style (idea 4)
- A small round "🎲 / shuffle" icon button placed just under the card (not on it). Clicking calls `remixTicketStyle(prev)` and `playShutterSound()`.
- Keyboard shortcut: `R` (ignore when focus is in an input).
- Extend the remix to allow a wider hue range than orange (8–44). Add a `HUE_RANGES` option in `lib/card-data.ts`, default `[[8, 44], [190, 230], [260, 300]]` (orange, blue, purple). Text/ink colour must stay readable: pick a dark ink for light backgrounds and a light ink for dark ones (check contrast ≥ 4.5:1 against the average background colour).
- Apply the same remix to both faces (back uses the darker variant).

### 4.6 "Printing" entrance animation (idea 5)
- On page load the ticket slides up out of a thin dark "printer slot" line, revealed via a `clip-path`/mask, ~1.1s, slight overshoot, then the tilt becomes active.
- Page background: near-black warm brown (`#1c140e`-ish, matching the demo's `#281d14`) with a subtle animated film-grain overlay (CSS/SVG noise, low opacity) and a soft radial glow behind the card.
- `prefers-reduced-motion`: no slide, just a 200ms fade.

### 4.7 Responsive / phone support (idea 7)
- The card width is **not** fixed. Measure the wrapper with a `ResizeObserver` and set `width = clamp(300, containerWidth - 32, 741)`. All internal sizes already scale from `width`.
- Below ~480px wide, bump label/footer/typewriter sizes by ~1.25× so they stay ≥ 11px.
- Touch devices (`(hover: none)`): disable pointer-tilt; tap flips. Optional: gentle tilt from `deviceorientation` (on iOS only after a user gesture grants permission; skip silently if denied).
- No horizontal scroll at 320px wide. Test at 360, 390, 768, 1280.

### 4.8 Typography (idea 8)
- Name: **Bricolage Grotesque** (700), tight tracking.
- Labels, footer, typewriter, barcode serial: **JetBrains Mono** (500), uppercase, slight letter-spacing.
- Bundled via `@fontsource` (Bricolage uses the `standard.css` axes so the name gets the display optical size), exposed as `font-display` / `font-mono` Tailwind utilities.

### Not doing
- ~~Idea 1~~: replaced by the flip in 4.3.
- ~~Idea 6~~: no Download PNG / Save contact / Copy link buttons under the card.

---

## 5. Page

- `src/App.tsx` renders only the centred card plus the shuffle button and the flip hint. No nav, no footer clutter.
- Metadata: title `Rafid Tanim — CSE @ BRAC University`, description mentions Data Science & Web Development. Add an Open Graph image later (optional).

---

## 6. Quality bar

- `npm run build` and `npm run lint` must pass with no errors before saying a step is done.
- No console errors or warnings in the browser.
- Respect `prefers-reduced-motion` everywhere (shader speed 0, no typewriter, no printing slide, no tilt).
- All interactive elements are reachable by keyboard with visible focus rings.
- Keep commits small and descriptive, one feature per commit.

## 7. Suggested build order

1. Setup (section 2) → paste & fix base component (section 3) → render the demo with Rafid's data.
2. `lib/card-data.ts` + front mapping (4.1) + fonts (4.8).
3. Responsive sizing (4.7).
4. Typewriter line (4.2).
5. Flip + back side (4.3).
6. Barcode (4.4).
7. Shuffle (4.5).
8. Printing entrance + background (4.6).
9. Polish, accessibility pass, deploy to Vercel.

## 8. Status log

- v1 built in Cowork: all features in section 4 done (except optional device-orientation tilt). Keys: F = flip, R = shuffle.
- v2: real Facebook, GitHub and Gmail added; typewriter now cycles 10 roles (football/business analytics, online business, clothing, sports, YouTube, voiceover); back chips stay at 3 (`chips`); big faded "10" jersey number behind the back side. Reduced-motion typewriter swaps words every 2.6s instead of typing.
- Decided NOT to do: footer "Striker", grouped skill chips, YouTube/voiceover buttons, football player tag on the stub.
- v3 (Admit-one stamp + Gate/Seat block, BRACU and '28 removed) was tried and **reverted** at Rafid's request. The live card is v2.
- Experimental trials added (see section 9).
- v4: **Big name adopted** as the live layout (`DEFAULT_OPTIONS = { nameLayout: "poster" }` in `src/lib/trials.ts`). The old small-name layout stays as the "Old layout" trial. On phones the name now starts below the (larger) labels.
- v5: **Laser background adopted** (`DEFAULT_OPTIONS = { nameLayout: "poster", laser: true }`). `src/components/card/laser-field.tsx` is our own zero-dependency WebGL1 version of 21st.dev "Laser Focus" (its source is locked): 7 warm beams fanning from the top centre + a flare, tinted by the card hue (follows Shuffle), replaces the radial glow, fades in 1.3s after load. Phone tuning: 0.6x render resolution (0.7x desktop), 30fps cap on phones, pauses when the tab is hidden, one still frame for reduced motion, CSS glow fallback without WebGL. The old glow stays as the "Soft glow" trial.
- v6: real Instagram link added (rafid__tanim). All contact links are now real.
- Next: Rafid will upload the repo to GitHub himself (session can't push: repo not in its sources).

## 9. Design trials (experiments, not live)

- Defined in `src/lib/trials.ts` (`TRIALS`): Current card (big name + laser), Soft glow, Floodlight, Riso print, Analyst's sheet, On air, Old layout.
- Each trial = a `CardStyle` + `TrialOptions` (`nameLayout: "poster"`, `misregister` colour, `grid`, `meter`, `laser`).
- They never change the main card. Open one with `?trial=<id>` or `#trial-<id>`; `?trials` shows the switcher.
  `VITE_TRIALS=1 SINGLE=1 npm run build` makes the one-file trials preview.
- `?face=back` opens any version on the back side (used by screenshots).
- To adopt a trial: copy its style into `DEFAULT_STYLE` (`src/lib/ticket-style.ts`) and its options into the defaults, then remove the rest only if Rafid asks.

## Screenshot & feedback loop
Tool: scripts/screenshot.mjs (Playwright). `npm run shots` [--label x] [/page] [--mobile|--desktop] [--sections].
Pages: card front/back plus every trial front/back. `--sections` saves the card itself (`[data-shot]`).
Output: screenshots/NNN-label/ (never overwritten, git-ignored). Dev server must be running at http://localhost:5173.
First time on Windows: `npm install` then `npx playwright install chromium`.
Feedback: the owner saves marked-up screenshots (+ optional notes.md) to screenshots/feedback/. When asked to apply it:
list your interpretation, edit, re-shoot and compare (at least 2 rounds), report done/not done with paths, move files to feedback/done/.
After any visual change, shoot the page (desktop + mobile, --sections) and check it before saying it's done.
Never start a second dev server or screenshot file:///.
