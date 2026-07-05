export default function Topbar({ eyebrow, title, stats, supportUrl }) {
  return (
    <header className="topbar">
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
        {supportUrl ? (
          <a className="support-link" href={supportUrl} target="_blank" rel="noreferrer">
            Support Super Parent Project
          </a>
        ) : null}
      </div>
    </header>
  );
}
