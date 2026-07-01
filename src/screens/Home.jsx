import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Palette, ArrowRight, LogIn } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { StaggerGroup, StaggerItem } from '../components/Reveal.jsx'

const easeOut = [0.22, 1, 0.36, 1]

export default function Home() {
  const navigate = useNavigate()
  const { user } = useApp()

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
            <span className="hero-h1-color">Control the bridge.</span><br />For a good cause.
          </StaggerItem>
          <StaggerItem as="p" className="hero-lead">
            Book a session, pick your colors, trigger a light show — every donation
            helps Light the Hoan keep the city glowing.
          </StaggerItem>

          <StaggerItem className="hero-event-card">
            <div className="badge-live">Live tonight · Friday Night Lights</div>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
              Public control opens at 8:00 PM. Grab a slot before they fill up.
            </p>
          </StaggerItem>

          <StaggerItem className="btn-row hero-cta">
            <motion.button
              className="btn btn-primary"
              onClick={() => navigate(user ? '/book' : '/login')}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              {user ? 'Book a session' : 'Get started'}
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
          <StaggerItem as="p" className="note" style={{ marginTop: 16 }}>
            UI prototype · dummy data, no live bridge connected
          </StaggerItem>
        </StaggerGroup>
      </div>
    </div>
  )
}
