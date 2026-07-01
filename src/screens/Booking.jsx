import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, HandCoins, Star, Check, ArrowRight } from 'lucide-react'
import Header from '../components/Header.jsx'
import { useApp } from '../context/AppContext.jsx'
import { Reveal, StaggerGroup, StaggerItem } from '../components/Reveal.jsx'
import { DATES, SLOTS, DONATION_TIERS } from '../data/dummy.js'

export default function Booking() {
  const navigate = useNavigate()
  const { setBooking, isSlotTaken } = useApp()

  const firstOpenDate = DATES.find((d) => !d.blackout)?.id
  const [date, setDate] = useState(firstOpenDate)
  const [slot, setSlot] = useState(null)
  const [tier, setTier] = useState('glow')

  const selectedDate = DATES.find((d) => d.id === date)
  const selectedSlot = SLOTS.find((s) => s.id === slot)
  const selectedTier = DONATION_TIERS.find((t) => t.id === tier)

  const ready = date && slot && tier

  const next = () => {
    setBooking({
      date: selectedDate.label,
      dateId: selectedDate.id,
      dateTag: selectedDate.tag,
      slot: selectedSlot.label,
      slotId: selectedSlot.id,
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

      <Reveal as="p" className="section-label">
        <span className="lbl-badge"><Clock size={13} strokeWidth={2.5} /></span>
        2 · Choose a time slot
      </Reveal>
      <StaggerGroup className="slot-grid">
        {SLOTS.map((s) => {
          const taken = s.status === 'full' || (date && isSlotTaken(date, s.id))
          return (
            <StaggerItem
              key={s.id}
              className={`slot ${slot === s.id ? 'active' : ''} ${taken ? 'full' : ''}`}
              onClick={() => !taken && setSlot(s.id)}
              whileTap={!taken ? { scale: 0.94 } : {}}
            >
              {s.label}
              <span className="slot-sub">{taken ? 'Sold out' : 'Available'}</span>
            </StaggerItem>
          )
        })}
      </StaggerGroup>

      <Reveal as="p" className="section-label">
        <span className="lbl-badge"><HandCoins size={13} strokeWidth={2.5} /></span>
        3 · Select a donation tier
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
          {ready ? <>Continue · ${selectedTier.price}<ArrowRight size={18} strokeWidth={2.5} /></> : 'Pick date, time & tier'}
        </motion.button>
      </div>
    </div>
  )
}
