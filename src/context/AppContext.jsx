import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null) // { name, email }
  const [booking, setBooking] = useState(null) // { date, dateId, slot, slotId, tier }
  const [paid, setPaid] = useState(false)
  const [bookedSlots, setBookedSlots] = useState(new Set()) // Set of "dateId|slotId"
  // What the visitor tapped on Home (an occasion, a sponsored experience, or an open slot) —
  // carried through sign-in so Booking can pre-fill itself.
  const [intent, setIntent] = useState(null) // { occasionId?, experienceId?, dateId?, slotId? }
  // The lighting plan: colors per bridge part plus an effect.
  const [design, setDesign] = useState(null) // { colors: {deck, verticals, arch}, effectId }

  const login = (profile) => setUser(profile)
  const logout = () => {
    setUser(null)
    setBooking(null)
    setPaid(false)
    setIntent(null)
    setDesign(null)
  }

  const bookSlot = (dateId, slotId) => {
    setBookedSlots((prev) => new Set([...prev, `${dateId}|${slotId}`]))
  }

  const isSlotTaken = (dateId, slotId) => bookedSlots.has(`${dateId}|${slotId}`)

  return (
    <AppContext.Provider
      value={{
        user, setUser, login, logout, booking, setBooking, paid, setPaid, bookSlot, isSlotTaken,
        intent, setIntent, design, setDesign,
      }}
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
