import { useEffect, useState } from "react"
import { LaserField } from "@/components/card/laser-field"
import { ReachCard } from "@/components/card/reach-card"
import { TrialPicker } from "@/components/card/trial-picker"
import { DEFAULT_STYLE } from "@/lib/ticket-style"
import { DEFAULT_OPTIONS, findTrial, TRIALS } from "@/lib/trials"

/** Reads `?trial=<id>` / `#trial-<id>` and `?face=back` from the URL. */
function readUrl() {
  const params = new URLSearchParams(window.location.search)
  const hash = window.location.hash.replace(/^#/, "")
  const fromHash = hash.startsWith("trial-") ? hash.slice(6) : null
  return {
    trialId: params.get("trial") ?? fromHash,
    flipped: params.get("face") === "back",
    pickerFromUrl: params.has("trials") || hash === "trials" || fromHash !== null,
  }
}

// the trials preview build always shows the picker
const TRIALS_BUILD = import.meta.env.VITE_TRIALS === "1"

export default function App() {
  const [url, setUrl] = useState(readUrl)
  useEffect(() => {
    const onHash = () => setUrl(readUrl())
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  const showPicker = TRIALS_BUILD || url.pickerFromUrl
  const trial = findTrial(url.trialId) ?? (showPicker ? TRIALS[0] : undefined)

  // the background glow follows the card's current hue (changes on Shuffle)
  const cardKey = trial?.id ?? "main"
  const [shuffled, setShuffled] = useState<{ key: string; hue: number } | null>(null)
  const hue = shuffled?.key === cardKey ? shuffled.hue : (trial?.style.hue ?? DEFAULT_STYLE.hue)

  return (
    <main className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden px-4 py-16">
      {(trial?.options ?? DEFAULT_OPTIONS).laser ? (
        <LaserField key={cardKey} hue={hue} delayMs={1300} />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-[background] duration-1000"
          style={{
            background: `radial-gradient(60% 45% at 50% 48%, hsla(${hue}, 90%, 55%, 0.20) 0%, transparent 70%)`,
          }}
        />
      )}
      <div aria-hidden className="grain" />

      {showPicker && trial && (
        <TrialPicker
          active={trial.id}
          onPick={(id) => {
            window.location.hash = `trial-${id}`
          }}
        />
      )}

      <div className="relative z-10 w-full max-w-[741px]">
        <ReachCard
          key={cardKey}
          initialStyle={trial?.style}
          options={trial?.options}
          initialFlipped={url.flipped}
          onStyleChange={(s) => setShuffled({ key: cardKey, hue: s.hue })}
        />
      </div>

      <p className="relative z-10 mt-8 text-center font-mono text-[11px] tracking-[0.2em] text-white/35 uppercase">
        Tap the card to flip
        <span className="hidden [@media(hover:hover)]:inline"> · R to shuffle colours</span>
      </p>
    </main>
  )
}
