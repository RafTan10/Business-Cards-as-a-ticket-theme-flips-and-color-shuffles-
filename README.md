# Rafid Tanim — Ticket Business Card

A one-page personal reach-out card styled as an animated admission ticket. The front introduces me (CSE student at BRAC University, Batch '28). Click or tap the ticket and it flips over to show my contact links.

## How it was made

This is a concept project: I wanted to see whether a business card could feel like an event ticket you get handed, something you can flip over, play with and remember, rather than a flat list of links.

- **The idea and design are mine.** The ticket concept, the flip to a "reach out" side, the colour shuffle, the typing role line, the barcode stub, the jersey-number **10**, the printing intro and the overall look all came from my own ideas. I chose, reviewed and adjusted each one until the card felt right.
- **Base components from [21st.dev](https://21st.dev).** The animated ticket (`admit-one-ticket`: shape, tilt, dithered shader texture, colour remix) comes from 21st.dev and was extended to add the flip, the back face, the typewriter and the barcode.
- **The laser beams were built from zero by AI.** The 21st.dev "Laser Focus" source wasn't available, so the AI wrote the laser background (`src/components/card/laser-field.tsx`) completely from scratch: a small WebGL1 shader with warm beams fanning from the top and a flare. It has no dependencies, takes its colour from the card (so it follows Shuffle) and is tuned for phones.

What I'm aiming for: a personal card that shows who I am (CSE student, data science, web development, football and creative work) in a way that's fun to open and easy to share.

## What the card does

- **Ticket front**: name, university, department and batch, plus a typing line that cycles through what I do: Data Science, Web Development, Football Analytics, Business Analytics, Online Business, Clothing, Sports, YouTube and Voiceover.
- **Flip to the back**: Instagram, Facebook and GitHub buttons, my Gmail with a one-click Copy button, and a big faded **10** (my jersey number) in the background.
- **Shuffle**: the dice button (or the `R` key) remixes the ticket's colours and pattern (orange, blue or purple) and plays a little camera-shutter click. Text colour adjusts automatically so it stays readable.
- **Printing intro**: on load the ticket slides up out of a "printer slot".
- **3D tilt and glare**: the card tilts toward the mouse with a light reflection that follows the cursor (desktop).
- **Stub details**: vertical "Student" text, a faded '28, and a decorative barcode generated from text (no student ID anywhere).
- **Works on phones**: the card resizes to the screen and small text scales up so it stays readable.
- **Accessible**: respects "reduce motion" settings, keyboard shortcuts (`F` flip, `R` shuffle), screen-reader labels, and a CSS fallback if WebGL isn't available.

## Built with

| Part | What's used |
|---|---|
| Framework | React 19 + TypeScript, bundled with Vite |
| Styling | Tailwind CSS v4, shadcn/ui project structure (`components/ui`) |
| Base component | [`admit-one-ticket`](https://21st.dev) from 21st.dev: ticket shape, tilt, colour remix and shutter sound |
| Animated texture | WebGL2 dithering shader (Paper Shaders), included in the component, no extra package |
| Laser background | Custom WebGL1 shader written from scratch by AI (`laser-field.tsx`), no package |
| Fonts | Bricolage Grotesque (name) and JetBrains Mono (labels), bundled with `@fontsource` |
| Icons | lucide-react plus inline SVG brand icons |
| Effects | CSS 3D transforms for the flip, `clip-path` for the ticket shape, SVG noise for the film grain |

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
SINGLE=1 npm run build   # everything inlined into one HTML file
```

## Change the content

All text and links live in [`src/lib/card-data.ts`](src/lib/card-data.ts). Edit that file and the card updates; no component code needs to change.

## Project layout

```
src/
  App.tsx                     page: background glow, grain, the card
  lib/card-data.ts            name, roles, links, email
  lib/ticket-style.ts         colours + shuffle logic
  components/card/            reach-card (tilt, flip, shuffle), front/back faces,
                              typewriter, barcode, icons
  components/ui/              admit-one-ticket (base component), shadcn button
```
