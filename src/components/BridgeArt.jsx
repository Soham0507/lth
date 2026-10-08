import { useId } from 'react'

// The Hoan Bridge as a line graphic with three independently-lit parts:
//   deck      → "Deck Lights" (the two long rails)
//   verticals → "Verticals"   (hanger cables between the deck and the arch, and under the approaches)
//   arch      → "Arch"        (the main arch plus the curved approach spans)
// Geometry is traced from the official graphic (938 × 170 units).

const SPRING_L = 178
const SPRING_R = 782
const SPRING_Y = 160
const MID = (SPRING_L + SPRING_R) / 2
const HALF = (SPRING_R - SPRING_L) / 2
const APEX = 8
const DECK_TOP = 78
const DECK_BOT = 93
const W = 938

const archY = (x) => SPRING_Y - (SPRING_Y - APEX) * (1 - Math.abs((x - MID) / HALF) ** 2.1)
const leftCurveY = (x) => 95 + 65 * ((x - 2) / (SPRING_L - 2)) ** 1.5
const rightCurveY = (x) => 95 + 63 * ((W - 2 - x) / (W - 2 - SPRING_R)) ** 1.5

const trace = (fn, x0, x1, n = 48) =>
  `M ${x0} ${fn(x0).toFixed(1)} ` +
  [...Array(n)].map((_, i) => {
    const x = x0 + ((i + 1) * (x1 - x0)) / n
    return `L ${x.toFixed(1)} ${fn(x).toFixed(1)}`
  }).join(' ')

const ARCH_PATH = trace(archY, SPRING_L, SPRING_R, 80)
const LEFT_APPROACH = trace(leftCurveY, 2, SPRING_L, 36)
const RIGHT_APPROACH = trace(rightCurveY, SPRING_R, W - 2, 36)

// Hangers: [x, yTop, yBottom]
const VERTICALS = [
  ...[328, 373, 418, 462, 507, 551, 596, 641].map((x) => [x, archY(x), DECK_TOP]),
  ...[88, 126, 175].map((x) => [x, DECK_BOT, leftCurveY(x)]),
  [212, DECK_BOT, archY(212)],
  [752, DECK_BOT, archY(752)],
  ...[787, 822, 860].map((x) => [x, DECK_BOT, rightCurveY(x)]),
]

// Deterministic pseudo-random so effect dots sit in the same place on every render.
const rnd = (i, salt = 1) => {
  const v = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453
  return v - Math.floor(v)
}

const SPARKLES = [...Array(46)].map((_, i) => {
  const kind = i % 3
  let x, y
  if (kind === 0) { x = 8 + rnd(i) * (W - 16); y = rnd(i, 2) > 0.5 ? DECK_TOP : DECK_BOT }
  else if (kind === 1) { x = SPRING_L + 10 + rnd(i) * (SPRING_R - SPRING_L - 20); y = archY(x) }
  else { const v = VERTICALS[Math.floor(rnd(i, 3) * 8)]; x = v[0]; y = v[1] + rnd(i, 4) * (v[2] - v[1]) }
  return { x, y, d: rnd(i, 5) * 2.4, r: 1.8 + rnd(i, 6) * 1.6 }
})

const CONFETTI_COLORS = ['#ef476f', '#ffd166', '#06d6a0', '#3da9fc', '#f72585', '#a855f7', '#ffffff', '#ff6b35']
const CONFETTI = [...Array(40)].map((_, i) => ({
  x: 10 + rnd(i, 7) * (W - 20),
  y: 4 + rnd(i, 8) * 158,
  d: rnd(i, 9) * 2.6,
  c: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  r: 2 + rnd(i, 10) * 2.2,
}))

const ZONE_ORDER = ['deck', 'verticals', 'arch']
const LABELS = {
  deck: { text: 'DECK LIGHTS', x: 125, y: 56 },
  verticals: { text: 'VERTICALS', x: 551, y: 52 },
  arch: { text: 'ARCH', x: MID, y: -14 },
}

export default function BridgeArt({
  deck = '#ef476f',
  verticals = '#3da9fc',
  arch = '#ffd166',
  effect = 'steady',
  active = null,       // zone id to spotlight; the other zones dim
  labels = false,      // show the active zone's name on the graphic
  onSelect,            // (zoneId) => void — makes each part of the bridge tappable
  className = '',
  title = 'Hoan Bridge lighting preview',
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const colors = { deck, verticals, arch }
  const glowId = `glow${uid}`
  const dimmed = (z) => active && active !== z

  const shapes = (z) => {
    if (z === 'deck') return (
      <>
        <line x1="2" y1={DECK_TOP} x2={W - 2} y2={DECK_TOP} />
        <line x1="2" y1={DECK_BOT} x2={W - 2} y2={DECK_BOT} />
      </>
    )
    if (z === 'verticals') return VERTICALS.map(([x, y1, y2], i) => (
      <line key={i} x1={x} y1={y1} x2={x} y2={y2} className="vline" style={{ '--vx': x / W }} />
    ))
    return (
      <>
        <path d={ARCH_PATH} />
        <path d={LEFT_APPROACH} />
        <path d={RIGHT_APPROACH} />
      </>
    )
  }

  const widths = { deck: 5, verticals: 4.5, arch: 6.5 }

  return (
    <svg
      className={`bridge-svg fx-${effect} ${className}`}
      viewBox="-8 -46 954 226"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <defs>
        <filter id={glowId} filterUnits="userSpaceOnUse" x="-30" y="-40" width="1000" height="240">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {ZONE_ORDER.map((z) => (
        <g
          key={z}
          className={`bz bz-${z} ${dimmed(z) ? 'dim' : ''} ${active === z ? 'on' : ''}`}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ stroke: colors[z], strokeWidth: widths[z] }}
        >
          {/* spotlight halo behind the active part */}
          {active === z && (
            <g className="halo" style={{ strokeWidth: widths[z] + 12 }} filter={`url(#${glowId})`}>
              {shapes(z)}
            </g>
          )}
          <g filter={`url(#${glowId})`}>{shapes(z)}</g>
        </g>
      ))}

      {/* ── Effect overlays ── */}
      {effect === 'sparkle' && (
        <g className="fx-layer">
          {SPARKLES.map((s, i) => (
            <circle key={i} className="spark" cx={s.x} cy={s.y} r={s.r} fill="#fff" style={{ animationDelay: `${s.d}s` }} />
          ))}
        </g>
      )}
      {effect === 'confetti' && (
        <g className="fx-layer">
          {CONFETTI.map((s, i) => (
            <circle key={i} className="confetto" cx={s.x} cy={s.y} r={s.r} fill={s.c} style={{ animationDelay: `${s.d}s` }} />
          ))}
        </g>
      )}
      {effect === 'waves' && (
        <g className="fx-layer chasers" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
          <line x1="2" y1={DECK_TOP} x2={W - 2} y2={DECK_TOP} pathLength="100" className="chase" />
          <line x1="2" y1={DECK_BOT} x2={W - 2} y2={DECK_BOT} pathLength="100" className="chase rev" />
          <path d={ARCH_PATH} pathLength="100" className="chase" />
        </g>
      )}

      {/* Active-part label */}
      {labels && active && (() => {
        const l = LABELS[active]
        const w = l.text.length * 16.5 + 30
        return (
          <g className="zone-label" pointerEvents="none">
            <rect x={l.x - w / 2} y={l.y - 27} width={w} height="38" rx="19" />
            <text x={l.x} y={l.y} textAnchor="middle">{l.text}</text>
          </g>
        )
      })()}

      {/* Tap targets */}
      {onSelect && (
        <g fill="none" stroke="transparent" strokeWidth="24" strokeLinecap="round" style={{ cursor: 'pointer' }}>
          <g onClick={() => onSelect('verticals')}>{shapes('verticals')}</g>
          <g onClick={() => onSelect('arch')}>{shapes('arch')}</g>
          <g onClick={() => onSelect('deck')}>{shapes('deck')}</g>
        </g>
      )}
    </svg>
  )
}
