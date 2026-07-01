import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null) // { name, email }
  const [booking, setBooking] = useState(null) // { date, dateId, slot, slotId, tier }
  const [paid, setPaid] = useState(false)
  const [bookedSlots, setBookedSlots] = useState(new Set()) // Set of "dateId|slotId"

  const login = (profile) => setUser(profile)
  const logout = () => {
    setUser(null)
    setBooking(null)
    setPaid(false)
  }

  const bookSlot = (dateId, slotId) => {
    setBookedSlots((prev) => new Set([...prev, `${dateId}|${slotId}`]))
  }

  const isSlotTaken = (dateId, slotId) => bookedSlots.has(`${dateId}|${slotId}`)

  return (
    <AppContext.Provider
      value={{ user, setUser, login, logout, booking, setBooking, paid, setPaid, bookSlot, isSlotTaken }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
