/**
 * A carpet trim, drawn — the collage's textile layer.
 *
 * One vertical tile repeated: deep-red field between gold guard stripes,
 * eight-point rosettes, and a lappet (pointed-arch) edge like the fringe of a
 * hung carpet. Every colour is the site's own palette; nothing is a photo of
 * any actual carpet, so it can never misrepresent the room.
 */
export function CarpetBorder({ className = '' }: { className?: string }) {
  return (
    <div className={`carpet ${className}`} aria-hidden="true">
      <svg
        className="carpet__svg"
        viewBox="0 0 132 520"
        preserveAspectRatio="xMinYMin slice"
        role="presentation"
      >
        <defs>
          <pattern id="carpet-tile" patternUnits="userSpaceOnUse" width="132" height="260">
            {/* body between the guards */}
            <rect x="0" y="0" width="92" height="260" fill="#7e1d2b" />
            <rect x="0" y="0" width="10" height="260" fill="#5d1420" />
            {/* guard stripes */}
            <rect x="12" y="0" width="3" height="260" fill="var(--gold-warm)" />
            <rect x="18" y="0" width="1.4" height="260" fill="#2b0504" />
            <rect x="84" y="0" width="1.4" height="260" fill="#2b0504" />
            <rect x="88" y="0" width="3" height="260" fill="var(--gold-warm)" />

            {/* lappet edge: one pointed arch per half-tile */}
            {[0, 130].map((y) => (
              <g key={y} transform={`translate(0 ${y})`}>
                <path
                  d="M91,8 C112,12 122,34 123,56 L128,65 L123,74 C122,96 112,118 91,122 Z"
                  fill="#7e1d2b"
                  stroke="var(--gold-warm)"
                  strokeWidth="2"
                />
                <path
                  d="M91,22 C105,26 112,42 113,58 L117,65 L113,72 C112,88 105,104 91,108"
                  fill="none"
                  stroke="#d8a044"
                  strokeWidth="1.2"
                  opacity="0.75"
                />
                <circle cx="120" cy="65" r="2.4" fill="var(--gold-warm)" />

                {/* rosette on the body */}
                <g transform="translate(50 65)">
                  <circle r="25" fill="#2b0504" />
                  <rect x="-16" y="-16" width="32" height="32" fill="#e8ddbf" />
                  <rect x="-16" y="-16" width="32" height="32" fill="#e8ddbf" transform="rotate(45)" />
                  <circle r="11" fill="#a32638" />
                  <circle r="4" fill="var(--gold-warm)" />
                </g>

                {/* small ink sprigs around the rosette */}
                {[45, 135, 225, 315].map((a) => (
                  <path
                    key={a}
                    d="M0,-38 C6,-46 14,-46 16,-38 C17,-32 12,-28 7,-30"
                    transform={`translate(50 65) rotate(${a})`}
                    fill="none"
                    stroke="#2b0504"
                    strokeWidth="1.6"
                    opacity="0.7"
                  />
                ))}

                {/* divider row between lappets */}
                <g transform="translate(0 130)">
                  {[30, 50, 70].map((x) => (
                    <rect key={x} x={x - 4} y="-4" width="8" height="8" fill="#d8a044" transform={`rotate(45 ${x} 0)`} />
                  ))}
                </g>
              </g>
            ))}
          </pattern>
        </defs>
        <rect x="0" y="0" width="132" height="520" fill="url(#carpet-tile)" />
      </svg>
    </div>
  );
}
