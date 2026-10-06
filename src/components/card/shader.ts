import type { ComponentType, CSSProperties } from "react"
import {
  Dithering as UntypedDithering,
  TICKET_GEOMETRY as UNTYPED_GEOMETRY,
  TICKET_SHAPES as UNTYPED_SHAPES,
  TICKET_TYPES as UNTYPED_TYPES,
  hslToHex as untypedHslToHex,
  playShutterSound as untypedPlayShutterSound,
  splitName as untypedSplitName,
  fitScale as untypedFitScale,
  ticketClipPath as untypedTicketClipPath,
  usePrefersReducedMotion as untypedUsePrefersReducedMotion,
} from "@/components/ui/admit-one-ticket"

/** Typed facade over the (untyped, vendored) admit-one-ticket module. */

export type DitheringShape = "simplex" | "warp" | "dots" | "wave" | "ripple" | "swirl" | "sphere"
export type DitheringType = "random" | "2x2" | "4x4" | "8x8"

export interface DitheringProps {
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
  style?: CSSProperties
  className?: string
}

export interface TicketGeometry {
  aspect: number
  cornerRadius: number
  notchRadius: number
  perforation: number
}

export const Dithering = UntypedDithering as unknown as ComponentType<DitheringProps>
export const TICKET_GEOMETRY = UNTYPED_GEOMETRY as TicketGeometry
export const SHAPES = UNTYPED_SHAPES as DitheringShape[]
export const TYPES = UNTYPED_TYPES as DitheringType[]
export const hslToHex = untypedHslToHex as (h: number, s: number, l: number) => string
export const playShutterSound = untypedPlayShutterSound as (opts?: { volume?: number; gap?: number }) => void
export const splitName = untypedSplitName as (name: string, max?: number) => string[]
export const fitScale = untypedFitScale as (
  lines: string[],
  opts: { availableWidth: number; availableHeight: number; fontSize: number; lineHeight: number; tracking: number },
) => number
export const ticketClipPath = untypedTicketClipPath as (w: number, h: number, g?: TicketGeometry) => string
export const usePrefersReducedMotion = untypedUsePrefersReducedMotion as () => boolean
