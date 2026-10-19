import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Palette, ArrowRight, CalendarDays, Gift, Check, ArrowUpRight } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { Reveal, StaggerGroup, StaggerItem } from '../components/Reveal.jsx'
import BridgePreview from '../components/BridgePreview.jsx'
import { SponsorMark, SponsorLine, PartnerCard } from '../components/SponsorMark.jsx'
import { DATES, SLOTS } from '../data/dummy.js'
import {
  OCCASIONS, EXPERIENCES, SPONSORS, occasionById,
  reservationsOn, reservationFor, openSlotsOn,
} from '../data/sample.js'

const easeOut = [0.22, 1, 0.36, 1]
// Surprise moments (proposals, reveals) keep their colors secret until showtime.
const SECRET_PALETTE = { deck: '#ffffff', verticals: '#ffffff', arch: '#ffffff' }

const STEPS = [
  { t: 'Discover', d: 'Browse upcoming Experience Nights, open dates, effects and viewing tips.' },
  { t: 'Reserve', d: 'Pick an available date and time for your moment on the Hoan.' },
  { t: 'Make it yours', d: 'Choose from a curated color wheel and approved lighting effects.' },
  { t: 'Experience', d: 'At your time, interact with the bridge live — then capture and share it.' },
]

const FOUNDING_PERKS = [
  'Exclusive Founding Technology Partner designation',
  'Permanent recognition of the founding role',
  'Prominent launch and website recognition',
  'Exclusive partner Experience Nights and activations',
  'Private pre-launch experience for employees, members or guests',
]

const Dots = ({ palette }) => (
  <span className="dots" aria-hidden="true">
    {['deck', 'verticals', 'arch'].map((z) => <i key={z} style={{ background: palette[z] }} />)}
  </span>
)

// "Live tonight" — the lineup for tonight with a cycling preview of whichever moment is on the bridge.
function TonightCard({ onReserve }) {
  const tonight = DATES[0]
  const booked = useMemo(() => reservationsOn(tonight.id), [tonight.id])
  const [i, setI] = useState(0)

  useEffect(() => {
    if (booked.length < 2) return
    const t = setInterval(() => setI((n) => (n + 1) % booked.length), 5200)
    return () => clearInterval(t)
  }, [booked.length])

  const now = booked[i]
  const nowOcc = now && occasionById(now.occasionId)
  const palette = now ? (now.secret ? SECRET_PALETTE : now.palette) : SECRET_PALETTE

  return (
    <div className="tonight-card">
      <div className="tonight-top">
        <div className="badge-live">Live tonight{tonight.tag ? ` · ${tonight.tag}` : ''}</div>
        <span className="chip">{tonight.label}</span>
      </div>

      {tonight.sponsorId && (
        <div className="tonight-sponsor">
          <span>Tonight presented by</span>
          <SponsorMark id={tonight.sponsorId} size="lg" />
        </div>
      )}

      {now && (
        <div style={{ padding: '0 18px' }}>
          <BridgePreview palette={palette} effect={now.secret ? 'steady' : now.effect} />
        </div>
      )}
      {now && (
        <div className="tonight-now">
          <div className="tn-title">{now.title}</div>
          <div className="tn-meta">
            {now.slotLabel} · {nowOcc.name}
            {now.secret ? ' · colors revealed at showtime' : ''}
          </div>
        </div>
      )}

      <div className="tonight-list">
        {SLOTS.map((s) => {
          const r = reservationFor(tonight.id, s.id)
          const isNow = r && now && r === now
          if (r) {
            const Icon = occasionById(r.occasionId).icon
            return (
              <div key={s.id} className={`tonight-row ${isNow ? 'current' : ''}`}>
                <span className="t">{s.label}</span>
                <Icon size={15} strokeWidth={2.2} style={{ color: 'var(--brand)', flex: '0 0 auto' }} />
                <span className="n">{r.title}</span>
                <Dots palette={r.secret ? SECRET_PALETTE : r.palette} />
              </div>
            )
          }
          if (s.status === 'full') {
            return (
              <div key={s.id} className="tonight-row" style={{ opacity: 0.6 }}>
                <span className="t">{s.label}</span>
                <span className="n">Reserved · private moment</span>
              </div>
            )
          }
          return (
            <div key={s.id} className="tonight-row open">
              <span className="t">{s.label}</span>
              <span className="n">Open</span>
              <button onClick={() => onReserve({ dateId: tonight.id, slotId: s.id })}>Reserve</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Glass card over the hero video: what's on the bridge right now.
function HeroLive({ onReserve }) {
  const tonight = DATES[0]
  const booked = useMemo(() => reservationsOn(tonight.id), [tonight.id])
  const [i, setI] = useState(0)
  useEffect(() => {
    if (booked.length < 2) return
    const t = setInterval(() => setI((n) => (n + 1) % booked.length), 5200)
    return () => clearInterval(t)
  }, [booked.length])
  const now = booked[i]
  const open = openSlotsOn(tonight.id).slice(0, 3)
  if (!now) return null
  const palette = now.secret ? SECRET_PALETTE : now.palette
  return (
    <div className="live-glass">
      <div className="badge-live">Live tonight{tonight.tag ? ` · ${tonight.tag}` : ''}</div>
      <BridgePreview palette={palette} effect={now.secret ? 'steady' : now.effect} />
      <div>
        <div className="lg-title">{now.title}</div>
        <div className="lg-meta">{now.slotLabel} · {occasionById(now.occasionId).name}{now.secret ? ' · colors revealed at showtime' : ''}</div>
      </div>
      <div className="lg-open">
        <span>Open tonight</span>
        {open.map((s) => (
          <button key={s.id} onClick={() => onReserve({ dateId: tonight.id, slotId: s.id })}>{s.label}</button>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { user, setIntent } = useApp()

  const go = (intent = null) => {
    setIntent(intent)
    navigate(user ? '/book' : '/login')
  }

  // Upcoming reservations + sponsored nights, in calendar order. Tonight is already
  // covered by the lineup card, and we take at most two moments per night so the list
  // reads as a busy calendar rather than one packed evening.
  const feed = useMemo(() => {
    const upcoming = DATES.slice(1, 6)
    const res = upcoming.flatMap((d) => reservationsOn(d.id).slice(0, 2))
      .map((r) => ({ kind: 'res', key: `${r.dateId}|${r.slotId}`, sort: `${r.dateId} ${r.slotId}`, r }))
    const nights = upcoming.filter((d) => d.sponsorId)
      .map((d) => ({ kind: 'night', key: `night-${d.id}`, sort: `${d.id} 00:00`, d }))
    return [...res, ...nights].sort((a, b) => a.sort.localeCompare(b.sort)).slice(0, 7)
  }, [])

  const openTonight = openSlotsOn(DATES[0].id).slice(0, 4)

  return (
    <div className="home">
      {/* ── Hero: the partner's logo leads, then the story ── */}
      <section className="hero">
        <video className="hero-video" src="/hoan-bridge-hero.mp4" poster="/hoan-bridge-2.jpg"
          autoPlay loop muted playsInline preload="auto" aria-hidden="true" />
        <div className="hero-scrim" />
        <div className="hero-grid">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: easeOut }}
          >
            <PartnerCard id="founding" label="Presented by" />

            <p className="eyebrow">Light the Hoan Experience · Milwaukee</p>
            <h1 className="hero-h1">
              Your moment.<br /><em>Your colors.</em><br />Your Hoan.
            </h1>
            <p className="hero-lead">
              Reserve a moment on Milwaukee’s iconic bridge, choose your colors and effects,
              then watch the skyline become part of your story.
            </p>
            <div className="hero-cta">
              <motion.button className="btn btn-primary lg" onClick={() => go()} whileTap={{ scale: 0.98 }}>
                {user ? 'Reserve a moment' : 'Get started'}
                <ArrowRight size={18} strokeWidth={2.4} />
              </motion.button>
              <motion.button className="btn btn-glass lg" onClick={() => navigate('/try')} whileTap={{ scale: 0.98 }}>
                <Palette size={17} strokeWidth={2.2} />
                Try the color picker
              </motion.button>
            </div>
            <div className="hero-facts">
              <div className="hero-fact"><b>Sunset to midnight</b><span>Public Experience Nights</span></div>
              <div className="hero-fact"><b>Up to 2 weeks ahead</b><span>Reservation window</span></div>
              <div className="hero-fact"><b>Curated colors</b><span>Approved effects only</span></div>
            </div>
          </motion.div>

          <motion.div
            className="hero-live"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut, delay: 0.15 }}
          >
            <HeroLive onReserve={go} />
          </motion.div>
        </div>
      </section>

      <div className="container">
        {/* ── How it works ── */}
        <section className="section" id="how">
          <Reveal className="section-head">
            <p className="eyebrow">How it works</p>
            <h2>Simple to reserve. Unforgettable to experience.</h2>
            <p>The Light the Hoan website remains the front door; the Experience powers booking and control.</p>
          </Reveal>
          <StaggerGroup className="steps">
            {STEPS.map((s, i) => (
              <StaggerItem key={s.t} className="card step">
                <div className="step-num">{i + 1}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>

        {/* ── Occasions ── */}
        <section className="section" id="moments">
          <Reveal className="section-head">
            <p className="eyebrow">The experience</p>
            <h2>Imagine your moment on the Hoan.</h2>
            <p>Reserve it much like a special dinner, then watch the bridge become part of your story.</p>
          </Reveal>
          <StaggerGroup className="occasion-grid">
            {OCCASIONS.map((o) => (
              <StaggerItem
                key={o.id}
                as="button"
                className="occasion-card"
                onClick={() => go({ occasionId: o.id })}
                whileTap={{ scale: 0.99 }}
              >
                <BridgePreview palette={o.palette} />
                <span className="occasion-name"><o.icon size={17} strokeWidth={2.3} />{o.name}</span>
                <span className="occasion-line">{o.line}</span>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>

        {/* ── Calendar ── */}
        <section className="section" id="calendar">
          <Reveal className="section-head">
            <p className="eyebrow">On the calendar</p>
            <h2>Milwaukee is already booking its moments.</h2>
            <p>See tonight’s lineup, what’s coming up, and grab an open time.</p>
          </Reveal>
          <div className="calendar-grid">
            <Reveal><TonightCard onReserve={go} /></Reveal>
            <div>
              <StaggerGroup className="feed">
                {feed.map((item) => {
                  if (item.kind === 'night') {
                    const d = item.d
                    return (
                      <StaggerItem key={item.key} className="feed-item night">
                        <span className="feed-icon"><CalendarDays size={19} strokeWidth={2.2} /></span>
                        <div className="feed-body">
                          <div className="feed-title">{d.tag}</div>
                          <div className="feed-meta">{d.label} · Experience Night</div>
                          <div className="feed-gifted"><SponsorLine label="Presented by" id={d.sponsorId} size="md" /></div>
                        </div>
                        <button className="slot-chip" onClick={() => go({ dateId: d.id })}>Reserve</button>
                      </StaggerItem>
                    )
                  }
                  const r = item.r
                  const o = occasionById(r.occasionId)
                  return (
                    <StaggerItem key={item.key} className="feed-item">
                      <span className="feed-icon"><o.icon size={19} strokeWidth={2.2} /></span>
                      <div className="feed-body">
                        <div className="feed-title">{r.title}</div>
                        <div className="feed-meta">{r.dateLabel} · {r.slotLabel} · {o.name}</div>
                        {r.giftedBy && (
                          <div className="feed-gifted"><Gift size={13} strokeWidth={2.3} color="var(--muted)" /><SponsorLine label="Gifted by" id={r.giftedBy} /></div>
                        )}
                      </div>
                      <Dots palette={r.secret ? SECRET_PALETTE : r.palette} />
                    </StaggerItem>
                  )
                })}
              </StaggerGroup>
              <Reveal className="feed-open" style={{ marginTop: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>Open tonight · {DATES[0].label}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>Pick a time and you’re on the bridge.</div>
                </div>
                <div className="slot-chips">
                  {openTonight.map((s) => (
                    <button key={s.id} className="slot-chip" onClick={() => go({ dateId: DATES[0].id, slotId: s.id })}>{s.label}</button>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Sponsored experiences ── */}
        <section className="section" id="experiences">
          <Reveal className="section-head">
            <p className="eyebrow">Partner experiences</p>
            <h2>Experiences with a story.</h2>
            <p>
              Partners add Experience Nights, signature experiences and limited-edition effects —
              enhancing the bridge, never covering it.
            </p>
          </Reveal>
          <StaggerGroup className="exp-grid">
            {EXPERIENCES.map((x) => (
              <StaggerItem
                key={x.id}
                as="button"
                className="exp-card"
                onClick={() => go({ experienceId: x.id, occasionId: x.occasionId })}
                whileTap={{ scale: 0.99 }}
              >
                <span className="exp-logo">
                  <SponsorMark id={x.sponsorId} size="lg" />
                  <span className="el-label">
                    {SPONSORS[x.sponsorId].placeholder ? 'Made possible by' : 'Presented by'}
                  </span>
                </span>
                <BridgePreview palette={x.palette} effect={x.effect} />
                <span className="exp-body">
                  <span className="exp-kind">{x.kind}</span>
                  <span className="exp-title">{x.title}</span>
                  <span className="exp-desc">{x.desc}</span>
                  <span className="exp-cta">Reserve this experience <ArrowUpRight size={15} strokeWidth={2.4} /></span>
                </span>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>
      </div>

      {/* ── Partners ── */}
      <section className="partners-band" id="partners">
        <div className="container partners-grid">
          <Reveal>
            <p className="eyebrow">Founding Technology Partners</p>
            <h2>Help launch what’s next for Milwaukee.</h2>
            <p>
              The Founding Technology Partners help turn the Hoan from something Milwaukee watches
              into something Milwaukee can experience — and are recognized at every step.
            </p>
            <ul className="perk-list">
              {FOUNDING_PERKS.map((p) => (
                <li key={p}><Check size={16} strokeWidth={3} />{p}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="founding-tile">
              <span className="ft-label">Founding Technology Partners</span>
              <SponsorMark id="founding" size="xl" block />
              <span className="ft-sub">Helping launch the technology that lets Milwaukee experience the Hoan.</span>
              <hr />
              <span className="ft-label">Experience partner</span>
              <div className="partner-row">
                <SponsorMark id="molsoncoors" size="lg" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="site-foot">
        <div className="container site-foot-inner">
          <img src="/lth-logo.png" alt="Light the Hoan" />
          <span>
            Designed to enhance — not replace — traditional bridge lightings.
            Sample reservations and sponsor placements are shown for illustration.
          </span>
        </div>
      </footer>
    </div>
  )
}
