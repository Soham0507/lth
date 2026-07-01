import { useEffect, useState, useRef } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { TimerReset, Palette, Music, Play, Square, Clock3, BookOpen, Home as HomeIcon, Plus, Pencil, Upload, X } from 'lucide-react'
import Header from '../components/Header.jsx'
import BridgeArt from '../components/BridgeArt.jsx'
import { useApp } from '../context/AppContext.jsx'
import { ZONES, TRACKS, SWATCHES } from '../data/dummy.js'
import { Reveal, StaggerGroup, StaggerItem } from '../components/Reveal.jsx'

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

export default function Control({ demo = false }) {
  const navigate = useNavigate()
  const { booking } = useApp()

  // Session length from tier (e.g. "5 min" -> 300s). Short for demo feel.
  const mins = booking ? parseInt(booking.tier.duration) || 5 : (demo ? 30 : 5)
  const [left, setLeft] = useState(mins * 60)

  const [tab, setTab] = useState('colors') // colors | shows
  const [colors, setColors] = useState(
    Object.fromEntries(ZONES.map((z) => [z.id, z.defaultColor]))
  )
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

  // Countdown.
  useEffect(() => {
    if (left <= 0) return
    const t = setInterval(() => setLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [left])

  // Release the uploaded file's object URL when it changes or the screen unmounts.
  useEffect(() => () => { if (customTrack?.url) URL.revokeObjectURL(customTrack.url) }, [customTrack])

  const flash = (msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 1600)
  }

  if (!booking && !demo) return <Navigate to="/book" replace />

  const setZoneColor = (hex) => {
    setColors((c) => ({ ...c, [activeZone]: hex }))
    flash(`${ZONES.find((z) => z.id === activeZone).name} → ${hex.toUpperCase()}`)
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

  const ended = left <= 0
  const warn = left <= 30 && !ended
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
          <BridgeArt cables={colors.cables} towers={colors.towers} deck={colors.deck} />
        </Reveal>
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

  return (
    <div className="screen">
      <Header title="Live control" back="/" />

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

      <Reveal delay={0.06} className="bridge" style={{ margin: '0 0 6px' }}>
        <BridgeArt cables={colors.cables} towers={colors.towers} deck={colors.deck} />
      </Reveal>
      <p className="note" style={{ marginTop: 2 }}>Live preview · changes push to the Hoan Bridge</p>

      <Reveal delay={0.1} className="tabs" style={{ marginTop: 14 }}>
        {tab === 'colors' && <motion.div className="tab-indicator" layoutId="tab-indicator" transition={{ type: 'spring', stiffness: 400, damping: 32 }} style={{ left: 5 }} />}
        {tab === 'shows' && <motion.div className="tab-indicator" layoutId="tab-indicator" transition={{ type: 'spring', stiffness: 400, damping: 32 }} style={{ right: 5, left: 'auto' }} />}
        <button className={`tab ${tab === 'colors' ? 'active' : ''}`} onClick={() => setTab('colors')}>
          <Palette size={14} strokeWidth={2.5} />
          Zone colors
        </button>
        <button className={`tab ${tab === 'shows' ? 'active' : ''}`} onClick={() => setTab('shows')}>
          <Music size={14} strokeWidth={2.5} />
          Play Music
        </button>
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
            <StaggerGroup>
              {ZONES.map((z) => (
                <StaggerItem
                  key={z.id}
                  className="zone-row"
                  style={{ borderColor: activeZone === z.id ? 'var(--brand)' : 'var(--line)' }}
                  onClick={() => setActiveZone(z.id)}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="zone-swatch" style={{ background: colors[z.id], '--zone-glow': colors[z.id] }} />
                  <div className="zone-info">
                    <div className="zone-name">{z.name}</div>
                    <div className="zone-hex">{colors[z.id].toUpperCase()}</div>
                  </div>
                  <input
                    className="zone-color-input"
                    type="color"
                    value={colors[z.id]}
                    onChange={(e) => { setActiveZone(z.id); setColors((c) => ({ ...c, [z.id]: e.target.value })) }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </StaggerItem>
              ))}
            </StaggerGroup>

            <p className="section-label">
              Quick palette · <span style={{ color: 'var(--brand)' }}>{ZONES.find((z) => z.id === activeZone).name}</span>
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
              Tap a zone to select it, then pick a quick color or customize your own.
            </p>
          </motion.div>
        )}

        {tab === 'shows' && (
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
