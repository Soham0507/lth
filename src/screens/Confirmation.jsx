import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckCircle2, Home as HomeIcon, Users, Palette, MapPin, Share2, CalendarPlus, Check,
  Camera, Pencil, Binoculars,
} from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { Reveal } from '../components/Reveal.jsx'
import BridgePreview from '../components/BridgePreview.jsx'
import { SponsorMark, SponsorLine } from '../components/SponsorMark.jsx'
import { ZONES } from '../data/dummy.js'
import { SPONSORS, VIEWING_SPOTS, occasionById, effectById, experienceById } from '../data/sample.js'

const defaultColors = Object.fromEntries(ZONES.map((z) => [z.id, z.defaultColor]))

// Floating-time .ics so the reminder lands at the right local evening time.
function buildIcs({ title, dateId, slotId, minutes }) {
  const pad = (n) => String(n).padStart(2, '0')
  const [h, m] = slotId.split(':').map(Number)
  const start = `${dateId.replace(/-/g, '')}T${pad(h)}${pad(m)}00`
  const endTotal = h * 60 + m + minutes
  const end = `${dateId.replace(/-/g, '')}T${pad(Math.floor(endTotal / 60) % 24)}${pad(endTotal % 60)}00`
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Light the Hoan//Experience//EN',
    'BEGIN:VEVENT',
    `UID:${dateId}-${slotId}@lighthehoan.example`,
    `DTSTART:${start}`, `DTEND:${end}`,
    `SUMMARY:${title} — Light the Hoan`,
    'DESCRIPTION:Your reserved moment on the Hoan Bridge. Arrive a few minutes early.',
    'LOCATION:Hoan Bridge\\, Milwaukee\\, WI',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
}

export default function Confirmation() {
  const navigate = useNavigate()
  const { booking, paid, design } = useApp()
  const [shared, setShared] = useState(null) // 'shared' | 'copied'

  // Stable per mount — generating this in render would change it on every re-render.
  const ref = useMemo(() => 'LTH-' + Math.random().toString(36).slice(2, 8).toUpperCase(), [])

  if (!booking || !paid) return <Navigate to="/book" replace />

  const colors = design?.colors ?? defaultColors
  const effect = effectById(design?.effectId ?? 'steady')
  const occasion = occasionById(booking.occasionId)
  const experience = experienceById(booking.experienceId)
  const title = booking.momentName || occasion?.name || 'Your Hoan moment'
  const minutes = parseInt(booking.tier.duration) || 5

  const shareText =
    `${title} is lighting up the Hoan Bridge on ${booking.date} at ${booking.slot}! ` +
    `Come watch from the lakefront. #LightTheHoan`

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, text: shareText, url: window.location.origin })
        setShared('shared')
      } else {
        await navigator.clipboard.writeText(shareText)
        setShared('copied')
      }
    } catch {
      /* user dismissed the share sheet */
    }
    setTimeout(() => setShared(null), 2200)
  }

  const addToCalendar = () => {
    const blob = new Blob([buildIcs({ title, dateId: booking.dateId, slotId: booking.slotId, minutes })], { type: 'text/calendar' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'light-the-hoan.ics'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="screen pad-top center">
      <motion.div
        className="success-ring"
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      >
        <CheckCircle2 size={44} strokeWidth={2.2} />
      </motion.div>
      <Reveal delay={0.15}>
        <h2 className="h1" style={{ fontSize: 26 }}>You're booked!</h2>
        <p className="lead">Your moment is on the calendar. We've emailed your pass.</p>
      </Reveal>

      {/* ── The pass ── */}
      <Reveal delay={0.24} className="card pass" style={{ marginTop: 20 }}>
        <div style={{ padding: 12 }}>
          <BridgePreview palette={colors} effect={design?.effectId ?? 'steady'} />
        </div>
        <div className="pass-head">
          <div className="pass-eyebrow">{occasion ? `${occasion.name} · Hoan moment` : 'Hoan moment'}</div>
          <div className="pass-title">{title}</div>
          <div className="pass-when">{booking.date} · {booking.slot} · {booking.tier.name}, {booking.tier.duration}</div>
        </div>
        <div className="pass-credits" style={{ marginTop: 10 }}>
          {booking.sponsorId && (
            <div className="pass-credit">
              <span>{booking.dateTag}</span>
              <SponsorLine label="Presented by" id={booking.sponsorId} />
            </div>
          )}
          {experience && experience.sponsorId !== booking.sponsorId && (
            <div className="pass-credit">
              <span>{experience.title}</span>
              <SponsorLine label={SPONSORS[experience.sponsorId].placeholder ? 'Made possible by' : 'Presented by'} id={experience.sponsorId} />
            </div>
          )}
          {effect?.sponsorId && (
            <div className="pass-credit">
              <span>{effect.name} effect</span>
              <SponsorLine label="Made possible by" id={effect.sponsorId} />
            </div>
          )}
        </div>
        <div className="pass-ref"><span>Confirmation</span><b>{ref}</b></div>
      </Reveal>

      {/* ── Lighting plan ── */}
      <Reveal delay={0.05} className="card" style={{ marginTop: 14, textAlign: 'left' }}>
        <p className="card-title"><span className="lbl-badge"><Palette size={13} strokeWidth={2.5} /></span>Your lighting plan</p>
        {ZONES.map((z) => (
          <div key={z.id} className="plan-row">
            <span className="zone-swatch" style={{ background: colors[z.id], '--zone-glow': colors[z.id] }} />
            <span className="k">{z.name}</span>
            <span className="v">{colors[z.id].toUpperCase()}</span>
          </div>
        ))}
        <div className="plan-row">
          <span className="k">Effect</span>
          <span className="v">{effect?.name}</span>
        </div>
        <motion.button className="btn btn-secondary" style={{ marginTop: 12, padding: '13px 18px' }}
          onClick={() => navigate('/design')} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
          <Pencil size={15} strokeWidth={2.5} />
          Edit colors &amp; effect
        </motion.button>
      </Reveal>

      {/* ── Where to watch ── */}
      <Reveal delay={0.05} className="card" style={{ marginTop: 14, textAlign: 'left' }}>
        <p className="card-title"><span className="lbl-badge"><Binoculars size={13} strokeWidth={2.5} /></span>Where to watch</p>
        {VIEWING_SPOTS.map((s) => (
          <div key={s.name} className="spot">
            <MapPin size={16} strokeWidth={2.4} />
            <div><div className="sp-name">{s.name}</div><div className="sp-note">{s.note}</div></div>
          </div>
        ))}
        <p className="note" style={{ textAlign: 'left', justifyContent: 'flex-start', marginTop: 10 }}>
          Arrive 10–15 minutes early — your lights go live at {booking.slot}.
        </p>
      </Reveal>

      {/* ── Share ── */}
      <Reveal delay={0.05} className="card" style={{ marginTop: 14, textAlign: 'left' }}>
        <p className="card-title"><span className="lbl-badge"><Camera size={13} strokeWidth={2.5} /></span>Share your moment</p>
        <div className="share-preview">
          {shareText.replace(' #LightTheHoan', '')} <b>#LightTheHoan</b>
          <br />Tag <b>Light the Hoan</b> and we’ll help share it.
        </div>
        <div className="btn-row">
          <motion.button className="btn btn-primary" onClick={share} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            {shared ? <Check size={16} strokeWidth={3} /> : <Share2 size={16} strokeWidth={2.5} />}
            {shared === 'copied' ? 'Copied to clipboard' : shared === 'shared' ? 'Shared!' : 'Share'}
          </motion.button>
          <motion.button className="btn btn-secondary" onClick={addToCalendar} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <CalendarPlus size={16} strokeWidth={2.5} />
            Add to calendar
          </motion.button>
        </div>
      </Reveal>

      <div className="credit-bar" style={{ marginTop: 18 }}>
        <SponsorLine label="Experience technology by" id="founding" />
      </div>

      <div className="fill" />

      <Reveal delay={0.1} className="footer-cta static">
        <div className="btn-row">
          <motion.button className="btn btn-primary" onClick={() => navigate('/queue')}
            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Users size={17} strokeWidth={2.5} />
            Preview my live session
          </motion.button>
          <motion.button className="btn btn-secondary" onClick={() => navigate('/')}
            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <HomeIcon size={16} strokeWidth={2.5} />
            Back to home
          </motion.button>
        </div>
        <p className="note">Arrive a few minutes before your slot to claim your turn.</p>
      </Reveal>
    </div>
  )
}
