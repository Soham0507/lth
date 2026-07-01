import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Home as HomeIcon, Star, Users } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { Reveal } from '../components/Reveal.jsx'

export default function Confirmation() {
  const navigate = useNavigate()
  const { booking, paid } = useApp()

  if (!booking || !paid) return <Navigate to="/book" replace />

  const ref = 'LTH-' + Math.random().toString(36).slice(2, 8).toUpperCase()

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
        <p className="lead">Your session is confirmed. We've emailed your pass.</p>
      </Reveal>

      <Reveal delay={0.24} className="card" style={{ marginTop: 20, textAlign: 'left' }}>
        <div className="summary">
          <div className="summary-row">
            <span className="k">Confirmation</span>
            <span className="v">{ref}</span>
          </div>
          <div className="summary-row">
            <span className="k">Date</span>
            <span className="v">{booking.date}</span>
          </div>
          <div className="summary-row">
            <span className="k">Session window</span>
            <span className="v">{booking.window}</span>
          </div>
          <div className="summary-row">
            <span className="k">Tier</span>
            <span className="v">{booking.tier.name} · {booking.tier.duration}</span>
          </div>
        </div>
      </Reveal>

      {booking.dateTag && (
        <motion.div className="chip warn" style={{ marginTop: 14 }}
          initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.32 }}>
          <Star size={11} strokeWidth={2.5} /> {booking.dateTag}
        </motion.div>
      )}

      <div className="fill" />

      <Reveal delay={0.3} className="footer-cta">
        <div className="btn-row">
          <motion.button className="btn btn-primary" onClick={() => navigate('/queue')}
            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <Users size={17} strokeWidth={2.5} />
            Join the queue now
          </motion.button>
          <motion.button className="btn btn-secondary" onClick={() => navigate('/')}
            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
            <HomeIcon size={16} strokeWidth={2.5} />
            Back to home
          </motion.button>
        </div>
        <p className="note">Arrive a few minutes before the window opens to claim your turn.</p>
      </Reveal>
    </div>
  )
}
