import Link from "next/link";
import { BACK_TO_SITE_LABEL } from "../../lib/names";

export default function Topbar({ eyebrow, title, stats }) {
  return (
    <header className="topbar app-topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <div className="stats" aria-label="Gallery counts">
          {stats.map((stat) => (
            <span key={stat}>{stat}</span>
          ))}
        </div>
        <nav className="app-nav" aria-label="App navigation">
          <Link className="lab-source-link lab-home-link" href="/">
            {BACK_TO_SITE_LABEL}
          </Link>
        </nav>
      </div>
    </header>
  );
}
