/* Shared chrome icons for the portal: one small SVG set, used only where
 * an icon carries meaning — back, restart, forward, and the lives readout.
 * Mode and difficulty pickers show text only (their pressed state already
 * marks the choice), and game content keeps its own decorative marks.
 * Every icon inherits the surrounding text color and size (1em), so the
 * same icon looks the same in every game. */
import { livesHeartStates } from "../../lib/quiz-play.mjs";

function Base({ children, label, className = "" }) {
  return (
    <svg
      className={`pf-icon${className ? ` ${className}` : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {label ? <title>{label}</title> : null}
      {children}
    </svg>
  );
}

export function ArrowLeftIcon({ className }) {
  return (
    <Base className={className}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </Base>
  );
}

export function ArrowRightIcon({ className }) {
  return (
    <Base className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </Base>
  );
}

export function RestartIcon({ className }) {
  return (
    <Base className={className}>
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </Base>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg
      className="pf-icon"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

/* Lives readout: three hearts, filled for lives left, outline for lives
 * lost. Replaces the text ♥/♡ glyphs, which render differently per device. */
export function LivesHearts({ lives }) {
  return (
    <span className="pf-lives" role="img" aria-label={`${lives} lives left`}>
      {livesHeartStates(lives).map((filled, index) => (
        <HeartIcon key={index} filled={filled} />
      ))}
    </span>
  );
}
