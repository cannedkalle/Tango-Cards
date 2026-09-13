import Link from "next/link";
import { APP_NAMES, SITE_NAME } from "../lib/names";
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
          <Link className="kids-app-card tango-app-card" href="/tango-cards">
            <span className="app-label">Gallery app</span>
            <span className="kids-app-art tango-app-art" aria-hidden="true">
              <img className="app-preview-image" src="/lab-art/tango-cards-preview.jpg" alt="" />
            </span>
            <span>
              <strong>{APP_NAMES.tangoCards}</strong>
              <small>Browse bright collectible cards and open expansion packs.</small>
            </span>
            <b>Gallery</b>
          </Link>

          <Link className="kids-app-card marble-app-card" href="/marble-battles">
            <span className="app-label">Game app</span>
            <span className="kids-app-art marble-app-art" aria-hidden="true">
              <img className="app-preview-image" src="/lab-art/marble-battles-preview.jpg" alt="" />
            </span>
            <span>
              <strong>{APP_NAMES.marbleBattles}</strong>
              <small>Launch marbles, claim tiles, and watch the board shift.</small>
            </span>
            <b>Game</b>
          </Link>

          <Link className="kids-app-card name-app-card" href="/name-quest">
            <span className="app-label">Word game</span>
            <span className="kids-app-art name-app-art" aria-hidden="true">
              <img className="app-preview-image" src="/lab-art/name-quest-preview.png" alt="" />
            </span>
            <span>
              <strong>{APP_NAMES.nameQuest}</strong>
              <small>Spot what a name belongs to, then keep the streak going.</small>
            </span>
            <b>Play</b>
          </Link>
        </section>
      </main>
    </>
  );
}
