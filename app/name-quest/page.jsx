import { APP_NAMES, BACK_TO_SITE_LABEL, pageTitle, SITE_NAME } from "../../lib/names";
const nameQuestUrl = process.env.NEXT_PUBLIC_NAME_QUEST_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");

export const metadata = {
  title: pageTitle(APP_NAMES.nameQuest),
  description: `Play ${APP_NAMES.nameQuest} from ${SITE_NAME}.`,
};

export default function NameQuestPage() {
  return (
    <main className="external-app-route guess-route">
      {nameQuestUrl ? (
        <iframe
          title={APP_NAMES.nameQuest}
          className="external-app-frame"
          src={nameQuestUrl}
        />
      ) : (
        <section className="external-app-missing" aria-label={`${APP_NAMES.nameQuest} setup`}>
          <p className="eyebrow">Game app</p>
          <h1>{APP_NAMES.nameQuest}</h1>
          <p>
            {APP_NAMES.nameQuest} needs its app URL before it can open here.
          </p>
          <a className="back-button" href="/">{BACK_TO_SITE_LABEL}</a>
        </section>
      )}
    </main>
  );
}
