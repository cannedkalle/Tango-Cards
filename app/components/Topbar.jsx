import Link from "next/link";

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
          <Link className="portal-source-link portal-home-link" href="/">
            Back to Portal
          </Link>
        </nav>
      </div>
    </header>
  );
}
