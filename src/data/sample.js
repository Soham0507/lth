// Sample content that makes the prototype feel like a launched platform.
// Everything here is illustrative: sponsor placements, reservations and names are placeholders.
import { Cake, Gem, Baby, HeartHandshake, Building2, Heart } from 'lucide-react'
import { DATES, SLOTS } from './dummy.js'

// ── Sponsors ─────────────────────────────────────────────────────────────────
// `founding` is intentionally a blank "YOUR LOGO HERE" slot so no one company appears to own
// the Founding Technology Partner opportunity. To use a real logo, drop a transparent PNG at
// public/sponsors/<id>.png (e.g. public/sponsors/weenergies.png) — the wordmark falls back
// to text when no file exists.
export const SPONSORS = {
  founding: { id: 'founding', name: 'YOUR LOGO HERE', role: 'Founding Technology Partner', placeholder: true },
  weenergies: { id: 'weenergies', name: 'We Energies', role: 'Experience Night Series' },
  molsoncoors: { id: 'molsoncoors', name: 'Molson Coors', role: 'Signature Experience' },
  visitmke: { id: 'visitmke', name: 'Visit Milwaukee', role: 'Visitor Moments' },
}

// ── Occasions (the emotional use cases from the sponsorship deck) ────────────
// `palette` seeds the lighting plan; `effect` is an EFFECTS id.
export const OCCASIONS = [
  {
    id: 'birthday', name: 'Birthday', icon: Cake,
    line: 'Make the skyline part of the celebration.',
    placeholder: "Maya's 30th",
    palette: { deck: '#f72585', verticals: '#ffd166', arch: '#22d3ee' }, effect: 'confetti',
  },
  {
    id: 'proposal', name: 'Proposal', icon: Gem,
    line: 'Create a moment they will never forget.',
    placeholder: 'Will you marry me?',
    palette: { deck: '#ffffff', verticals: '#fb64b6', arch: '#ff4d4d' }, effect: 'heartbeat',
  },
  {
    id: 'gender-reveal', name: 'Gender Reveal', icon: Baby,
    line: 'Share big news in a very Milwaukee way.',
    placeholder: 'Baby Nowak: pink or blue?',
    palette: { deck: '#ffffff', verticals: '#3da9fc', arch: '#fb64b6' }, effect: 'sparkle',
  },
  {
    id: 'anniversary', name: 'Anniversary', icon: Heart,
    line: 'Mark a milestone in light.',
    placeholder: 'Dan & Priya · 10 years',
    palette: { deck: '#ffffff', verticals: '#ffd166', arch: '#fb64b6' }, effect: 'heartbeat',
  },
  {
    id: 'nonprofit', name: 'Nonprofit', icon: HeartHandshake,
    line: 'Celebrate a mission, milestone or fundraiser.',
    placeholder: 'Eastside Food Pantry · 25 years',
    palette: { deck: '#06d6a0', verticals: '#ffffff', arch: '#22d3ee' }, effect: 'waves',
  },
  {
    id: 'business', name: 'Business', icon: Building2,
    line: 'Recognize teams, clients and company moments.',
    placeholder: 'Harbor & Co. team win',
    palette: { deck: '#4361ee', verticals: '#ffffff', arch: '#22d3ee' }, effect: 'waves',
  },
]
export const occasionById = (id) => OCCASIONS.find((o) => o.id === id)

// ── Lighting effects ─────────────────────────────────────────────────────────
// `sponsorId` credits a Signature Effect partner wherever the effect is chosen.
export const EFFECTS = [
  { id: 'steady', name: 'Steady Glow', desc: 'Clean, solid color — the classic look.' },
  { id: 'sparkle', name: 'Milwaukee Sparkle', desc: 'Twinkling points of light across the whole bridge.', sponsorId: 'founding', signature: true },
  { id: 'heartbeat', name: 'Heartbeat', desc: 'A slow double-pulse. Made for proposals and anniversaries.' },
  { id: 'waves', name: 'Waves', desc: 'Light rolls across the bridge like Lake Michigan.' },
  { id: 'confetti', name: 'Confetti', desc: 'Bursts of color for birthdays and big news.' },
]
export const effectById = (id) => EFFECTS.find((e) => e.id === id)

// ── Sponsored activations (shown on Home, pre-load the booking) ──────────────
export const EXPERIENCES = [
  {
    id: 'we-energies-night',
    sponsorId: 'weenergies',
    kind: 'Experience Night',
    title: 'Community Experience Night',
    desc: 'An evening of Hoan moments gifted to neighbors, nonprofits and families across the community.',
    palette: { deck: '#06d6a0', verticals: '#ffffff', arch: '#22d3ee' }, effect: 'waves',
    occasionId: 'nonprofit',
  },
  {
    id: 'molson-milwaukee',
    sponsorId: 'molsoncoors',
    kind: 'Signature Experience',
    title: 'Milwaukee-Themed Experience',
    desc: 'Cream City gold and Lake Michigan blue — a toast to the city, lit across the bridge.',
    palette: { deck: '#ffa62b', verticals: '#ffd166', arch: '#4361ee' }, effect: 'sparkle',
    occasionId: 'birthday',
  },
  {
    id: 'visit-milwaukee-welcome',
    sponsorId: 'visitmke',
    kind: 'Visitor Moments',
    title: 'Welcome to Milwaukee',
    desc: 'For visitors, conventions and weekend travelers: a night on the Hoan they can share back home.',
    palette: { deck: '#22d3ee', verticals: '#ffffff', arch: '#fb64b6' }, effect: 'sparkle',
    occasionId: 'business',
  },
  {
    id: 'milwaukee-sparkle',
    sponsorId: 'founding',
    kind: 'Signature Effect',
    title: 'Milwaukee Sparkle',
    desc: 'A limited-edition effect that turns the whole bridge into a field of stars.',
    palette: { deck: '#ffffff', verticals: '#ffd166', arch: '#f7a800' }, effect: 'sparkle',
    occasionId: 'anniversary',
  },
]
export const experienceById = (id) => EXPERIENCES.find((e) => e.id === id)

// ── Where to watch ───────────────────────────────────────────────────────────
export const VIEWING_SPOTS = [
  { name: 'Lakeshore State Park', note: 'Closest lakefront view of the full arch' },
  { name: 'Veterans Park', note: 'Wide-open lawn, easy parking and a skyline backdrop' },
  { name: 'Henry Maier Festival Park', note: 'Great for groups — look south along the lake' },
]

// ── Sample reservations ──────────────────────────────────────────────────────
// Deterministic per calendar night so the schedule looks the same on every reload.
const MOMENTS = [
  { occasionId: 'birthday', title: "Maya's 30th Birthday", host: 'Maya R.' },
  { occasionId: 'anniversary', title: 'Dan & Priya · 10 Years', host: 'Dan K.' },
  { occasionId: 'proposal', title: 'A Very Special Question', host: 'Private · surprise', secret: true },
  { occasionId: 'gender-reveal', title: 'Baby Nowak: Pink or Blue?', host: 'The Nowaks', secret: true },
  { occasionId: 'business', title: 'Harbor & Co. · Team Win', host: 'Harbor & Co.' },
  { occasionId: 'birthday', title: "Eli's 8th Birthday", host: 'Jordan T.' },
  { occasionId: 'anniversary', title: 'Rosa & Miguel · 25 Years', host: 'Rosa M.' },
  { occasionId: 'nonprofit', title: 'Eastside Food Pantry · 25 Years', host: 'Eastside Food Pantry' },
]
const GIFTED = [
  { occasionId: 'nonprofit', title: 'Riverwest Youth Arts · Gifted Moment', host: 'Riverwest Youth Arts' },
  { occasionId: 'nonprofit', title: 'Neighborhood Food Pantry · Gifted Moment', host: 'Neighborhood Food Pantry' },
  { occasionId: 'birthday', title: 'Lincoln Elementary · Gifted Moment', host: 'Lincoln Elementary' },
  { occasionId: 'business', title: 'Mentor Program Graduation', host: 'Local mentorship program' },
]

function buildReservations() {
  const out = []
  DATES.forEach((d) => {
    const count = 2 + (d.index % 3) + (d.sponsorId ? 1 : 0) // 2–5 booked of 8
    for (let j = 0; j < count; j++) {
      const slot = SLOTS[(d.index * 3 + j * 3) % SLOTS.length]
      if (out.some((r) => r.dateId === d.id && r.slotId === slot.id)) continue
      const gifted = d.sponsorId === 'weenergies' && j % 2 === 0
      const base = gifted ? GIFTED[(d.index + j) % GIFTED.length] : MOMENTS[(d.index * 2 + j) % MOMENTS.length]
      const o = occasionById(base.occasionId)
      out.push({
        ...base,
        dateId: d.id,
        slotId: slot.id,
        slotLabel: slot.label,
        dateLabel: d.label,
        giftedBy: gifted ? 'weenergies' : null,
        palette: o.palette,
        effect: o.effect,
      })
    }
  })
  return out
}

export const RESERVATIONS = buildReservations()

export const reservationFor = (dateId, slotId) =>
  RESERVATIONS.find((r) => r.dateId === dateId && r.slotId === slotId)

export const reservationsOn = (dateId) =>
  RESERVATIONS.filter((r) => r.dateId === dateId).sort((a, b) => a.slotId.localeCompare(b.slotId))

export const openSlotsOn = (dateId) =>
  SLOTS.filter((s) => s.status === 'open' && !reservationFor(dateId, s.id))
