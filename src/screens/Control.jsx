import { useEffect, useState, useRef } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TimerReset, Palette, Music, Play, Square, Clock3, BookOpen, Home as HomeIcon, Plus, Pencil, Upload, X,
  Sparkles, Wand2, Check,
} from 'lucide-react'
import Header from '../components/Header.jsx'
import BridgeArt from '../components/BridgeArt.jsx'
import { SponsorMark, SponsorLine } from '../components/SponsorMark.jsx'
import { useApp } from '../context/AppContext.jsx'
import { ZONES, TRACKS, SWATCHES } from '../data/dummy.js'
import { OCCASIONS, EFFECTS, SPONSORS, effectById, occasionById } from '../data/sample.js'
import { Reveal, StaggerGroup, StaggerItem } from '../components/Reveal.jsx'

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
const defaultColors = () => Object.fromEntries(ZONES.map((z) => [z.id, z.defaultColor]))

// Tiny line icon for each lighting zone, drawn in that zone's current color.
function ZoneIcon({ id, color }) {
  const common = { fill: 'none', stroke: color, strokeWidth: 2.4, strokeLinecap: 'round' }
  return (
    <span className="zone-icon">
      <svg viewBox="0 0 30 20">
        {id === 'deck' && <><line x1="1" y1="8" x2="29" y2="8" {...common} /><line x1="1" y1="13" x2="29" y2="13" {...common} /></>}
        {id === 'verticals' && [5, 11, 17, 23].map((x) => <line key={x} x1={x} y1="3" x2={x} y2="17" {...common} />)}
        {id === 'arch' && <path d="M2 17 Q15 -7 28 17" {...common} />}
      </svg>
    </span>
  )
}

// mode: 'live' (booked session) · 'demo' (public try-it) · 'design' (pre-session "make it yours")
export default function Control({ mode = 'live' }) {
  const navigate = useNavigate()
  const { booking, design, setDesign } = useApp()
  const isDemo = mode === 'demo'
  const isDesign = mode === 'design'

  // Session length from tier (e.g. "5 min" -> 300s). Short for demo feel.
  const mins = booking ? parseInt(booking.tier.duration) || 5 : (isDemo ? 30 : 5)
  const [left, setLeft] = useState(mins * 60)

  const seed = isDemo ? null : design
  const [tab, setTab] = useState('colors') // colors | effects | music
  const [colors, setColors] = useState(seed?.colors ?? defaultColors())
  const [effectId, setEffectId] = useState(seed?.effectId ?? 'steady')
  const [activeZone, setActiveZone] = useState(ZONES[0].id)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const customInputRef = useRef(null)

  // Music player — a single shared <audio> so only one track ever plays at once.
  const [customTrack, setCustomTrack] = useState(null) // { name, url }
  const [activeTrackId, setActiveTrackId] = useState(null) // TRACKS id or 'custom'
  const [isPlaying, setIsPlaying] = useState(false)
  const fileInputRef = useRef(null)
  const audioRef = useRef(null)

  // Countdown (not used while designing ahead of the reserved time).
  useEffect(() => {
    if (isDesign || left <= 0) return
    const t = setInterval(() => setLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [left, isDesign])

  // Release the uploaded file's object URL when it changes or the screen unmounts.
  useEffect(() => () => { if (customTrack?.url) URL.revokeObjectURL(customTrack.url) }, [customTrack])

  const flash = (msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2000)
  }

  if (!booking && !isDemo) return <Navigate to="/book" replace />

  const zoneName = (id) => ZONES.find((z) => z.id === id).name
  const effect = effectById(effectId)

  const setZoneColor = (hex) => {
    setColors((c) => ({ ...c, [activeZone]: hex }))
    flash(`${zoneName(activeZone)} → ${hex.toUpperCase()}`)
  }

  const chooseEffect = (e) => {
    setEffectId(e.id)
    flash(e.sponsorId ? `${e.name} — made possible by ${SPONSORS[e.sponsorId].name}` : `${e.name} on`)
  }

  const applyOccasion = (o) => {
    setColors({ ...o.palette })
    setEffectId(o.effect)
    flash(`${o.name} look applied`)
  }

  const playTrack = (id, src, name) => {
    const audio = audioRef.current
    if (!audio) return
    if (activeTrackId === id && isPlaying) {
      audio.pause()
      setIsPlaying(false)
      return
    }
    if (activeTrackId !== id) {
      audio.src = src
      setActiveTrackId(id)
    }
    audio.play()
      .then(() => flash(`Playing "${name}"`))
      .catch(() => {
        setIsPlaying(false)
        flash("Couldn't play that file — try a different track")
      })
    setIsPlaying(true)
  }

  const handleUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (customTrack?.url) URL.revokeObjectURL(customTrack.url)
    if (activeTrackId === 'custom') {
      audioRef.current?.pause()
      setIsPlaying(false)
      setActiveTrackId(null)
    }
    setCustomTrack({ name: file.name, url: URL.createObjectURL(file) })
    flash(`Uploaded "${file.name}"`)
    e.target.value = ''
  }

  const removeTrack = () => {
    if (activeTrackId === 'custom') {
      audioRef.current?.pause()
      setIsPlaying(false)
      setActiveTrackId(null)
    }
    if (customTrack?.url) URL.revokeObjectURL(customTrack.url)
    setCustomTrack(null)
  }

  const savePlan = () => {
    setDesign({ colors, effectId })
    navigate('/confirmation')
  }

  const ended = !isDesign && left <= 0
  const warn = !isDesign && left <= 30 && !ended
  const isCustom = !SWATCHES.some((hex) => hex.toLowerCase() === colors[activeZone].toLowerCase())

  if (ended) {
    return (
      <div className="screen pad-top center">
        <motion.div
          className="success-ring"
          style={{ borderColor: 'var(--warn)', color: 'var(--warn)', background: 'rgba(255,209,102,0.14)' }}
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          <Clock3 size={40} strokeWidth={2.2} />
        </motion.div>
        <Reveal delay={0.12}>
          <h2 className="h1" style={{ fontSize: 26 }}>Session complete</h2>
          <p className="lead">
            Your time's up — control has handed over to the next person in the queue.
            Thanks for lighting the Hoan!
          </p>
        </Reveal>
        <Reveal delay={0.2} className="bridge" style={{ marginTop: 18 }}>
          <BridgeArt {...colors} effect={effectId} />
        </Reveal>
        {booking?.sponsorId && (
          <div className="credit-bar"><SponsorLine label={`${booking.dateTag} presented by`} id={booking.sponsorId} /></div>
        )}
        <div className="fill" />
        <Reveal delay={0.28} className="footer-cta">
          <div className="btn-row">
            <motion.button className="btn btn-primary" onClick={() => navigate('/book')}
              whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <BookOpen size={16} strokeWidth={2.5} />
              Book another session
            </motion.button>
            <motion.button className="btn btn-secondary" onClick={() => navigate('/')}
              whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
              <HomeIcon size={16} strokeWidth={2.5} />
              Back to home
            </motion.button>
          </div>
        </Reveal>
      </div>
    )
  }

  const tabs = [
    { id: 'colors', label: 'Colors', Icon: Palette },
    { id: 'effects', label: 'Effects', Icon: Sparkles },
    ...(isDesign ? [] : [{ id: 'music', label: 'Music', Icon: Music }]),
  ]

  return (
    <div className="screen">
      <Header
        title={isDesign ? 'Make it yours' : isDemo ? 'Try it' : 'Live control'}
        back={isDesign ? '/confirmation' : '/'}
      />

      {isDesign ? (
        <motion.div className="sponsor-banner" style={{ marginBottom: 14 }}
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div>
            <div className="sb-title">{booking.momentName || occasionById(booking.occasionId)?.name || 'Your moment'}</div>
            <div className="sb-sub">{booking.date} · {booking.slot} · lights go live at your reserved time</div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className={`timer-bar ${warn ? 'warn' : ''}`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div>
            <div className="timer-label">
              <TimerReset size={11} strokeWidth={2.5} />
              Your session
            </div>
            <div className={`timer-val ${warn ? 'warn' : ''}`}>{fmt(left)}</div>
          </div>
          <div className="badge-live">On air</div>
        </motion.div>
      )}

      {mode === 'live' && booking?.sponsorId && (
        <div className="sponsor-banner" style={{ marginBottom: 14 }}>
          <div>
            <div className="sb-title">Tonight: {booking.dateTag}</div>
            <div className="sb-sub">Presented by</div>
          </div>
          <SponsorMark id={booking.sponsorId} size="md" />
        </div>
      )}

      <Reveal delay={0.06} className="bridge" style={{ margin: '0 0 6px' }}>
        <BridgeArt {...colors} effect={effectId} active={activeZone} labels onSelect={setActiveZone} />
      </Reveal>
      <p className="note" style={{ marginTop: 2 }}>
        {isDesign ? 'Preview of your moment' : 'Live preview · changes push to the Hoan Bridge'} · tap the bridge to pick a part
      </p>
      <div className="fx-credit">
        {effect?.sponsorId
          ? <><span>{effect.name}</span><SponsorLine label="made possible by" id={effect.sponsorId} /></>
          : <span>{effect?.name}</span>}
      </div>

      <Reveal delay={0.1} className="tabs" style={{ marginTop: 14 }}>
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
            {tab === id && (
              <motion.div className="tab-indicator" layoutId="tab-indicator"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
            )}
            <Icon size={14} strokeWidth={2.5} />
            {label}
          </button>
        ))}
      </Reveal>

      <AnimatePresence mode="wait">
        {tab === 'colors' && (
          <motion.div
            key="colors"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <p className="section-label" style={{ marginTop: 4 }}>Start from a moment</p>
            <div className="preset-row">
              {OCCASIONS.map((o) => (
                <button key={o.id} className="occ-chip" onClick={() => applyOccasion(o)}>
                  <o.icon size={15} strokeWidth={2.4} />{o.name}
                </button>
              ))}
            </div>

            <p className="section-label" style={{ marginTop: 14 }}>Parts of the bridge</p>
            <StaggerGroup>
              {ZONES.map((z) => (
                <StaggerItem
                  key={z.id}
                  className="zone-row"
                  style={{ borderColor: activeZone === z.id ? 'var(--brand)' : 'var(--line)' }}
                  onClick={() => setActiveZone(z.id)}
                  whileTap={{ scale: 0.98 }}
                >
                  <ZoneIcon id={z.id} color={colors[z.id]} />
                  <div className="zone-info">
                    <div className="zone-name">{z.name}</div>
                    <div className="zone-hex">{colors[z.id].toUpperCase()}</div>
                    <div className="zone-hint">{z.hint}</div>
                  </div>
                  <input
                    className="zone-color-input"
                    type="color"
                    value={colors[z.id]}
                    onChange={(e) => { setActiveZone(z.id); setColors((c) => ({ ...c, [z.id]: e.target.value })) }}
                    onClick={(e) => { e.stopPropagation(); setActiveZone(z.id) }}
                  />
                </StaggerItem>
              ))}
            </StaggerGroup>

            <p className="section-label">
              Quick palette · <span style={{ color: 'var(--brand)' }}>{zoneName(activeZone)}</span>
            </p>
            <StaggerGroup className="swatch-grid">
              {SWATCHES.map((hex) => (
                <StaggerItem
                  key={hex}
                  className={`swatch ${colors[activeZone] === hex ? 'active' : ''}`}
                  style={{ background: hex }}
                  onClick={() => setZoneColor(hex)}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
              {isCustom ? (
                <StaggerItem
                  className="swatch swatch-custom active"
                  style={{ background: colors[activeZone] }}
                  onClick={() => customInputRef.current?.click()}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Pencil size={13} strokeWidth={2.5} />
                </StaggerItem>
              ) : (
                <StaggerItem
                  className="swatch swatch-custom"
                  onClick={() => customInputRef.current?.click()}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Plus size={15} strokeWidth={2.5} />
                </StaggerItem>
              )}
              <input
                ref={customInputRef}
                type="color"
                value={colors[activeZone]}
                onChange={(e) => setZoneColor(e.target.value)}
                style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
              />
            </StaggerGroup>
            <p className="note" style={{ marginTop: 14 }}>
              Tap a part of the bridge to select it, then pick a quick color or customize your own.
            </p>
          </motion.div>
        )}

        {tab === 'effects' && (
          <motion.div
            key="effects"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <StaggerGroup className="show-list" style={{ marginTop: 4 }}>
              {EFFECTS.map((e) => {
                const on = effectId === e.id
                return (
                  <StaggerItem
                    key={e.id}
                    as="button"
                    className={`show-card ${on ? 'playing' : ''}`}
                    onClick={() => chooseEffect(e)}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="show-play">
                      {on ? <Check size={16} strokeWidth={3} /> : <Wand2 size={15} strokeWidth={2.4} />}
                    </span>
                    <span style={{ flex: 1 }}>
                      <span className="show-name" style={{ display: 'block' }}>{e.name}</span>
                      <span className="show-desc" style={{ display: 'block' }}>{e.desc}</span>
                      {e.sponsorId && (
                        <span className="effect-credit">
                          <span className="effect-badge">Signature effect</span>
                          Made possible by <SponsorMark id={e.sponsorId} size="sm" />
                        </span>
                      )}
                    </span>
                  </StaggerItem>
                )
              })}
            </StaggerGroup>
            <p className="note" style={{ marginTop: 14 }}>
              Effects are curated by Light the Hoan to protect the experience and the existing lighting program.
            </p>
          </motion.div>
        )}

        {tab === 'music' && (
          <motion.div
            key="shows"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <Reveal className={`show-card upload-card ${customTrack ? 'has-track' : ''}`} style={{ marginBottom: 12 }}>
              {customTrack ? (
                <>
                  <button
                    className="show-play"
                    onClick={() => playTrack('custom', customTrack.url, customTrack.name)}
                    aria-label={activeTrackId === 'custom' && isPlaying ? 'Pause' : 'Play'}
                  >
                    {activeTrackId === 'custom' && isPlaying
                      ? <Square size={14} strokeWidth={2.5} fill="currentColor" />
                      : <Play size={14} strokeWidth={2.5} fill="currentColor" />}
                  </button>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="show-name" style={{ display: 'block' }}>Your track</span>
                    <span className="show-desc" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{customTrack.name}</span>
                  </span>
                  <button className="iconbtn ghost" onClick={removeTrack} aria-label="Remove track">
                    <X size={16} strokeWidth={2.5} />
                  </button>
                </>
              ) : (
                <button className="upload-trigger" onClick={() => fileInputRef.current?.click()}>
                  <span className="show-play"><Upload size={14} strokeWidth={2.5} /></span>
                  <span style={{ flex: 1 }}>
                    <span className="show-name" style={{ display: 'block' }}>Upload your own music</span>
                    <span className="show-desc" style={{ display: 'block' }}>MP3, WAV, or M4A · plays locally on your phone</span>
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleUpload}
                style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
              />
            </Reveal>

            <StaggerGroup className="show-list">
              {TRACKS.map((t) => (
                <StaggerItem
                  key={t.id}
                  as="button"
                  className={`show-card ${activeTrackId === t.id && isPlaying ? 'playing' : ''}`}
                  onClick={() => playTrack(t.id, t.src, t.name)}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="show-play">
                    {activeTrackId === t.id && isPlaying
                      ? <Square size={14} strokeWidth={2.5} fill="currentColor" />
                      : <Play size={14} strokeWidth={2.5} fill="currentColor" />}
                  </span>
                  <span style={{ flex: 1 }}>
                    <span className="show-name" style={{ display: 'block' }}>{t.name}</span>
                    <span className="show-desc" style={{ display: 'block' }}>{t.desc}</span>
                  </span>
                </StaggerItem>
              ))}
            </StaggerGroup>
            <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
            <p className="note" style={{ marginTop: 6 }}>
              Tracks play locally on your phone, synced to the bridge for zero latency.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="credit-bar" style={{ marginTop: 22 }}>
        <SponsorLine label="Experience technology by" id="founding" />
      </div>

      {isDesign && (
        <div className="footer-cta">
          <motion.button className="btn btn-primary" onClick={savePlan}
            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Check size={17} strokeWidth={3} />
            Save my lighting plan
          </motion.button>
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 12, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 12, x: '-50%' }}
            transition={{ duration: 0.22 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
