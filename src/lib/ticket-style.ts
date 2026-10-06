import { HUE_RANGES } from "@/lib/card-data"
import { SHAPES, TYPES, hslToHex, type DitheringShape, type DitheringType } from "@/components/card/shader"

export interface FaceTexture {
  colorBack: string
  colorFront: string
  shape: DitheringShape
  type: DitheringType
  size: number
  scale: number
  rotation: number
  offsetX: number
  offsetY: number
  speed: number
}

export interface CardStyle {
  hue: number
  front: FaceTexture
  back: FaceTexture
  /** text colour on the front */
  ink: string
  /** big faded number on the stub */
  watermark: string
  /** text colour on the back */
  backInk: string
}

// ---- colour helpers -------------------------------------------------------

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "")
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number]
}
function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
export function contrast(a: string, b: string) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}
function mix(a: string, b: string, t = 0.5) {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  return (
    "#" +
    ca
      .map((v, i) => Math.round((v * (1 - t) + cb[i] * t) * 255).toString(16).padStart(2, "0"))
      .join("")
  )
}

/** Pick dark or light ink — whichever reads better on the texture's average colour. */
function pickInk(hue: number, back: string, front: string) {
  const avg = mix(back, front, 0.4)
  const dark = hslToHex(hue, 60, 14)
  const light = hslToHex(hue, 90, 96)
  return contrast(dark, avg) >= contrast(light, avg) ? dark : light
}

function backFace(hue: number, base: Omit<FaceTexture, "colorBack" | "colorFront">): FaceTexture {
  return {
    ...base,
    colorBack: hslToHex(hue, 42, 11),
    colorFront: hslToHex(hue, 70, 27),
  }
}

// ---- default (orange, matches the original 21st.dev ticket) ---------------

const DEFAULT_HUE = 22
const defaultFront: FaceTexture = {
  colorBack: "#ef671c",
  colorFront: "#ffc691",
  shape: "warp",
  type: "random",
  size: 0.5,
  scale: 1,
  rotation: 0,
  offsetX: 0,
  offsetY: 0,
  speed: 0.4,
}

export const DEFAULT_STYLE: CardStyle = {
  hue: DEFAULT_HUE,
  front: defaultFront,
  back: backFace(DEFAULT_HUE, { ...defaultFront, size: 1, speed: 0.25 }),
  ink: "#5a3520",
  watermark: "#ffdcbe",
  backInk: hslToHex(DEFAULT_HUE + 8, 95, 86),
}

// ---- shuffle --------------------------------------------------------------

const between = (min: number, max: number) => min + Math.random() * (max - min)
const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)]

/** Like remixTicketStyle() from the base component, but across several hue ranges. */
export function remixStyle(): CardStyle {
  const [lo, hi] = pick(HUE_RANGES)
  const hue = between(lo, hi)
  const dark = hslToHex(hue, 88, between(48, 56))
  const light = hslToHex(hue + between(-6, 10), 92, between(76, 88))
  const swap = Math.random() < 0.5
  const front: FaceTexture = {
    colorBack: swap ? light : dark,
    colorFront: swap ? dark : light,
    shape: pick(SHAPES),
    type: pick(TYPES),
    size: between(0.4, 3.2),
    scale: between(1.45, 2.1),
    rotation: between(0, 360),
    offsetX: between(-0.3, 0.3),
    offsetY: between(-0.3, 0.3),
    speed: between(0.15, 0.7),
  }
  return {
    hue,
    front,
    back: backFace(hue, { ...front, speed: front.speed * 0.6 }),
    ink: pickInk(hue, front.colorBack, front.colorFront),
    watermark: hslToHex(hue, 95, 92),
    backInk: hslToHex(hue + 6, 95, 87),
  }
}
