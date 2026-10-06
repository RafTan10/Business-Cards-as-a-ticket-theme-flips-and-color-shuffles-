import type { CSSProperties, ReactNode } from "react"
import { Dithering, TICKET_GEOMETRY, ticketClipPath } from "@/components/card/shader"
import type { FaceTexture } from "@/lib/ticket-style"

interface TicketFaceProps {
  width: number
  texture: FaceTexture
  /** colour of the perforation dashes */
  ink: string
  /** animate the shader? (false for the hidden face) */
  animate: boolean
  hidden: boolean
  back?: boolean
  label: string
  children: ReactNode
}

/**
 * One side of the ticket: clipped ticket shape + animated dithering texture
 * + perforation + glare. Content is passed as children (absolutely positioned).
 */
export function TicketFace({ width, texture, ink, animate, hidden, back, label, children }: TicketFaceProps) {
  const height = width / TICKET_GEOMETRY.aspect
  const perfX = TICKET_GEOMETRY.perforation * width
  const clip = `path('${ticketClipPath(width, height, TICKET_GEOMETRY)}')`

  const face: CSSProperties = {
    width,
    height,
    clipPath: clip,
    WebkitClipPath: clip,
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    transform: back ? "rotateY(180deg)" : undefined,
  }

  return (
    <section
      aria-label={label}
      aria-hidden={hidden}
      inert={hidden}
      className="absolute inset-0 select-none"
      style={face}
    >
      <div className="absolute inset-0" style={{ background: texture.colorBack }} />
      <Dithering
        colorBack={texture.colorBack}
        colorFront={texture.colorFront}
        shape={texture.shape}
        type={texture.type}
        size={texture.size}
        scale={texture.scale}
        rotation={texture.rotation}
        offsetX={texture.offsetX}
        offsetY={texture.offsetY}
        speed={animate ? texture.speed : 0}
        style={{ position: "absolute", inset: 0, width, height }}
      />
      {/* perforation */}
      <div
        aria-hidden
        className="absolute top-0 bottom-0"
        style={{
          left: perfX,
          width: Math.max(1, 0.0022 * width),
          backgroundImage: `repeating-linear-gradient(to bottom, ${ink}66 0 ${0.012 * width}px, transparent ${0.012 * width}px ${0.024 * width}px)`,
        }}
      />
      {children}
      {/* glare follows the pointer (CSS vars are set by the tilt wrapper) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(38% 55% at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,var(--go, 0)) 0%, rgba(255,255,255,0) 70%)",
          transition: "background 300ms ease-out",
        }}
      />
    </section>
  )
}
