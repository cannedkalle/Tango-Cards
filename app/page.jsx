import Link from "next/link";
<<<<<<< HEAD
<<<<<<< HEAD
import { creatorContactUrl, kofiUrl } from "../lib/support";
=======
>>>>>>> c08131e62e2aef320c0fa689408867b93e593317
=======
>>>>>>> c08131e62e2aef320c0fa689408867b93e593317

export default function KidsPortalPage() {
  return (
    <>
      <header className="topbar portal-topbar">
        <div>
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
=======
>>>>>>> c08131e62e2aef320c0fa689408867b93e593317
          <p className="eyebrow">Kids Play Portal</p>
          <h1>Pick a Play Lab</h1>
        </div>
        <div className="stats">
          <span>2 apps</span>
          <span>Playful experiments</span>
<<<<<<< HEAD
>>>>>>> c08131e62e2aef320c0fa689408867b93e593317
=======
>>>>>>> c08131e62e2aef320c0fa689408867b93e593317
        </div>
      </header>

      <main>
        <section className="kids-portal" aria-label="Kids app portal">
          <Link className="kids-app-card tango-app-card" href="/tango-cards">
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
            <span className="kids-app-art tango-app-art" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
            <span>
              <strong>Tango Cards</strong>
              <small>Browse the card gallery and open expansion packs.</small>
            </span>
            <b>Open</b>
          </Link>

=======
            <span className="kids-app-art tango-app-art" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
            <span>
              <strong>Tango Cards</strong>
              <small>Browse the card gallery and open expansion packs.</small>
            </span>
            <b>Open</b>
          </Link>

>>>>>>> c08131e62e2aef320c0fa689408867b93e593317
          <Link className="kids-app-card marble-app-card" href="/marble-royale">
            <span className="kids-app-art marble-app-art" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </span>
            <span>
              <strong>Marble Royale</strong>
              <small>Aim cannons, claim tiles, and level up.</small>
            </span>
            <b>Play</b>
<<<<<<< HEAD
>>>>>>> c08131e62e2aef320c0fa689408867b93e593317
=======
>>>>>>> c08131e62e2aef320c0fa689408867b93e593317
          </Link>
        </section>
      </main>
    </>
  );
}
