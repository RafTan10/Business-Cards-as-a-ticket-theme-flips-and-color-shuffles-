/**
 * Experimental design trials.
 *
 * These are opt-in variants of the card for Rafid to look at and approve (or not).
 * The main card is never affected: a trial only shows when the page is opened with
 * `?trial=<id>` (or `#trial-<id>`), or in the trials preview build (VITE_TRIALS=1).
 * To adopt a trial later, copy its style/options into the defaults.
 */
import { hslToHex } from "@/components/card/shader"
import { DEFAULT_STYLE, type CardStyle } from "@/lib/ticket-style"

export interface TrialOptions {
  /** "classic" = current layout, "poster" = name set huge across the whole main area */
  nameLayout?: "classic" | "poster"
  /** colour of a second, slightly offset print of the name (risograph misregistration) */
  misregister?: string
  /** faint graph-paper grid over the front */
  grid?: boolean
  /** barcode bars move like an audio level meter while the role line types */
  meter?: boolean
  /** page background: laser beams shining down from the top (replaces the soft glow) */
  laser?: boolean
}

/** Options the live card uses (Big name + Laser background adopted on 2026-10-05). */
export const DEFAULT_OPTIONS: TrialOptions = { nameLayout: "poster", laser: true }

export interface Trial {
  id: string
  title: string
  /** one sentence: what the trial tries and why */
  idea: string
  style: CardStyle
  options: TrialOptions
}

export const TRIALS: Trial[] = [
  {
    id: "current",
    title: "Current card",
    idea: "The live card as it is now (big name + laser beams), for comparison.",
    style: DEFAULT_STYLE,
    options: DEFAULT_OPTIONS,
  },
  {
    id: "glow",
    title: "Soft glow",
    idea: "The previous background: a soft glow behind the card instead of the laser beams, kept for comparison.",
    style: DEFAULT_STYLE,
    options: { ...DEFAULT_OPTIONS, laser: false },
  },
  {
    id: "floodlight",
    title: "Floodlight",
    idea: "A night match: pitch-green ticket, chalk-white text, and the texture flickers like stadium lights. Football without adding any words.",
    style: {
      hue: 145,
      front: {
        colorBack: "#123d2b",
        colorFront: "#3c8f5c",
        shape: "dots",
        type: "4x4",
        size: 2,
        scale: 1.6,
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
        speed: 0.35,
      },
      back: {
        colorBack: "#08160f",
        colorFront: "#1e4a32",
        shape: "dots",
        type: "4x4",
        size: 2,
        scale: 1.6,
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
        speed: 0.25,
      },
      ink: "#f1f5ea",
      watermark: "#8fd4a4",
      backInk: "#e6f2dc",
    },
    options: DEFAULT_OPTIONS,
  },
  {
    id: "riso",
    title: "Riso print",
    idea: "Two-colour risograph poster: fluoro pink paper, blue ink, and the name printed twice slightly out of line. Nods to clothing and creator work.",
    style: {
      hue: 330,
      front: {
        colorBack: "#ff6fae",
        colorFront: "#ffc4de",
        shape: "simplex",
        type: "2x2",
        size: 3,
        scale: 1,
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
        speed: 0.3,
      },
      back: {
        colorBack: "#1a2a86",
        colorFront: "#3550d4",
        shape: "simplex",
        type: "2x2",
        size: 3,
        scale: 1,
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
        speed: 0.2,
      },
      ink: "#1b37b0",
      watermark: "#ffe1ee",
      backInk: "#ffc9e1",
    },
    options: { ...DEFAULT_OPTIONS, misregister: "#ff2d6f" },
  },
  {
    id: "analyst",
    title: "Analyst's sheet",
    idea: "Data-science look: cool grey graph paper with a faint grid and navy ink, like a printed chart. The texture is a slow, quiet wave.",
    style: {
      hue: 205,
      front: {
        colorBack: "#dfe7ec",
        colorFront: "#c3d2dc",
        shape: "wave",
        type: "8x8",
        size: 1.5,
        scale: 1.2,
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
        speed: 0.2,
      },
      back: {
        colorBack: "#0f2340",
        colorFront: "#1d3c66",
        shape: "wave",
        type: "8x8",
        size: 1.5,
        scale: 1.2,
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
        speed: 0.15,
      },
      ink: "#0f2340",
      watermark: "#f4f8fa",
      backInk: "#dfe7ec",
    },
    options: { ...DEFAULT_OPTIONS, grid: true },
  },
  {
    id: "on-air",
    title: "On air",
    idea: "For the voiceover side: an on-air red ticket with sound-wave ripples, and the barcode bounces like a level meter while the role line types.",
    style: {
      hue: 8,
      front: {
        colorBack: "#d83a20",
        colorFront: "#ff9a6b",
        shape: "ripple",
        type: "4x4",
        size: 2,
        scale: 0.45,
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
        speed: 0.45,
      },
      back: {
        colorBack: "#2a0c07",
        colorFront: "#6e2414",
        shape: "ripple",
        type: "4x4",
        size: 2,
        scale: 0.45,
        rotation: 0,
        offsetX: 0,
        offsetY: 0,
        speed: 0.3,
      },
      ink: "#2b0d06",
      watermark: hslToHex(14, 95, 88),
      backInk: "#ffd2bf",
    },
    options: { ...DEFAULT_OPTIONS, meter: true },
  },
  {
    id: "classic",
    title: "Old layout",
    idea: "The previous layout with the smaller name, kept for comparison.",
    style: DEFAULT_STYLE,
    options: { nameLayout: "classic" },
  },
]

export function findTrial(id: string | null | undefined) {
  return TRIALS.find((t) => t.id === id)
}
