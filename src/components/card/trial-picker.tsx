import { TRIALS } from "@/lib/trials"

interface TrialPickerProps {
  active: string
  onPick: (id: string) => void
}

/** Switcher shown only on the trials page: one button per experiment + what it tries. */
export function TrialPicker({ active, onPick }: TrialPickerProps) {
  const current = TRIALS.find((t) => t.id === active) ?? TRIALS[0]
  return (
    <nav aria-label="Design trials" className="relative z-10 mb-10 flex w-full max-w-[741px] flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-xl font-semibold text-white/90">Design trials</h2>
        <span className="text-sm text-white/45 tabular-nums">
          {TRIALS.indexOf(current) + 1} of {TRIALS.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-2" role="tablist">
        {TRIALS.map((t) => {
          const on = t.id === active
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onPick(t.id)}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                on ? "border-white/70 bg-white text-[#18110c]" : "border-white/15 bg-white/5 text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              {t.title}
            </button>
          )
        })}
      </div>
      <p className="max-w-[60ch] text-[15px] leading-relaxed text-white/65">{current.idea}</p>
    </nav>
  )
}
