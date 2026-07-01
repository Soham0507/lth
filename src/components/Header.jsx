import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'

export default function Header({ title, back }) {
  const navigate = useNavigate()
  return (
    <motion.header
      className="appbar"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {back ? (
        <motion.button
          className="iconbtn"
          onClick={() => navigate(back)}
          aria-label="Back"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.92 }}
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </motion.button>
      ) : (
        <span className="iconbtn ghost" />
      )}
      <h1 className="appbar-title">{title}</h1>
      <span className="iconbtn ghost" />
    </motion.header>
  )
}
