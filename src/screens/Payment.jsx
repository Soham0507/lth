import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, CreditCard, Calendar, ShieldCheck, Lock, Loader2 } from 'lucide-react'
import Header from '../components/Header.jsx'
import { useApp } from '../context/AppContext.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { SponsorLine } from '../components/SponsorMark.jsx'
import { occasionById } from '../data/sample.js'

// Light formatting helpers for the dummy card form.
const fmtCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
const fmtExp = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d
}

export default function Payment() {
  const navigate = useNavigate()
  const { booking, setPaid, bookSlot } = useApp()
  const [card, setCard] = useState('4242 4242 4242 4242')
  const [exp, setExp] = useState('12/28')
  const [cvc, setCvc] = useState('123')
  const [name, setName] = useState('')
  const [processing, setProcessing] = useState(false)

  if (!booking) return <Navigate to="/book" replace />

  const total = booking.tier.price
  const fee = +(total * 0.029 + 0.3).toFixed(2)

  const pay = (e) => {
    e.preventDefault()
    setProcessing(true)
    // Dummy "Stripe" call.
    setTimeout(() => {
      setPaid(true)
      bookSlot(booking.dateId, booking.slotId)
      navigate('/confirmation')
    }, 1400)
  }

  return (
    <div className="screen">
      <Header title="Payment" back="/book" />

      <Reveal className="card" style={{ marginTop: 4 }}>
        <div className="summary">
          <div className="summary-row">
            <span className="k">{booking.tier.name} · {booking.tier.duration}</span>
            <span className="v">${booking.tier.price.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span className="k">{booking.date} · {booking.slot}</span>
            <span className="v">—</span>
          </div>
          {booking.occasionId && (
            <div className="summary-row">
              <span className="k">{booking.momentName || occasionById(booking.occasionId).name}</span>
              <span className="v">{occasionById(booking.occasionId).name}</span>
            </div>
          )}
          <div className="summary-row">
            <span className="k">Processing fee</span>
            <span className="v">${fee.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span className="k">Total donation</span>
            <span className="v">${(total + fee).toFixed(2)}</span>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.08} as="p" className="section-label">
        <span className="lbl-badge"><CreditCard size={13} strokeWidth={2.5} /></span>
        Card details
      </Reveal>
      <Reveal delay={0.12} as="form" onSubmit={pay}>
        <div className="field">
          <label><User size={13} strokeWidth={2.5} style={{ verticalAlign: -2, marginRight: 5 }} />Cardholder name</label>
          <input className="input" placeholder="Jane Doe" value={name}
                 onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label><CreditCard size={13} strokeWidth={2.5} style={{ verticalAlign: -2, marginRight: 5 }} />Card number</label>
          <input className="input" inputMode="numeric" value={card}
                 onChange={(e) => setCard(fmtCard(e.target.value))} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label><Calendar size={13} strokeWidth={2.5} style={{ verticalAlign: -2, marginRight: 5 }} />Expiry</label>
            <input className="input" inputMode="numeric" placeholder="MM/YY" value={exp}
                   onChange={(e) => setExp(fmtExp(e.target.value))} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label><Lock size={13} strokeWidth={2.5} style={{ verticalAlign: -2, marginRight: 5 }} />CVC</label>
            <input className="input" inputMode="numeric" placeholder="123" value={cvc}
                   onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} />
          </div>
        </div>

        <div className="footer-cta">
          <motion.button className="btn btn-primary" type="submit" disabled={processing}
            whileHover={!processing ? { y: -2 } : {}} whileTap={!processing ? { scale: 0.97 } : {}}>
            {processing ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  style={{ display: 'inline-flex' }}
                >
                  <Loader2 size={18} strokeWidth={2.5} />
                </motion.span>
                Processing…
              </>
            ) : (
              <>Donate ${(total + fee).toFixed(2)}</>
            )}
          </motion.button>
          <p className="note">
            <ShieldCheck size={13} strokeWidth={2.5} style={{ verticalAlign: -2, marginRight: 4 }} />
            Dummy checkout · test card prefilled · no real charge
          </p>
          <div className="credit-bar" style={{ marginTop: 10 }}>
            <SponsorLine label="Experience technology by" id="founding" />
          </div>
        </div>
      </Reveal>
    </div>
  )
}
