/**
 * Hand-drawn scrollwork medallion — the collage's line layer.
 *
 * Pure decoration in the suzani-curl grammar: one curl motif repeated by
 * rotation, two rings to hold it. Drawn ink-thin so it reads as pattern, not
 * as a claim about anything. The strokes draw themselves in once (same
 * reveal-armed contract as the cartouche: without JS it is simply whole).
 */
export function Ornament({ className = '', draw = false }: { className?: string; draw?: boolean }) {
  const curl =
    'M 0,-118 C 26,-150 74,-146 82,-112 C 88,-86 66,-64 42,-70 C 24,-74 16,-92 28,-104 C 36,-112 50,-110 52,-98';
  return (
    <div className={`ornament ${draw ? 'reveal ' : ''}${className}`} aria-hidden="true">
      <svg
        className={`ornament__svg ${draw ? 'ornament__svg--draw' : ''}`}
        viewBox="-170 -170 340 340"
        role="presentation"
        preserveAspectRatio="xMidYMid meet"
      >
        <circle className="ornament__ring" r="150" />
        <circle className="ornament__ring ornament__ring--inner" r="56" />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} className="ornament__curl" d={curl} transform={`rotate(${i * 45})`} />
        ))}
      </svg>
    </div>
  );
}
