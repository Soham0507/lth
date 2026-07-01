// Dummy data for the LTH UI prototype. No backend.

export const DONATION_TIERS = [
  {
    id: 'spark',
    name: 'Spark',
    price: 10,
    duration: '2 min',
    blurb: 'A quick moment on the bridge — set one zone color.',
    perks: ['2 minutes of control', '1 lighting zone', 'Color picker access'],
  },
  {
    id: 'glow',
    name: 'Glow',
    price: 25,
    duration: '5 min',
    blurb: 'More time, all zones, and access to show triggers.',
    perks: ['5 minutes of control', 'All 3 zones', 'Show triggers', 'Color picker access'],
    popular: true,
  },
  {
    id: 'beacon',
    name: 'Beacon',
    price: 50,
    duration: '10 min',
    blurb: 'The full experience — every show, every zone, synced audio.',
    perks: [
      '10 minutes of control',
      'All 3 zones',
      'All show triggers',
      'Synced audio shows',
      'Priority in queue',
    ],
  },
]

// Booking windows the bridge is open for public control.
// Generated dynamically from today forward — no past dates.
function buildDates(count = 7) {
  const dayMs = 24 * 60 * 60 * 1000
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dates = []
  for (let i = 0; i < count; i++) {
    const d = new Date(today.getTime() + i * dayMs)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' })
    const month = d.toLocaleDateString('en-US', { month: 'short' })
    dates.push({
      id: `${yyyy}-${mm}-${dd}`,
      label: `${weekday}, ${month} ${d.getDate()}`,
      // Fridays get the signature event tag.
      tag: d.getDay() === 5 ? 'Friday Night Lights' : null,
    })
  }
  return dates
}

export const DATES = buildDates()

// Time slots per evening window. Some sold out / blacked out.
export const SLOTS = [
  { id: '20:00', label: '8:00 PM', status: 'open' },
  { id: '20:15', label: '8:15 PM', status: 'open' },
  { id: '20:30', label: '8:30 PM', status: 'open' },
  { id: '20:45', label: '8:45 PM', status: 'open' },
  { id: '21:00', label: '9:00 PM', status: 'open' },
  { id: '21:15', label: '9:15 PM', status: 'full' },
  { id: '21:30', label: '9:30 PM', status: 'open' },
  { id: '21:45', label: '9:45 PM', status: 'open' },
]

// Lighting zones on the Hoan Bridge.
export const ZONES = [
  { id: 'cables', name: 'Cables', defaultColor: '#3da9fc' },
  { id: 'towers', name: 'Towers', defaultColor: '#ffd166' },
  { id: 'deck', name: 'Deck', defaultColor: '#ef476f' },
]

// Music library the user can play through the bridge speakers.
export const TRACKS = [
  { id: 'high-heeled', name: 'High Heeled', desc: 'Black Scorpion Music', src: '/music/high-heeled.mp3' },
  { id: 'highway-havoc', name: 'Highway Havoc', desc: 'Ribhav Agrawal', src: '/music/highway-havoc.mp3' },
  { id: 'neon-highway', name: 'Neon Highway', desc: 'Desi Free Music · synth rock', src: '/music/neon-highway.mp3' },
  { id: 'silent-night-acoustic', name: 'Silent Night (Acoustic)', desc: 'Folk Acoustic · indie version', src: '/music/silent-night-acoustic.mp3' },
]

// Quick color swatches (approved palette).
export const SWATCHES = [
  '#ef476f', '#ff6b35', '#ffd166', '#06d6a0',
  '#3da9fc', '#7b2ff7', '#ffffff', '#f72585',
  '#ff4d4d', '#ffa62b', '#a3e635', '#22d3ee',
  '#4361ee', '#c026d3', '#fb64b6', '#94a3b8',
]
