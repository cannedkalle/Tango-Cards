import Link from "next/link";
import { PLAY_APPS } from "../lib/apps";
import { SITE_NAME } from "../lib/names";
import { creatorContactUrl, kofiUrl } from "../lib/support";

export default function HomePage() {
  return (
    <>
      <header className="topbar lab-topbar">
        <div>
          <h1>{SITE_NAME}</h1>
          <p className="lab-subtitle">
            Presented by CannedKalle and sons.
          </p>
        </div>
        <div className="topbar-actions">
          <a className="support-link contact-link" href={creatorContactUrl} target="_blank" rel="noreferrer">
            Contact Creator
          </a>
          <a className="support-link" href={kofiUrl} target="_blank" rel="noreferrer">
            Support Creator
          </a>
        </div>
      </header>

      <main>
        <section className="lab-app-grid" aria-label="Play idea list">
          {PLAY_APPS.map((app) => (
            <Link className={`kids-app-card ${app.cardClassName}`} href={app.route} key={app.id}>
              <span className="app-label">{app.label}</span>
              <span className={`kids-app-art ${app.previewClassName}`} aria-hidden="true">
                <img className="app-preview-image" src={app.previewImage} alt="" />
              </span>
              <span>
                <strong>{app.name}</strong>
                <small>{app.description}</small>
              </span>
              <b>{app.actionLabel}</b>
            </Link>
          ))}
        </section>
      </main>
    </>
  );
}
