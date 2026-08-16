import { OUTER_D, INNER_D, VIEWBOX } from '@/components/motion/cartouche';

/**
 * The static cartouche — the same two paths the WebGL passage extrudes.
 * This is the ground truth: on a phone, without JS, or with motion turned off,
 * the section is a printed gold plate, which is a perfectly good thing to be.
 */
export function Cartouche({
  className = '',
  draw = false,
  label,
  children,
}: {
  className?: string;
  draw?: boolean;
  label?: string;
  children?: React.ReactNode;
}) {
  // A drawing cartouche joins the reveal system: the observer arms it and adds
  // .is-in, which is what starts the stroke animation. Unarmed it is already whole.
  return (
    <div className={`cartouche ${draw ? 'reveal ' : ''}${className}`} data-label={label}>
      <svg
        className={`cartouche__svg ${draw ? 'cartouche__svg--draw' : ''}`}
        viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`}
        role="presentation"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        <path d={OUTER_D} className="cartouche__outer" />
        <path d={INNER_D} className="cartouche__inner" />
      </svg>
      {children && <div className="cartouche__slot">{children}</div>}
    </div>
  );
}
