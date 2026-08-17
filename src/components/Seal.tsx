/**
 * A slowly turning ink seal: the restaurant's verified facts set on a circle,
 * an eight-point rosette at the centre. Text is name + address only — the two
 * things the research package actually verified. It turns like a stamp being
 * admired, one revolution in forty seconds; still under reduced motion.
 */
export function Seal({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className={`seal ${className}`} aria-hidden="true">
      <svg className="seal__svg" viewBox="-60 -60 120 120" role="presentation">
        <defs>
          <path id="seal-orbit" d="M 0,-44 A 44,44 0 1,1 -0.01,-44" />
        </defs>
        <circle r="57" className="seal__rim" />
        <circle r="31" className="seal__rim seal__rim--inner" />
        <g className="seal__spin">
          <text className="seal__text">
            <textPath href="#seal-orbit" startOffset="0">
              {text}
            </textPath>
          </text>
        </g>
        <g className="seal__star">
          <rect x="-11" y="-11" width="22" height="22" />
          <rect x="-11" y="-11" width="22" height="22" transform="rotate(45)" />
          <circle r="4.5" />
        </g>
      </svg>
    </div>
  );
}
