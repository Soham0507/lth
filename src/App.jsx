import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useApp } from './context/AppContext.jsx'
import PageTransition from './components/PageTransition.jsx'
import Home from './screens/Home.jsx'
import Login from './screens/Login.jsx'
import Booking from './screens/Booking.jsx'
import Payment from './screens/Payment.jsx'
import Confirmation from './screens/Confirmation.jsx'
import Queue from './screens/Queue.jsx'
import Control from './screens/Control.jsx'

function Protected({ children }) {
  const { user } = useApp()
  return user ? children : <Navigate to="/login" replace />
}

const page = (el) => <PageTransition>{el}</PageTransition>

export default function App() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={page(<Home />)} />
        <Route path="/login" element={page(<Login />)} />
        <Route path="/book" element={<Protected>{page(<Booking />)}</Protected>} />
        <Route path="/payment" element={<Protected>{page(<Payment />)}</Protected>} />
        <Route path="/confirmation" element={<Protected>{page(<Confirmation />)}</Protected>} />
        <Route path="/queue" element={<Protected>{page(<Queue />)}</Protected>} />
        <Route path="/control" element={<Protected>{page(<Control />)}</Protected>} />
        <Route path="/try" element={page(<Control demo />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}
