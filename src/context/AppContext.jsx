import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null) // { name, email }
  const [booking, setBooking] = useState(null) // { date, slot, tier }
  const [paid, setPaid] = useState(false)

  const login = (profile) => setUser(profile)
  const logout = () => {
    setUser(null)
    setBooking(null)
    setPaid(false)
  }

  return (
    <AppContext.Provider
      value={{ user, setUser, login, logout, booking, setBooking, paid, setPaid }}
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
