import { useState, type ComponentType, type SVGProps } from "react"
import { Check, Copy } from "lucide-react"
import { CARD } from "@/lib/card-data"
import type { CardStyle } from "@/lib/ticket-style"
import { TICKET_GEOMETRY } from "@/components/card/shader"
import { TicketFace } from "@/components/card/ticket-face"
import { FacebookIcon, GithubIcon, GmailIcon, InstagramIcon } from "@/components/card/icons"

interface FaceProps {
  width: number
  style: CardStyle
  visible: boolean
  reducedMotion: boolean
}

const REF = 741

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // fallback for older browsers / insecure contexts
    const ta = document.createElement("textarea")
    ta.value = text
    ta.style.position = "fixed"
    ta.style.opacity = "0"
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand("copy")
    ta.remove()
    return ok
  }
}

export function BackFace({ width, style, visible, reducedMotion }: FaceProps) {
  const [copied, setCopied] = useState(false)
  const u = (n: number) => (n / REF) * width
  const small = width < 480
  const bump = small ? 1.3 : width < 600 ? 1.12 : 1
  const height = width / TICKET_GEOMETRY.aspect
  const perfX = TICKET_GEOMETRY.perforation * width
  const pad = u(57)
  const ink = style.backInk
  const btn = Math.max(40, u(64))

  const onCopy = async () => {
    if (await copyText(CARD.email)) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    }
  }

  const links: { label: string; href: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
    { label: "Instagram", href: CARD.links.instagram, Icon: InstagramIcon },
    { label: "Facebook", href: CARD.links.facebook, Icon: FacebookIcon },
    { label: "GitHub", href: CARD.links.github, Icon: GithubIcon },
  ]

  const iconBtn =
    "grid place-items-center rounded-full border transition-[background,transform] duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2"

  // stop clicks inside the back from flipping the card
  const stop = (e: React.SyntheticEvent) => e.stopPropagation()

  return (
    <TicketFace
      width={width}
      texture={style.back}
      ink={ink}
      animate={visible && !reducedMotion}
      hidden={!visible}
      back
      label="Contact links"
    >
      <div className="absolute inset-0" style={{ color: ink }}>
        {/* jersey number in the background */}
        <div
          aria-hidden
          className="pointer-events-none absolute font-display font-extrabold tabular-nums"
          style={{
            right: width - perfX + u(18),
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: u(330),
            lineHeight: 0.8,
            letterSpacing: "-0.06em",
            opacity: 0.1,
            fontVariationSettings: '"opsz" 96',
          }}
        >
          {CARD.backNumber}
        </div>

        <div
          className="absolute font-mono uppercase"
          style={{ left: pad, top: u(52), fontSize: u(17) * bump, lineHeight: `${u(26) * bump}px`, letterSpacing: "0.06em" }}
        >
          <div>Reach out</div>
          <div style={{ opacity: 0.7 }}>{CARD.name}</div>
        </div>

        {/* social buttons */}
        <ul className="absolute flex" style={{ left: pad, top: u(132), gap: Math.max(10, u(20)) }} onClick={stop}>
          {links.map(({ label, href, Icon }) => (
            <li key={label} className="flex flex-col items-center" style={{ gap: u(8) }}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} (opens in a new tab)`}
                className={iconBtn}
                style={{ width: btn, height: btn, borderColor: `${ink}66`, background: `${ink}14`, outlineColor: ink }}
              >
                <Icon style={{ width: btn * 0.46, height: btn * 0.46 }} />
              </a>
              {!small && (
                <span className="font-mono uppercase" style={{ fontSize: u(11), letterSpacing: "0.1em", opacity: 0.75 }}>
                  {label}
                </span>
              )}
            </li>
          ))}
          <li className="flex flex-col items-center" style={{ gap: u(8) }}>
            <button
              type="button"
              onClick={onCopy}
              aria-label={`Copy Gmail address ${CARD.email}`}
              className={iconBtn}
              style={{ width: btn, height: btn, borderColor: `${ink}66`, background: `${ink}14`, outlineColor: ink }}
            >
              <GmailIcon style={{ width: btn * 0.46, height: btn * 0.46 }} />
            </button>
            {!small && (
              <span className="font-mono uppercase" style={{ fontSize: u(11), letterSpacing: "0.1em", opacity: 0.75 }}>
                Gmail
              </span>
            )}
          </li>
        </ul>

        {/* gmail address + copy */}
        <div
          className="absolute flex items-center font-mono"
          style={{ left: pad, top: u(262), fontSize: u(17) * bump, gap: u(12) }}
          onClick={stop}
        >
          <span className="select-text">{CARD.email}</span>
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center rounded-full border uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              gap: u(6),
              padding: `${u(4) * bump}px ${u(10) * bump}px`,
              fontSize: u(12) * bump,
              letterSpacing: "0.08em",
              borderColor: `${ink}66`,
              background: copied ? `${ink}33` : "transparent",
              outlineColor: ink,
            }}
          >
            {copied ? <Check style={{ width: u(13) * bump, height: u(13) * bump }} /> : <Copy style={{ width: u(13) * bump, height: u(13) * bump }} />}
            <span aria-live="polite">{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>

        {/* role chips */}
        <ul className="absolute flex flex-wrap" style={{ left: pad, top: u(338), gap: u(8), maxWidth: perfX - pad - u(20) }}>
          {CARD.chips.map((role) => (
            <li
              key={role}
              className="rounded-full border font-mono uppercase whitespace-nowrap"
              style={{
                fontSize: u(12) * bump,
                letterSpacing: "0.08em",
                padding: `${u(4) * bump}px ${u(11) * bump}px`,
                borderColor: `${ink}55`,
              }}
            >
              {role}
            </li>
          ))}
        </ul>

        {/* stub */}
        <div
          aria-hidden
          className="pointer-events-none absolute grid place-items-center font-display font-bold"
          style={{ left: perfX, top: 0, width: width - perfX, height, color: ink, opacity: 0.12 }}
        >
          <span style={{ writingMode: "vertical-rl", fontSize: u(150), lineHeight: 1, letterSpacing: "-0.04em" }}>
            {CARD.watermark}
          </span>
        </div>
        <div
          className="absolute grid place-items-center font-display font-semibold uppercase"
          style={{ left: perfX, top: 0, width: width - perfX, height }}
        >
          <span style={{ writingMode: "vertical-rl", fontSize: u(54), lineHeight: 1, opacity: 0.9 }}>{CARD.backStubText}</span>
        </div>
      </div>
    </TicketFace>
  )
}
