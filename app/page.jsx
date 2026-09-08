import Link from "next/link";
import { creatorContactUrl, kofiUrl } from "../lib/support";

export default function KidsPortalPage() {
  return (
    <>
      <header className="topbar portal-topbar">
        <div>
          <h1>Whimsical Play Ideas</h1>
          <p className="portal-subtitle">
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
        <section className="kids-portal" aria-label="Kids app portal">
          <Link className="kids-app-card tango-app-card" href="/tango-cards">
            <span className="app-label">Gallery app</span>
            <span className="kids-app-art tango-app-art" aria-hidden="true">
              <img className="app-preview-image" src="/portal-art/tango-cards-preview.jpg" alt="" />
            </span>
            <span>
              <strong>Tango Cards</strong>
              <small>Browse bright collectible cards and open expansion packs.</small>
            </span>
            <b>Gallery</b>
          </Link>

          <Link className="kids-app-card marble-app-card" href="/marble-battles">
            <span className="app-label">Game app</span>
            <span className="kids-app-art marble-app-art" aria-hidden="true">
              <img className="app-preview-image" src="/portal-art/marble-battles-preview.jpg" alt="" />
            </span>
            <span>
              <strong>Marble Battles</strong>
              <small>Launch marbles, claim tiles, and watch the board shift.</small>
            </span>
            <b>Game</b>
          </Link>

          <Link className="kids-app-card name-app-card" href="/guess-the-name">
            <span className="app-label">Word game</span>
            <span className="kids-app-art name-app-art" aria-hidden="true">
              <img className="app-preview-image" src="/portal-art/guess-the-name-preview.png" alt="" />
            </span>
            <span>
              <strong>Guess the Name</strong>
              <small>Hear a name, pick its kind, and keep the streak going.</small>
            </span>
            <b>Play</b>
          </Link>
        </section>
      </main>
    </>
  );
}
