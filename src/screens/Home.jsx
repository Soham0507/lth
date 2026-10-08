import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Palette, ArrowRight, LogIn, CalendarDays, Gift } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { Reveal, StaggerGroup, StaggerItem } from '../components/Reveal.jsx'
import BridgePreview from '../components/BridgePreview.jsx'
import { SponsorMark, SponsorLine } from '../components/SponsorMark.jsx'
import { DATES, SLOTS } from '../data/dummy.js'
import {
  OCCASIONS, EXPERIENCES, SPONSORS, occasionById,
  reservationsOn, reservationFor, openSlotsOn,
} from '../data/sample.js'

const easeOut = [0.22, 1, 0.36, 1]
// Surprise moments (proposals, reveals) keep their colors secret until showtime.
const SECRET_PALETTE = { deck: '#ffffff', verticals: '#ffffff', arch: '#ffffff' }

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
        {tonight.sponsorId && <SponsorLine label="Presented by" id={tonight.sponsorId} />}
      </div>

      {now && (
        <>
          <div style={{ padding: '0 14px 12px 18px' }}>
            <BridgePreview palette={palette} effect={now.secret ? 'steady' : now.effect} />
          </div>
          <div className="tonight-now">
            <div className="tn-title">{now.title}</div>
            <div className="tn-meta">
              {now.slotLabel} · {nowOcc.name}
              {now.secret ? ' · colors revealed at showtime' : ''}
            </div>
          </div>
        </>
      )}

      <div className="tonight-list" style={{ marginTop: 14 }}>
        {SLOTS.map((s) => {
          const r = reservationFor(tonight.id, s.id)
          const isNow = r && now && r === now
          if (r) {
            const Icon = occasionById(r.occasionId).icon
            return (
              <div key={s.id} className={`tonight-row ${isNow ? 'current' : ''}`}>
                <span className="t">{s.label}</span>
                <Icon size={14} strokeWidth={2.4} style={{ color: 'var(--cyan)', flex: '0 0 auto' }} />
                <span className="n">{r.title}</span>
                <Dots palette={r.secret ? SECRET_PALETTE : r.palette} />
              </div>
            )
          }
          if (s.status === 'full') {
            return (
              <div key={s.id} className="tonight-row" style={{ opacity: 0.55 }}>
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
    return [...res, ...nights].sort((a, b) => a.sort.localeCompare(b.sort)).slice(0, 8)
  }, [])

  const openTonight = openSlotsOn(DATES[0].id).slice(0, 4)

  return (
    <div className="hero-page">
      {/* Floating nav */}
      <motion.nav
        className="hero-nav"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOut }}
      >
        <img src="/lth-logo.png" alt="Light the Hoan" className="hero-logo" />
        <div className="badge-live">Live tonight</div>
      </motion.nav>

      {/* Bridge video */}
      <motion.div
        className="hero-bridge-wrap"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: easeOut }}
      >
        <video
          className="hero-bridge-photo"
          src="/hoan-bridge-hero.mp4"
          poster="/hoan-bridge-2.jpg"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="hero-bridge-fade" />
      </motion.div>

      {/* Main content */}
      <div className="hero-body">
        <StaggerGroup className="hero-inner">
          <StaggerItem as="p" className="eyebrow">Milwaukee · Hoan Bridge</StaggerItem>
          <StaggerItem as="h1" className="hero-h1">
            <span className="hero-h1-color">Your moment.<br />Your colors.</span><br />Your Hoan.
          </StaggerItem>
          <StaggerItem as="p" className="hero-lead">
            Reserve a moment on Milwaukee’s iconic bridge, choose your colors and effects,
            then watch the skyline become part of your story.
          </StaggerItem>

          <StaggerItem style={{ width: '100%', marginTop: 34 }}>
            <TonightCard onReserve={go} />
          </StaggerItem>

          <StaggerItem className="btn-row hero-cta">
            <motion.button
              className="btn btn-primary"
              onClick={() => go()}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              {user ? 'Reserve a moment' : 'Get started'}
              <ArrowRight size={18} strokeWidth={2.5} />
            </motion.button>
            <motion.button
              className="btn btn-ghost"
              onClick={() => navigate('/try')}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Palette size={17} strokeWidth={2.2} />
              Try the color picker
            </motion.button>
            {!user && (
              <motion.button
                className="btn btn-ghost"
                onClick={() => navigate('/login')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <LogIn size={16} strokeWidth={2.2} />
                I already have an account
              </motion.button>
            )}
          </StaggerItem>

          <StaggerItem className="credit-bar">
            <SponsorLine label="Experience technology by" id="founding" />
          </StaggerItem>
        </StaggerGroup>
      </div>

      <div className="home-sections">
        {/* ── Occasions ── */}
        <section className="home-block" style={{ marginTop: 20 }}>
          <Reveal className="home-block-head">
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
                whileTap={{ scale: 0.98 }}
              >
                <BridgePreview palette={o.palette} />
                <span className="occasion-name"><o.icon size={16} strokeWidth={2.4} />{o.name}</span>
                <span className="occasion-line">{o.line}</span>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>

        {/* ── What's coming up ── */}
        <section className="home-block">
          <Reveal className="home-block-head">
            <p className="eyebrow">On the calendar</p>
            <h2>Coming up on the Hoan.</h2>
            <p>Milwaukee is already booking its moments. Find an open time and add yours.</p>
          </Reveal>
          <StaggerGroup className="feed">
            {feed.map((item) => {
              if (item.kind === 'night') {
                const d = item.d
                return (
                  <StaggerItem key={item.key} className="feed-item" style={{ borderColor: 'rgba(247,168,0,0.35)' }}>
                    <span className="feed-icon" style={{ color: 'var(--brand-2)' }}><CalendarDays size={19} strokeWidth={2.2} /></span>
                    <div className="feed-body">
                      <div className="feed-title">{d.tag}</div>
                      <div className="feed-meta">{d.label} · Experience Night</div>
                      <div className="feed-gifted"><SponsorLine label="Presented by" id={d.sponsorId} /></div>
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
                    <div className="feed-meta">
                      {r.dateLabel} · {r.slotLabel} · {o.name}
                    </div>
                    {r.giftedBy && (
                      <div className="feed-gifted"><Gift size={12} strokeWidth={2.4} /><SponsorLine label="Gifted by" id={r.giftedBy} /></div>
                    )}
                  </div>
                  <Dots palette={r.secret ? SECRET_PALETTE : r.palette} />
                </StaggerItem>
              )
            })}
          </StaggerGroup>
          <Reveal className="feed-open" style={{ marginTop: 12 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Open tonight · {DATES[0].label}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Pick a time and you’re on the bridge.</div>
            </div>
            <div className="slot-chips">
              {openTonight.map((s) => (
                <button key={s.id} className="slot-chip" onClick={() => go({ dateId: DATES[0].id, slotId: s.id })}>{s.label}</button>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ── Sponsored experiences ── */}
        <section className="home-block">
          <Reveal className="home-block-head">
            <p className="eyebrow">Made possible by Milwaukee</p>
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
                whileTap={{ scale: 0.98 }}
              >
                <BridgePreview palette={x.palette} effect={x.effect} />
                <span className="exp-body">
                  <span className="exp-kind">{x.kind}</span>
                  <span className="exp-title">{x.title}</span>
                  <span className="exp-desc">{x.desc}</span>
                  <span className="exp-credit">
                    {SPONSORS[x.sponsorId].placeholder ? 'Made possible by' : 'Presented by'}
                    <SponsorMark id={x.sponsorId} size="sm" />
                  </span>
                </span>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>

        {/* ── Partners ── */}
        <section className="home-block">
          <Reveal className="partners">
            <div className="p-label">Founding Technology Partner</div>
            <SponsorMark id="founding" size="lg" />
            <p className="p-sub">Helping launch the technology that lets Milwaukee experience the Hoan.</p>
            <hr />
            <div className="p-label">Experience partners</div>
            <div className="p-row">
              <SponsorMark id="weenergies" />
              <SponsorMark id="molsoncoors" />
              <SponsorMark id="visitmke" />
            </div>
          </Reveal>
        </section>

        <p className="home-foot">
          Light the Hoan Experience · Designed to enhance — not replace — traditional bridge lightings.<br />
          Sample reservations and sponsor placements are shown for illustration.
        </p>
      </div>
    </div>
  )
}
