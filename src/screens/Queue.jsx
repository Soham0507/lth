import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PartyPopper, Play } from 'lucide-react'
import Header from '../components/Header.jsx'
import { useApp } from '../context/AppContext.jsx'
import { Reveal } from '../components/Reveal.jsx'

export default function Queue() {
  const navigate = useNavigate()
  const { booking } = useApp()
  const [pos, setPos] = useState(3) // people ahead of you

  // Dummy queue progression.
  useEffect(() => {
    if (pos <= 0) return
    const t = setTimeout(() => setPos((p) => p - 1), 2200)
    return () => clearTimeout(t)
  }, [pos])

  if (!booking) return <Navigate to="/book" replace />

  const yourTurn = pos <= 0
  const total = 4

  // Duration-aware wait: each person ahead has the same tier duration as you.
  const tierMins = parseInt(booking.tier.duration) || 5
  const wait = pos * tierMins

  return (
    <div className="screen pad-top center">
      <Header title="Queue" back="/" />

      <div className="badge-live" style={{ justifyContent: 'center', marginTop: 6 }}>
        Live · {booking.date} · {booking.window}
      </div>

      <motion.div
        className="queue-circle"
        style={{ marginTop: 24 }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      >
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={yourTurn ? 'turn' : pos}
              className="queue-num"
              initial={{ opacity: 0, y: 10, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.85 }}
              transition={{ duration: 0.3 }}
            >
              {yourTurn ? <PartyPopper size={44} strokeWidth={2} /> : pos}
            </motion.div>
          </AnimatePresence>
          <div className="queue-num-sub">{yourTurn ? "you're up" : 'ahead of you'}</div>
        </div>
      </motion.div>

      <div className="queue-line">
        {[...Array(total)].map((_, i) => {
          const myIndex = total - 1 - pos
          const cls = i < myIndex ? 'done' : i === myIndex ? 'me' : ''
          return (
            <motion.span
              key={i}
              className={`queue-dot ${cls}`}
              animate={cls === 'me' ? { scale: [1, 1.35, 1] } : { scale: 1 }}
              transition={{ duration: 0.9, repeat: cls === 'me' ? Infinity : 0 }}
            />
          )
        })}
      </div>

      <Reveal delay={0.1}>
        <h2 className="h2" style={{ marginTop: 8 }}>
          {yourTurn ? 'The bridge is yours' : `About ${wait} min to go`}
        </h2>
        <p className="lead">
          {yourTurn
            ? 'Tap below to start your session. Your timer begins the moment you enter.'
            : "Keep this screen open. We\u2019ll move you up automatically as people finish."}
        </p>
      </Reveal>

      <Reveal delay={0.18} className="card" style={{ marginTop: 18, textAlign: 'left' }}>
        <div className="summary">
          <div className="summary-row">
            <span className="k">Your tier</span>
            <span className="v">{booking.tier.name}</span>
          </div>
          <div className="summary-row">
            <span className="k">Session length</span>
            <span className="v">{booking.tier.duration}</span>
          </div>
        </div>
      </Reveal>

      <div className="fill" />

      <div className="footer-cta">
        <motion.button className="btn btn-primary" disabled={!yourTurn} onClick={() => navigate('/control')}
          whileHover={yourTurn ? { y: -2 } : {}} whileTap={yourTurn ? { scale: 0.97 } : {}}
          animate={yourTurn ? { boxShadow: ['0 0 0px rgba(0,168,225,0)', '0 0 22px rgba(0,168,225,0.5)', '0 0 0px rgba(0,168,225,0)'] } : {}}
          transition={yourTurn ? { duration: 1.6, repeat: Infinity } : {}}>
          {yourTurn ? <><Play size={17} strokeWidth={2.5} />Start my session</> : `Waiting · ${pos} ahead`}
        </motion.button>
      </div>
    </div>
  )
}
