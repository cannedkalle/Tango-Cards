import Link from "next/link";
import { ArrowRightIcon } from "./components/Icons";
import { OTHER_APPS, QUIZ_APPS } from "../lib/apps";
import { SITE_NAME } from "../lib/names";
import { creatorContactUrl, kofiUrl } from "../lib/support";

function AppCard({ app }) {
  return (
    <Link className={`kids-app-card ${app.cardClassName}`} href={app.route}>
      <span className={`kids-app-art ${app.previewClassName}`} aria-hidden="true">
        {app.previewText ? <span className="wild-preview-type">{app.previewText}</span> : <img className="app-preview-image" src={app.previewImage} alt="" />}
      </span>
      <span className="app-copy">
        <strong><span className="app-label">{app.label}</span>{app.name}</strong>
        <small>{app.description}</small>
        <b aria-hidden="true"><ArrowRightIcon /></b>
      </span>
    </Link>
  );
}

export default function HomePage() {
  return (
    <>
      <header className="topbar lab-topbar">
        <Link className="pf-brand" href="/"><img src="/design-system/brand.svg" alt="" />{SITE_NAME}</Link>
        <div className="topbar-actions">
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
        <section className="lab-section" aria-label="Quiz games">
          <h2 className="lab-section-title">Quiz games</h2>
          <div className="lab-app-grid">
            {QUIZ_APPS.map((app) => (
              <AppCard app={app} key={app.id} />
            ))}
          </div>
        </section>
        <section className="lab-section" aria-label="Non-quiz games">
          <h2 className="lab-section-title">Non-quiz games</h2>
          <div className="lab-app-grid">
            {OTHER_APPS.map((app) => (
              <AppCard app={app} key={app.id} />
            ))}
          </div>
        </section>
      </main>
      <footer className="lab-footer"><span>Made by CannedKalle and sons.</span><a className="support-link" href={creatorContactUrl} target="_blank" rel="noreferrer">Project on GitHub</a><span>Small games for big questions.</span></footer>
    </>
  );
}
