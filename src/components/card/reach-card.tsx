import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react"
import { Dices, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackFace } from "@/components/card/back-face"
import { FrontFace } from "@/components/card/front-face"
import { TICKET_GEOMETRY, playShutterSound, usePrefersReducedMotion } from "@/components/card/shader"
import { useCanHover, useElementWidth } from "@/hooks/use-element-width"
import { DEFAULT_STYLE, remixStyle, type CardStyle } from "@/lib/ticket-style"
import { DEFAULT_OPTIONS, type TrialOptions } from "@/lib/trials"

const MAX_TILT = 9

interface ReachCardProps {
  onStyleChange?: (style: CardStyle) => void
  /** starting colours (a trial can pass its own) */
  initialStyle?: CardStyle
  /** experimental trial options */
  options?: TrialOptions
  /** start on the back side (used by screenshots: ?face=back) */
  initialFlipped?: boolean
}

// automated browsers (screenshots) skip the printing intro
const SKIP_INTRO = typeof navigator !== "undefined" && navigator.webdriver

/**
 * The full interactive card: responsive sizing, "printing" entrance,
 * pointer tilt + glare, click-to-flip, and the shuffle control.
 */
export function ReachCard({ onStyleChange, initialStyle = DEFAULT_STYLE, options = DEFAULT_OPTIONS, initialFlipped = false }: ReachCardProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const available = useElementWidth(wrapRef)
  const reduced = usePrefersReducedMotion()
  const canHover = useCanHover()

  const [flipped, setFlipped] = useState(initialFlipped)
  const [style, setStyle] = useState<CardStyle>(initialStyle)
  const [phase, setPhase] = useState<"waiting" | "printing" | "done">(SKIP_INTRO ? "done" : "waiting")

  const width = Math.round(Math.min(741, Math.max(280, available)))
  const height = width / TICKET_GEOMETRY.aspect
  const ready = available > 0

  // start the print once we know the size (and fonts had a moment to load)
  useEffect(() => {
    if (!ready || phase !== "waiting") return
    const t = window.setTimeout(() => setPhase("printing"), 350)
    return () => window.clearTimeout(t)
  }, [ready, phase])

  const shuffle = useCallback(() => {
    const next = remixStyle()
    setStyle(next)
    onStyleChange?.(next)
    playShutterSound()
  }, [onStyleChange])

  // keyboard: R = shuffle, F = flip
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      if (e.key === "r" || e.key === "R") shuffle()
      if (e.key === "f" || e.key === "F") setFlipped((f) => !f)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [shuffle])

  // ---- tilt + glare (desktop pointers only) ----
  const tiltEnabled = canHover && !reduced && phase === "done"
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = tiltRef.current
    if (!el || !tiltEnabled) return
    const r = el.getBoundingClientRect()
    const dx = (e.clientX - r.left) / r.width - 0.5
    const dy = (e.clientY - r.top) / r.height - 0.5
    el.style.transition = "none"
    el.style.transform = `perspective(1200px) rotateX(${-dy * 2 * MAX_TILT}deg) rotateY(${dx * 2 * MAX_TILT}deg) scale(1.02)`
    el.style.setProperty("--gx", `${(dx + 0.5) * 100}%`)
    el.style.setProperty("--gy", `${(dy + 0.5) * 100}%`)
    el.style.setProperty("--go", "0.16")
  }
  const onLeave = () => {
    const el = tiltRef.current
    if (!el) return
    el.style.transition = "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)"
    el.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)"
    el.style.setProperty("--go", "0")
  }

  const printing = phase === "printing"

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div ref={wrapRef} className="w-full max-w-[741px]" data-shot>
        {ready && (
          <div
            className="relative mx-auto"
            style={{
              width,
              height,
              // while printing, hide everything below the "printer slot"
              clipPath: phase === "done" ? undefined : "inset(-200% -200% 0 -200%)",
            }}
          >
            {/* printer slot */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 rounded-full"
              style={{
                bottom: -3,
                width: width * 1.08,
                height: 6,
                background: "linear-gradient(#000, #2a2018)",
                boxShadow: "0 1px 0 rgba(255,255,255,.12), 0 0 18px rgba(0,0,0,.6)",
                opacity: phase === "done" ? 0 : 1,
                transition: "opacity 600ms ease 200ms",
              }}
            />
            <div
              className={printing ? (reduced ? "print-fade" : "print-out") : undefined}
              style={{ opacity: phase === "waiting" ? 0 : 1 }}
              onAnimationEnd={() => setPhase("done")}
            >
              <div
                ref={tiltRef}
                onPointerMove={onMove}
                onPointerLeave={onLeave}
                className="relative will-change-transform"
                style={{
                  width,
                  height,
                  transform: "perspective(1200px)",
                  // the shadow lives here (a filter on the flip layer would flatten its 3D)
                  filter: "drop-shadow(0 24px 40px rgba(0,0,0,.45))",
                }}
              >
                <div
                  className="relative cursor-pointer"
                  onClick={() => setFlipped((f) => !f)}
                  style={{
                    width,
                    height,
                    transformStyle: "preserve-3d",
                    transform: `perspective(1600px) rotateY(${flipped ? 180 : 0}deg)`,
                    transition: `transform ${reduced ? 1 : 750}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                  }}
                >
                  <FrontFace width={width} style={style} visible={!flipped} reducedMotion={reduced} options={options} />
                  <BackFace width={width} style={style} visible={flipped} reducedMotion={reduced} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className="flex items-center gap-3 transition-opacity duration-700"
        style={{ opacity: phase === "done" ? 1 : 0 }}
      >
        <Button
          variant="outline"
          size="lg"
          onClick={() => setFlipped((f) => !f)}
          aria-pressed={flipped}
          className="rounded-full border-white/15 bg-white/5 px-4 font-mono text-xs tracking-widest text-white/80 uppercase hover:bg-white/10 hover:text-white"
        >
          <RotateCcw /> {flipped ? "Front" : "Flip card"}
        </Button>
        <Button
          variant="outline"
          size="icon-lg"
          onClick={shuffle}
          aria-label="Shuffle colours (R)"
          title="Shuffle colours (R)"
          className="rounded-full border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
        >
          <Dices />
        </Button>
      </div>
    </div>
  )
}
