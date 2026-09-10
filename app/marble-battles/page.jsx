import { APP_NAMES, pageTitle, SITE_NAME } from "../../lib/names";
export const metadata = {
  title: pageTitle(APP_NAMES.marbleBattles),
  description: "Play " + APP_NAMES.marbleBattles + " from " + SITE_NAME + ".",
};

export default function MarbleBattlesPage() {
  return (
    <main className="marble-route">
      <iframe
        title={APP_NAMES.marbleBattles}
        className="marble-frame"
        src="/apps/marble-battles"
      />
    </main>
  );
}
