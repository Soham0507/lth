// SVG model of the Hoan Bridge: tied arch, vertical hangers with a diagonal V-brace at each spring, LED deck rail.
export default function BridgeArt({ cables = '#3da9fc', towers = '#ffd166', deck = '#ef476f' }) {
  const LX = 353, RX = 1087     // arch spring x-positions — central main span only, flanked by flat approaches
  const DY = 340                 // deck y-level
  const RISE = 100               // arch apex height above deck — basket-handle profile
  const WATER_Y = 372            // water surface y
  const MID = (LX + RX) / 2
  const HALF = (RX - LX) / 2

  // Parabolic arch profile: DY at the springs, DY-RISE at the apex
  const archY = (x) => DY - RISE * (1 - ((x - MID) / HALF) ** 2)

  const archNodeXs = [...Array(34)].map((_, i) => LX + (i * (RX - LX)) / 33)
  const archPath = `M ${LX} ${DY} ${archNodeXs.map((x) => `L ${x.toFixed(1)} ${archY(x).toFixed(1)}`).join(' ')} L ${RX} ${DY}`

  // Vertical hangers across the mid-span
  const vHangerXs = [...Array(11)].map((_, i) => LX + 190 + (i * (RX - LX - 380)) / 10)

  // Diagonal end-brace fan: from a vertex near each pier, cables splay up to a few points on the arch
  const fanTargets = [45, 95, 150]
  const leftFan = fanTargets.map((d) => [LX + 12, LX + d])
  const rightFan = fanTargets.map((d) => [RX - 12, RX - d])

  // Deck rail bulbs — one string of individual lights spanning the full deck
  const deckBulbXs = [...Array(46)].map((_, i) => 14 + i * (1440 - 28) / 45)

  // City skylines flanking the bridge on both shores — deterministic heights/widths
  const GROUND_Y = DY - 6
  const buildBlock = (count, startX, span, dir) =>
    [...Array(count)].map((_, i) => {
      const w = 14 + (i % 4) * 6
      const h = 42 + ((i * 53) % 110)
      const x = dir > 0 ? startX + (i * span) / count : startX + span - ((i + 1) * span) / count
      return { x, w, h, i }
    })
  const lBuildings = buildBlock(11, 4, LX - 24, 1)
  const rBuildings = buildBlock(11, RX + 20, 1440 - RX - 24, -1)
  const buildingWindows = (b) => {
    const rows = Math.max(2, Math.floor((b.h - 10) / 14))
    const cols = Math.max(1, Math.floor((b.w - 4) / 8))
    const out = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if ((b.i * 7 + r * 3 + c * 5) % 3 === 0) continue
        out.push([
          b.x + 3 + c * 8,
          GROUND_Y - b.h + 6 + r * 14,
          0.12 + ((b.i + r + c) % 5) * 0.05,
        ])
      }
    }
    return out
  }

  return (
    <svg viewBox="0 0 1440 580" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Arch glow */}
        <filter id="fg-arch" x="-40%" y="-120%" width="180%" height="340%">
          <feGaussianBlur stdDeviation="8" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* Hanger cable glow — fixed userSpace region so it doesn't collapse on
            perfectly vertical/horizontal lines, whose objectBoundingBox has a zero dimension */}
        <filter id="fg-hang" filterUnits="userSpaceOnUse" x="-20" y="-20" width="1480" height="620">
          <feGaussianBlur stdDeviation="2.4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* Lamp point glow */}
        <filter id="fs" x="-600%" y="-600%" width="1300%" height="1300%">
          <feGaussianBlur stdDeviation="7" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <clipPath id="above-deck">
          <rect x="0" y="0" width="1440" height={DY}/>
        </clipPath>

        <linearGradient id="bg-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1c2a38"/>
          <stop offset="55%"  stopColor="#22333f"/>
          <stop offset="100%" stopColor="#2c3f49"/>
        </linearGradient>
        <linearGradient id="bg-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#101d24"/>
          <stop offset="100%" stopColor="#060d12"/>
        </linearGradient>
        <linearGradient id="deck-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#6a7a86"/>
          <stop offset="100%" stopColor="#3a4a56"/>
        </linearGradient>
        <linearGradient id="pier-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#485462"/>
          <stop offset="100%" stopColor="#2a3340"/>
        </linearGradient>

        <radialGradient id="cgl" cx="8%" cy="95%" r="26%">
          <stop offset="0%"   stopColor="#0f1a22" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#1c2a38" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="cgr" cx="92%" cy="95%" r="26%">
          <stop offset="0%"   stopColor="#0f1a22" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#1c2a38" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* ── Dusk sky ── */}
      <rect width="1440" height="580" fill="url(#bg-sky)"/>
      <rect width="1440" height="580" fill="url(#cgl)"/>
      <rect width="1440" height="580" fill="url(#cgr)"/>

      {/* ── Left city skyline ── */}
      {lBuildings.map((b) => (
        <rect key={b.i} x={b.x} y={GROUND_Y - b.h} width={b.w} height={b.h} fill="#0a151c" opacity="0.94"/>
      ))}
      {lBuildings.flatMap((b) => buildingWindows(b)).map(([x, y, op], i) => (
        <rect key={i} x={x} y={y} width={3.5} height={6} fill="#ffd580" opacity={op} rx="0.5"/>
      ))}
      <g>
        <rect x="118" y="300" width="7" height="34" fill="#0a151c"/>
        <rect x="115" y="288" width="13" height="14" rx="2" fill="#7a2e2e"/>
        <circle cx="121.5" cy="291" r="2.2" fill="#ff5a4d" filter="url(#fs)" opacity="0.85"/>
      </g>
      <rect x="0"  y={DY - 6}  width={LX}   height={14} fill="#0b161e" opacity="0.96"/>
      <rect x="0"  y={DY + 6}  width={LX - 26} height={WATER_Y - DY - 6} fill="#0a151c" opacity="0.9"/>

      {/* ── Right city skyline ── */}
      {rBuildings.map((b) => (
        <rect key={b.i} x={b.x} y={GROUND_Y - b.h} width={b.w} height={b.h} fill="#0a151c" opacity="0.94"/>
      ))}
      {rBuildings.flatMap((b) => buildingWindows(b)).map(([x, y, op], i) => (
        <rect key={i} x={x} y={y} width={3.5} height={6} fill="#ffd580" opacity={op} rx="0.5"/>
      ))}
      <rect x={RX} y={DY - 6} width={1440 - RX} height={14} fill="#0b161e" opacity="0.96"/>
      <rect x={RX + 26} y={DY + 6} width={1440 - RX - 26} height={WATER_Y - DY - 6} fill="#0a151c" opacity="0.9"/>

      {/* ── Lake ── */}
      <rect y={WATER_Y} width="1440" height={580 - WATER_Y} fill="url(#bg-water)"/>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <line key={i} x1={20} y1={WATER_Y + 12 + i * 24} x2={1420} y2={WATER_Y + 12 + i * 24}
          stroke="#0c1a22" strokeWidth="1.5" opacity={0.42 - i * 0.04}/>
      ))}

      {/* ── Hangers (cables): vertical mid-span + diagonal end-brace fans ── */}
      <g clipPath="url(#above-deck)">
        {vHangerXs.map((x, i) => (
          <line key={i} x1={x} y1={DY} x2={x} y2={archY(x)}
            stroke={cables} strokeWidth="2" filter="url(#fg-hang)" opacity="0.85"/>
        ))}
        {[...leftFan, ...rightFan].map(([dx, ax], i) => (
          <line key={i} x1={dx} y1={DY} x2={ax} y2={archY(ax)}
            stroke={cables} strokeWidth="2" filter="url(#fg-hang)" opacity="0.85"/>
        ))}
      </g>

      {/* ── Main arch (towers color) — outer tube + inner truss tube near the crest ── */}
      <g clipPath="url(#above-deck)">
        <path d={archPath} fill="none" stroke={towers} strokeWidth="9" filter="url(#fg-arch)" opacity="0.7" strokeLinejoin="round"/>
        <path d={archPath} fill="none" stroke={towers} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.98"/>
        {/* inner tube, offset below the outer arch, visible mainly at the crest */}
        <path d={`M ${LX + 60} ${archY(LX + 60) + 16} ${archNodeXs.filter((x) => x > LX + 60 && x < RX - 60).map((x) => `L ${x.toFixed(1)} ${(archY(x) + 16).toFixed(1)}`).join(' ')} L ${RX - 60} ${archY(RX - 60) + 16}`}
          fill="none" stroke={towers} strokeWidth="2.2" opacity="0.55"/>
        {/* cross struts between the two tubes at the crest */}
        {archNodeXs.filter((x) => x > MID - 150 && x < MID + 150 && Math.abs(x - MID) % 34 < 9).map((x, i) => (
          <line key={i} x1={x} y1={archY(x)} x2={x} y2={archY(x) + 16} stroke={towers} strokeWidth="2" opacity="0.5"/>
        ))}
        {/* small bulbs along the arch */}
        {archNodeXs.filter((_, i) => i % 3 === 0).map((x, i) => (
          <circle key={i} cx={x} cy={archY(x)} r={2} fill="#fff" opacity="0.55"/>
        ))}
      </g>

      {/* Aviation warning lights at apex */}
      <circle cx={MID - 14} cy={archY(MID) - 4} r={2.4} fill="#ff4d4d" filter="url(#fs)" opacity="0.85"/>
      <circle cx={MID + 14} cy={archY(MID) - 4} r={2.4} fill="#ff4d4d" filter="url(#fs)" opacity="0.85"/>

      {/* ── Left approach deck + piers ── */}
      <rect x="0" y={DY - 14} width={LX} height={20} fill="url(#deck-fill)" opacity="0.95"/>
      {[90, 200, 300].map((x) => (
        <g key={x}>
          <rect x={x - 11} y={DY + 6} width={22} height={38} rx="3" fill="url(#pier-fill)"/>
          <rect x={x - 8}  y={DY + 40} width={16} height={6}  rx="2" fill="#252e3c"/>
        </g>
      ))}

      {/* ── Main span deck ── */}
      <rect x={LX} y={DY - 14} width={RX - LX} height={20} fill="url(#deck-fill)"/>
      <rect x={LX} y={DY - 7} width={RX - LX} height={3} fill="#334455" opacity="0.4"/>
      {[...Array(5)].map((_, i) => (
        <rect key={i} x={LX + 80 + i * 130} y={DY - 6} width={58} height={1.5}
          fill="#8899aa" opacity="0.18"/>
      ))}

      {/* ── Right approach deck + piers ── */}
      <rect x={RX} y={DY - 14} width={1440 - RX} height={20} fill="url(#deck-fill)" opacity="0.95"/>
      {[1140, 1240, 1350].map((x) => (
        <g key={x}>
          <rect x={x - 11} y={DY + 6} width={22} height={38} rx="3" fill="url(#pier-fill)"/>
          <rect x={x - 8}  y={DY + 40} width={16} height={6}  rx="2" fill="#252e3c"/>
        </g>
      ))}

      {/* ── Arch base piers ── */}
      <rect x={LX - 22} y={DY}      width={44} height={64} rx="6" fill="#485668"/>
      <rect x={LX - 18} y={DY + 56} width={36} height={10} rx="3" fill="#343f4e"/>
      <rect x={RX - 22} y={DY}      width={44} height={64} rx="6" fill="#485668"/>
      <rect x={RX - 18} y={DY + 56} width={36} height={10} rx="3" fill="#343f4e"/>

      {/* ── Deck rail bulbs ── */}
      {deckBulbXs.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={DY - 6} r={3.2} fill={deck} filter="url(#fs)" opacity="0.85"/>
          <circle cx={x} cy={DY - 6} r={1.3} fill="#fff" opacity="0.8"/>
        </g>
      ))}
    </svg>
  )
}
