import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, LogIn } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import Header from '../components/Header.jsx'
import { Reveal } from '../components/Reveal.jsx'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useApp()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  // Dummy auth — accepts anything, no backend.
  const finish = (profile) => {
    login(profile)
    navigate('/book')
  }

  const oauth = (provider) =>
    finish({ name: provider + ' User', email: `you@${provider.toLowerCase()}.com`, provider })

  const emailLogin = (e) => {
    e.preventDefault()
    finish({ name: name || 'Guest', email: email || 'guest@example.com', provider: 'email' })
  }

  return (
    <div className="screen">
      <Header title="Sign in" back="/" />

      <Reveal style={{ marginTop: 8 }}>
        <img src="/lth-logo.png" alt="Light the Hoan" style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
        <h2 className="h1" style={{ fontSize: 24, marginTop: 14 }}>Welcome back</h2>
        <p className="lead">Sign in to book a session and light up the Hoan.</p>
      </Reveal>

      <Reveal delay={0.08} className="btn-row" style={{ marginTop: 22 }}>
        <motion.button className="btn btn-oauth" onClick={() => oauth('Google')} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
          <span style={{ fontWeight: 800, color: '#4285F4' }}>G</span> Continue with Google
        </motion.button>
        <motion.button className="btn btn-oauth dark" onClick={() => oauth('Apple')} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
          Continue with Apple
        </motion.button>
      </Reveal>

      <div className="divider">or use email</div>

      <Reveal delay={0.14} as="form" onSubmit={emailLogin}>
        <div className="field">
          <label><User size={13} strokeWidth={2.5} style={{ verticalAlign: -2, marginRight: 5 }} />Name</label>
          <input className="input" placeholder="Jane Doe" value={name}
                 onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label><Mail size={13} strokeWidth={2.5} style={{ verticalAlign: -2, marginRight: 5 }} />Email</label>
          <input className="input" type="email" placeholder="you@example.com" value={email}
                 onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label><Lock size={13} strokeWidth={2.5} style={{ verticalAlign: -2, marginRight: 5 }} />Password</label>
          <input className="input" type="password" placeholder="••••••••" />
        </div>
        <motion.button className="btn btn-primary" type="submit" style={{ marginTop: 6 }}
          whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
          <LogIn size={17} strokeWidth={2.5} />
          Sign in
        </motion.button>
      </Reveal>

      <p className="note" style={{ marginTop: 18 }}>
        Dummy login — any details work. Nothing is sent anywhere.
      </p>
    </div>
  )
}
