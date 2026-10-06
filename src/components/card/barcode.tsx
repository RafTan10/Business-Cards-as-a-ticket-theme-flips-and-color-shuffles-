import { useEffect, useMemo, useState } from "react"

/** Small deterministic hash → pseudo-random sequence (same text = same bars). */
function seeded(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    return ((h >>> 0) % 1000) / 1000
  }
}

interface BarcodeProps {
  /** Text the bars are derived from. Decorative only — never put private IDs here. */
  value: string
  color: string
  width: number
  height: number
  /** experimental: bars bounce like an audio level meter */
  animate?: boolean
}

/** A vertical, purely decorative barcode strip for the ticket stub. */
export function Barcode({ value, color, width, height, animate }: BarcodeProps) {
  const { bars, total } = useMemo(() => {
    const rnd = seeded(value)
    const out: { y: number; h: number }[] = []
    let y = 0
    const guard = () => {
      out.push({ y, h: 1 }, { y: y + 2, h: 1 })
      y += 4
    }
    guard()
    for (let i = 0; i < 34; i++) {
      const bar = 1 + Math.floor(rnd() * 3)
      const gap = 1 + Math.floor(rnd() * 2)
      out.push({ y, h: bar })
      y += bar + gap
    }
    guard()
    return { bars: out, total: y - 1 }
  }, [value])

  // level per bar (1 = full width). Only changes while `animate` is on.
  const [levels, setLevels] = useState<number[] | null>(null)
  useEffect(() => {
    if (!animate) return
    let t = 0
    const id = window.setInterval(() => {
      t += 1
      setLevels(
        bars.map((_, i) => {
          const wave = 0.5 + 0.5 * Math.sin(t * 0.55 + i * 0.42)
          return Math.max(0.18, Math.min(1, 0.25 + 0.6 * wave * Math.random() + 0.2 * Math.random()))
        }),
      )
    }, 90)
    return () => window.clearInterval(id)
  }, [animate, bars])
  const shown = animate ? levels : null

  return (
    <svg
      aria-hidden
      width={width}
      height={height}
      viewBox={`0 0 1 ${total}`}
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      {bars.map((b, i) => (
        <rect key={i} x={shown ? 1 - shown[i] : 0} y={b.y} width={shown ? shown[i] : 1} height={b.h} fill={color} />
      ))}
    </svg>
  )
}
