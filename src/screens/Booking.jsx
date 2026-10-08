import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, HandCoins, Star, Check, ArrowRight, PartyPopper, X } from 'lucide-react'
import Header from '../components/Header.jsx'
import BridgePreview from '../components/BridgePreview.jsx'
import { SponsorMark, SponsorLine } from '../components/SponsorMark.jsx'
import { useApp } from '../context/AppContext.jsx'
import { Reveal, StaggerGroup, StaggerItem } from '../components/Reveal.jsx'
import { DATES, SLOTS, DONATION_TIERS, ZONES } from '../data/dummy.js'
import {
  OCCASIONS, SPONSORS, occasionById, experienceById, reservationFor,
} from '../data/sample.js'

const defaultPalette = Object.fromEntries(ZONES.map((z) => [z.id, z.defaultColor]))

export default function Booking() {
  const navigate = useNavigate()
  const { setBooking, isSlotTaken, intent, setIntent, setDesign } = useApp()

  const experience = experienceById(intent?.experienceId)
  // Land on the night that matches what the visitor tapped on Home.
  const startDate =
    DATES.find((d) => d.id === intent?.dateId)?.id ??
    DATES.find((d) => experience && d.sponsorId === experience.sponsorId)?.id ??
    DATES[0].id

  const [date, setDate] = useState(startDate)
  const [slot, setSlot] = useState(intent?.dateId === startDate ? intent?.slotId ?? null : null)
  const [tier, setTier] = useState('glow')
  const [occasionId, setOccasionId] = useState(intent?.occasionId ?? null)
  const [momentName, setMomentName] = useState('')

  const selectedDate = DATES.find((d) => d.id === date)
  const selectedSlot = SLOTS.find((s) => s.id === slot)
  const selectedTier = DONATION_TIERS.find((t) => t.id === tier)
  const occasion = occasionById(occasionId)

  const ready = date && slot && tier

  // Preview of the lighting plan this occasion will start from.
  const palette = experience?.palette ?? occasion?.palette ?? defaultPalette
  const effectId = experience?.effect ?? occasion?.effect ?? 'steady'

  const chooseDate = (id) => {
    setDate(id)
    setSlot(null)
  }

  const next = () => {
    setDesign({ colors: { ...palette }, effectId })
    setBooking({
      date: selectedDate.label,
      dateId: selectedDate.id,
      dateTag: selectedDate.tag,
      sponsorId: selectedDate.sponsorId,
      slot: selectedSlot.label,
      slotId: selectedSlot.id,
      tier: selectedTier,
      occasionId,
      momentName: momentName.trim(),
      experienceId: experience?.id ?? null,
    })
    setIntent(null)
    navigate('/payment')
  }

  const takenCount = SLOTS.filter((s) => s.status === 'full' || reservationFor(date, s.id) || isSlotTaken(date, s.id)).length

  return (
    <div className="screen">
      <Header title="Book a session" back="/" />

      {experience && (
        <Reveal className="sponsor-banner" style={{ marginTop: 4 }}>
          <div>
            <div className="sb-title">{experience.title}</div>
            <div className="sb-sub">
              {experience.kind} · {SPONSORS[experience.sponsorId].placeholder ? 'made possible by' : 'presented by'}
            </div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <SponsorMark id={experience.sponsorId} size="sm" />
            <button className="iconbtn ghost" style={{ width: 28, height: 28 }} aria-label="Remove experience"
              onClick={() => setIntent({ ...intent, experienceId: null })}>
              <X size={15} strokeWidth={2.5} />
            </button>
          </span>
        </Reveal>
      )}

      <Reveal as="p" className="section-label" style={{ marginTop: experience ? 18 : 4 }}>
        <span className="lbl-badge"><PartyPopper size={13} strokeWidth={2.5} /></span>
        1 · What are you celebrating?
      </Reveal>
      <div className="occasion-chips">
        {OCCASIONS.map((o) => (
          <button key={o.id} className={`occ-chip ${occasionId === o.id ? 'active' : ''}`}
            onClick={() => setOccasionId(occasionId === o.id ? null : o.id)}>
            <o.icon size={15} strokeWidth={2.4} />{o.name}
          </button>
        ))}
      </div>
      {occasion && (
        <motion.div key={occasion.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 10 }}>
          <BridgePreview palette={palette} effect={effectId} />
          <p className="note" style={{ marginTop: 8 }}>{occasion.line} You can fine-tune colors and effects after you book.</p>
          <div className="field" style={{ marginTop: 12 }}>
            <label>Name your moment (optional)</label>
            <input className="input" placeholder={occasion.placeholder} maxLength={40} value={momentName}
              onChange={(e) => setMomentName(e.target.value)} />
          </div>
        </motion.div>
      )}

      <Reveal as="p" className="section-label">
        <span className="lbl-badge"><Calendar size={13} strokeWidth={2.5} /></span>
        2 · Pick a date
      </Reveal>
      <StaggerGroup className="date-strip">
        {DATES.map((d) => (
          <StaggerItem
            key={d.id}
            className={`date-pill ${date === d.id ? 'active' : ''}`}
            onClick={() => chooseDate(d.id)}
            whileTap={{ scale: 0.94 }}
          >
            <div className="dp-label">{d.label.split(', ')[0]}</div>
            <div className="dp-label" style={{ fontSize: 12 }}>{d.label.split(', ')[1]}</div>
            <div className="dp-sub">{d.short ? `★ ${d.short}` : 'Open'}</div>
          </StaggerItem>
        ))}
      </StaggerGroup>
      {selectedDate?.tag && (
        <motion.div key={selectedDate.id} style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <span className="chip warn"><Star size={11} strokeWidth={2.5} /> {selectedDate.tag}</span>
          <SponsorLine label="Presented by" id={selectedDate.sponsorId} />
        </motion.div>
      )}

      <Reveal as="p" className="section-label">
        <span className="lbl-badge"><Clock size={13} strokeWidth={2.5} /></span>
        3 · Choose a time slot
      </Reveal>
      <StaggerGroup className="slot-grid">
        {SLOTS.map((s) => {
          const r = reservationFor(date, s.id)
          const mine = isSlotTaken(date, s.id)
          const taken = s.status === 'full' || !!r || mine
          const sub = mine ? 'Booked · you' : r ? `Booked · ${occasionById(r.occasionId).name}` : s.status === 'full' ? 'Sold out' : 'Available'
          return (
            <StaggerItem
              key={s.id}
              className={`slot ${slot === s.id ? 'active' : ''} ${taken ? 'booked' : ''}`}
              onClick={() => !taken && setSlot(s.id)}
              whileTap={!taken ? { scale: 0.94 } : {}}
            >
              <span className="slot-time">{s.label}</span>
              <span className="slot-sub">{sub}</span>
            </StaggerItem>
          )
        })}
      </StaggerGroup>
      <p className="slot-tally">
        {SLOTS.length - takenCount} of {SLOTS.length} slots open on {selectedDate?.label} — they go fast.
      </p>

      <Reveal as="p" className="section-label">
        <span className="lbl-badge"><HandCoins size={13} strokeWidth={2.5} /></span>
        4 · Select a donation tier
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
