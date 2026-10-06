import { CARD } from "@/lib/card-data"
import type { CardStyle } from "@/lib/ticket-style"
import type { TrialOptions } from "@/lib/trials"
import { TICKET_GEOMETRY, fitScale, splitName } from "@/components/card/shader"
import { Barcode } from "@/components/card/barcode"
import { TicketFace } from "@/components/card/ticket-face"
import { Typewriter } from "@/components/card/typewriter"

interface FaceProps {
  width: number
  style: CardStyle
  visible: boolean
  reducedMotion: boolean
  /** experimental trial options (empty = the normal card) */
  options?: TrialOptions
}

const REF = 741

export function FrontFace({ width, style, visible, reducedMotion, options = {} }: FaceProps) {
  const u = (n: number) => (n / REF) * width
  const bump = width < 480 ? 1.3 : width < 600 ? 1.12 : 1 // keep small text readable on phones
  const height = width / TICKET_GEOMETRY.aspect
  const perfX = TICKET_GEOMETRY.perforation * width
  const pad = u(57)

  const poster = options.nameLayout === "poster"
  const labelTop = poster ? u(42) : u(52)
  // poster: the name starts right under the labels (which grow on phones) and fills down to the role line
  const nameTop = poster ? labelTop + 2 * u(26) * bump + u(10) : u(130)
  const roleTop = poster ? u(318) : u(292)
  const footerTop = poster ? u(360) : u(352)
  const lines = splitName(CARD.name)
  const nameSize = poster ? u(124) : u(74)
  const nameLead = poster ? nameSize * 0.84 : u(70)
  const nameTracking = poster ? -0.035 : -0.02
  const nameScale = fitScale(lines, {
    availableWidth: perfX - pad - u(26),
    availableHeight: poster ? roleTop - nameTop - u(10) : u(150),
    fontSize: nameSize,
    lineHeight: nameLead,
    tracking: nameTracking,
  })

  const stubW = width - perfX

  return (
    <TicketFace
      width={width}
      texture={style.front}
      ink={style.ink}
      animate={visible && !reducedMotion}
      hidden={!visible}
      label={`${CARD.name} — ${CARD.university}, ${CARD.department}`}
    >
      {options.grid && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${style.ink}1c 1px, transparent 1px), linear-gradient(90deg, ${style.ink}1c 1px, transparent 1px)`,
            backgroundSize: `${u(22)}px ${u(22)}px`,
            backgroundPosition: `${u(57)}px ${u(52)}px`,
          }}
        />
      )}
      <div className="absolute inset-0" style={{ color: style.ink }}>
        {/* top labels */}
        <div
          className="absolute font-mono uppercase"
          style={{
            left: pad,
            top: labelTop,
            fontSize: u(17) * bump,
            lineHeight: `${u(26) * bump}px`,
            letterSpacing: "0.06em",
          }}
        >
          <div>{CARD.university}</div>
          <div style={{ opacity: 0.8 }}>{CARD.department}</div>
        </div>

        {/* name */}
        <h1
          className="absolute font-display font-bold"
          style={{
            left: pad,
            top: nameTop,
            fontSize: nameSize * nameScale,
            lineHeight: `${nameLead * nameScale}px`,
            letterSpacing: `${nameTracking}em`,
            fontVariationSettings: '"opsz" 96',
            textShadow: options.misregister ? `${u(4)}px ${u(3)}px 0 ${options.misregister}` : undefined,
          }}
        >
          {lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>

        {/* typewriter roles */}
        <p
          className="absolute font-mono whitespace-nowrap"
          style={{ left: pad, top: roleTop, fontSize: u(18) * bump, letterSpacing: "0.02em" }}
        >
          <span style={{ opacity: 0.65 }}>&gt; </span>
          <Typewriter words={CARD.roles} reducedMotion={reducedMotion || !visible} />
        </p>

        {/* footer */}
        <div
          className="absolute font-mono whitespace-nowrap uppercase"
          style={{ left: pad, top: footerTop, fontSize: u(15) * bump, letterSpacing: "0.08em", opacity: 0.85 }}
        >
          {CARD.batch} · {CARD.footerExtra}
        </div>

        {/* stub: watermark */}
        <div
          aria-hidden
          className="pointer-events-none absolute grid place-items-center font-display font-bold tabular-nums"
          style={{ left: perfX, top: 0, width: stubW, height, color: style.watermark, opacity: 0.55 }}
        >
          <span style={{ writingMode: "vertical-rl", fontSize: u(150), lineHeight: 1, letterSpacing: "-0.04em" }}>
            {CARD.watermark}
          </span>
        </div>

        {/* stub: text + serial + barcode */}
        <div
          className="absolute flex items-center justify-between"
          style={{ left: perfX, top: 0, width: stubW, height, paddingLeft: u(30), paddingRight: u(24) }}
        >
          <span
            className="font-display font-semibold uppercase"
            style={{ writingMode: "vertical-rl", fontSize: u(54), lineHeight: 1, opacity: 0.88 }}
          >
            {CARD.stubText}
          </span>
          <span
            aria-hidden
            className="font-mono uppercase whitespace-nowrap"
            style={{ writingMode: "vertical-rl", fontSize: Math.max(7, u(11)), letterSpacing: "0.12em", opacity: 0.75 }}
          >
            {CARD.serial}
          </span>
          <Barcode
            value={`${CARD.name} · ${CARD.department} · ${CARD.batch}`}
            color={style.ink}
            width={u(26)}
            height={u(300)}
            animate={!!options.meter && visible && !reducedMotion}
          />
        </div>
      </div>
    </TicketFace>
  )
}
