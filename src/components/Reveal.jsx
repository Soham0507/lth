import { motion } from 'framer-motion'

const easeOut = [0.22, 1, 0.36, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
}

// Reveals its children once, when scrolled into view (or on mount for above-the-fold content).
export function Reveal({ children, delay = 0, className, style, as = 'div', once = true, ...rest }) {
  const As = motion[as] || motion.div
  return (
    <As
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.3 }}
      variants={fadeUp}
      transition={{ duration: 0.5, delay, ease: easeOut }}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </As>
  )
}

// Stagger a list of children: wrap the list in <StaggerGroup>, each item in <StaggerItem>.
export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
}
export const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
}

export function StaggerGroup({ children, className, style, once = true, ...rest }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.15 }}
      variants={staggerContainer}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className, style, as = 'div', ...rest }) {
  const As = motion[as] || motion.div
  return (
    <As variants={staggerItem} className={className} style={style} {...rest}>
      {children}
    </As>
  )
}

export const tapScale = { scale: 0.97 }
export const hoverLift = { y: -2 }
