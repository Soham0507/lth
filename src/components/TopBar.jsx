import { Link, useLocation } from 'react-router-dom'
import { SponsorMark } from './SponsorMark.jsx'

// Persistent app bar. The Founding Technology Partner's logo is always on screen.
export default function TopBar() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="topbar-brand" aria-label="Light the Hoan — home">
          <img src="/lth-logo.png" alt="Light the Hoan" />
        </Link>

        {isHome && (
          <nav className="topbar-nav" aria-label="Sections">
            <a href="#how">How it works</a>
            <a href="#moments">Occasions</a>
            <a href="#calendar">Calendar</a>
            <a href="#partners">Partners</a>
          </nav>
        )}

        <div className="topbar-partner">
          <span className="tp-label">Presented by<b>Founding Technology Partners</b></span>
          <SponsorMark id="founding" size="bar" />
        </div>
      </div>
    </header>
  )
}
