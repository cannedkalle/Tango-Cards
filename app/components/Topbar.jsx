import PortalNav from "./PortalNav";

export default function Topbar({ eyebrow, title, stats }) {
  return (
    <>
    <PortalNav />
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
      </div>
    </header>
    </>
  );
}
