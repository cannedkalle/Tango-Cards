import Link from "next/link";
import { PLAY_APPS } from "../lib/apps";
import { SITE_NAME } from "../lib/names";
import { creatorContactUrl, kofiUrl } from "../lib/support";

export default function HomePage() {
  return (
    <>
      <header className="topbar lab-topbar">
        <Link className="pf-brand" href="/"><img src="/design-system/brand.svg" alt="" />{SITE_NAME}</Link>
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
        <div className="lab-intro">
          <h1>A little curious?<br />Come play.</h1>
          <p>Collect a character. Try a strange name. See where a marble goes.</p>
        </div>
        <section className="lab-app-grid" aria-label="Play idea list">
          {PLAY_APPS.map((app) => (
            <Link className={`kids-app-card ${app.cardClassName}`} href={app.route} key={app.id}>
              <span className={`kids-app-art ${app.previewClassName}`} aria-hidden="true">
                <img className="app-preview-image" src={app.previewImage} alt="" />
              </span>
              <span className="app-copy">
                <strong><span className="app-label">{app.label}</span>{app.name}</strong>
                <small>{app.description}</small>
                <b aria-hidden="true">→</b>
              </span>
            </Link>
          ))}
        </section>
      </main>
      <footer className="lab-footer"><span>Made by CannedKalle and sons.</span><span>Small games for big questions.</span></footer>
    </>
  );
}
