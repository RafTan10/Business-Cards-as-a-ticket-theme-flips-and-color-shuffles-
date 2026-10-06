import { useEffect, useState } from "react"

interface TypewriterProps {
  words: readonly string[]
  reducedMotion?: boolean
  typeMs?: number
  deleteMs?: number
  holdMs?: number
}

/** Types each word, holds, deletes, moves to the next — forever. */
export function Typewriter({ words, reducedMotion, typeMs = 70, deleteMs = 38, holdMs = 1400 }: TypewriterProps) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (reducedMotion || words.length === 0) return
    const word = words[index % words.length]
    let delay = deleting ? deleteMs : typeMs
    if (!deleting && text === word) delay = holdMs
    if (deleting && text === "") delay = 260

    const t = window.setTimeout(() => {
      if (!deleting && text === word) setDeleting(true)
      else if (deleting && text === "") {
        setDeleting(false)
        setIndex((i) => (i + 1) % words.length)
      } else {
        setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1))
      }
    }, delay)
    return () => window.clearTimeout(t)
  }, [text, deleting, index, words, reducedMotion, typeMs, deleteMs, holdMs])

  // reduced motion: no typing, just swap the whole word every few seconds
  const [still, setStill] = useState(0)
  useEffect(() => {
    if (!reducedMotion || words.length < 2) return
    const t = window.setInterval(() => setStill((i) => (i + 1) % words.length), 2600)
    return () => window.clearInterval(t)
  }, [reducedMotion, words.length])

  if (reducedMotion) {
    return (
      <span>
        <span className="sr-only">{words.join(", ")}</span>
        <span aria-hidden>{words[still % words.length]}</span>
      </span>
    )
  }

  return (
    <span>
      <span className="sr-only">{words.join(", ")}</span>
      <span aria-hidden>
        {text}
        <span className="tw-caret">▍</span>
      </span>
    </span>
  )
}
