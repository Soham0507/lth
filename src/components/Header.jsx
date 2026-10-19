import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'

// In-page title row (the global TopBar lives in App).
export default function Header({ title, back }) {
  const navigate = useNavigate()
  return (
    <motion.header
      className="appbar"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {back && (
        <button className="iconbtn" onClick={() => navigate(back)} aria-label="Back">
          <ChevronLeft size={20} strokeWidth={2.4} />
        </button>
      )}
      <h1 className="appbar-title">{title}</h1>
    </motion.header>
  )
}
