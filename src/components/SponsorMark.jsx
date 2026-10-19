import { useState } from 'react'
import { ImagePlus } from 'lucide-react'
import { SPONSORS } from '../data/sample.js'

const ICON = { sm: 12, md: 16, bar: 18, lg: 22, xl: 30 }

// A sponsor's logo tile. Logos always sit on white so any brand artwork reads cleanly.
// Shows /sponsors/<id>.png when that file exists, otherwise a text wordmark.
// A sponsor without a placeholder flag but also without a file falls back to a text wordmark.
// size: sm · md · bar (top bar) · lg · xl     block: stretch to container width
export function SponsorMark({ id, size = 'md', block = false, className = '' }) {
  const s = SPONSORS[id]
  const [hasLogo, setHasLogo] = useState(false)
  if (!s) return null
  // A group (e.g. the Founding Technology Partners) renders its members side by side at equal size.
  if (s.group) {
    return (
      <span className={`sponsor-group ${size} ${block ? 'block' : ''} ${className}`}>
        {s.group.map((gid) => <SponsorMark key={gid} id={gid} size={size} block={block} />)}
      </span>
    )
  }
  // Logos supplied as white artwork (e.g. Visit Milwaukee) sit on a dark tile.
  const cls = `sponsor-mark ${size} ${block ? 'block' : ''} ${s.dark ? 'dark' : ''} ${className}`
  if (s.placeholder) {
    return (
      <span className={`${cls} placeholder`}>
        <ImagePlus size={ICON[size] ?? 16} strokeWidth={2.2} />
        {s.name}
      </span>
    )
  }
  return (
    <span className={cls}>
      <img
        src={`/sponsors/${s.logo ?? id}.png`}
        alt={s.name}
        style={{ display: hasLogo ? 'block' : 'none' }}
        onLoad={() => setHasLogo(true)}
        onError={() => setHasLogo(false)}
      />
      {!hasLogo && <span className="sponsor-word">{s.name}</span>}
    </span>
  )
}

// "Presented by [mark]" — a one-line credit.
export function SponsorLine({ label, id, size = 'sm', className = '' }) {
  return (
    <span className={`sponsor-line ${className}`}>
      {label && <span>{label}</span>}
      <SponsorMark id={id} size={size} />
    </span>
  )
}

// Large "Presented by" card: the sponsor's logo is the hero of the block.
export function PartnerCard({ id, label = 'Presented by', className = '' }) {
  const s = SPONSORS[id]
  return (
    <div className={`partner-card ${className}`}>
      <div className="partner-meta">
        <span className="pm-label">{label}</span>
        <span className="pm-role">{s.role}</span>
      </div>
      <SponsorMark id={id} size="xl" block />
    </div>
  )
}
