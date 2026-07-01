import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, HandCoins, Star, Check, ArrowRight } from 'lucide-react'
import Header from '../components/Header.jsx'
import { useApp } from '../context/AppContext.jsx'
import { Reveal, StaggerGroup, StaggerItem } from '../components/Reveal.jsx'
import { DATES, SESSION_WINDOW, DONATION_TIERS } from '../data/dummy.js'

export default function Booking() {
  const navigate = useNavigate()
  const { setBooking } = useApp()

  const firstOpenDate = DATES.find((d) => !d.blackout)?.id
  const [date, setDate] = useState(firstOpenDate)
  const [tier, setTier] = useState('glow')

  const selectedDate = DATES.find((d) => d.id === date)
  const selectedTier = DONATION_TIERS.find((t) => t.id === tier)

  const ready = date && tier

  const next = () => {
    setBooking({
      date: selectedDate.label,
      dateTag: selectedDate.tag,
      window: SESSION_WINDOW,
      tier: selectedTier,
    })
    navigate('/payment')
  }

  return (
    <div className="screen">
      <Header title="Book a session" back="/" />

      <Reveal as="p" className="section-label" style={{ marginTop: 4 }}>
        <span className="lbl-badge"><Calendar size={13} strokeWidth={2.5} /></span>
        1 · Pick a date
      </Reveal>
      <StaggerGroup className="date-strip">
        {DATES.map((d) => (
          <StaggerItem
            key={d.id}
            className={`date-pill ${date === d.id ? 'active' : ''} ${d.blackout ? 'blackout' : ''}`}
            onClick={() => !d.blackout && setDate(d.id)}
            whileTap={!d.blackout ? { scale: 0.94 } : {}}
          >
            <div className="dp-label">{d.label.split(', ')[0]}</div>
            <div className="dp-label" style={{ fontSize: 12 }}>{d.label.split(', ')[1]}</div>
            <div className="dp-sub">{d.blackout ? 'Closed' : d.tag ? '★ event' : 'Open'}</div>
          </StaggerItem>
        ))}
      </StaggerGroup>
      {selectedDate?.tag && (
        <motion.div className="chip warn" style={{ marginTop: 10 }}
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Star size={11} strokeWidth={2.5} /> {selectedDate.tag}
        </motion.div>
      )}

      <Reveal className="session-window-row">
        <Clock size={14} strokeWidth={2.5} />
        <span>Session window · <strong>{SESSION_WINDOW}</strong></span>
        <span className="session-window-note">You'll join the live queue when you arrive</span>
      </Reveal>

      <Reveal as="p" className="section-label">
        <span className="lbl-badge"><HandCoins size={13} strokeWidth={2.5} /></span>
        2 · Select a donation tier
      </Reveal>
      <StaggerGroup className="stack-12">
        {DONATION_TIERS.map((t) => (
          <StaggerItem
            key={t.id}
            className={`card tier tap ${tier === t.id ? 'active' : ''}`}
            onClick={() => setTier(t.id)}
            whileTap={{ scale: 0.98 }}
          >
            {t.popular && <span className="tier-badge">MOST POPULAR</span>}
            <div className="tier-top">
              <span className="tier-name">{t.name}</span>
              <span className="tier-price">${t.price}<small> /{t.duration}</small></span>
            </div>
            <p className="tier-blurb">{t.blurb}</p>
            <ul className="tier-perks">
              {t.perks.map((p) => (
                <li key={p}><Check size={13} strokeWidth={3} style={{ flexShrink: 0 }} />{p}</li>
              ))}
            </ul>
          </StaggerItem>
        ))}
      </StaggerGroup>

      <div className="footer-cta">
        <motion.button className="btn btn-primary" disabled={!ready} onClick={next}
          whileHover={ready ? { y: -2 } : {}} whileTap={ready ? { scale: 0.97 } : {}}>
          {ready ? <>Continue · ${selectedTier.price}<ArrowRight size={18} strokeWidth={2.5} /></> : 'Pick a date & tier'}
        </motion.button>
      </div>
    </div>
  )
}
