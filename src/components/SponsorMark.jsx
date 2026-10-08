import { useState } from 'react'
import { SPONSORS } from '../data/sample.js'

// A sponsor's wordmark. Shows /sponsors/<id>.png when that file exists, otherwise a text wordmark.
// The Founding Technology Partner is always a dashed "YOUR LOGO HERE" slot.
export function SponsorMark({ id, size = 'md', className = '' }) {
  const s = SPONSORS[id]
  const [hasLogo, setHasLogo] = useState(false)
  if (!s) return null
  if (s.placeholder) {
    return <span className={`sponsor-mark placeholder ${size} ${className}`}>{s.name}</span>
  }
  return (
    <span className={`sponsor-mark ${size} ${className}`}>
      <img
        src={`/sponsors/${id}.png`}
        alt={s.name}
        style={{ display: hasLogo ? 'block' : 'none' }}
        onLoad={() => setHasLogo(true)}
        onError={() => setHasLogo(false)}
      />
      {!hasLogo && <span className="sponsor-word">{s.name}</span>}
    </span>
  )
}

// "Presented by [mark]" — a quiet one-line credit.
export function SponsorLine({ label, id, size = 'sm', className = '' }) {
  return (
    <div className={`sponsor-line ${className}`}>
      <span>{label}</span>
      <SponsorMark id={id} size={size} />
    </div>
  )
}
