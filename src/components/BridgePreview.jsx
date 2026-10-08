import BridgeArt from './BridgeArt.jsx'

// A small framed bridge for cards: palette is { deck, verticals, arch }.
export default function BridgePreview({ palette, effect = 'steady', className = '', ...rest }) {
  return (
    <div className={`bridge mini ${className}`}>
      <BridgeArt {...palette} effect={effect} {...rest} />
    </div>
  )
}
