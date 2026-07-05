export default function Topbar({ eyebrow, title, stats }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <div className="stats" aria-label="Gallery counts">
        {stats.map((stat) => (
          <span key={stat}>{stat}</span>
        ))}
      </div>
    </header>
  );
}
