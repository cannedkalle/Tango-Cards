import { getAppById } from "../../lib/apps";
import { pageTitle, SITE_NAME } from "../../lib/names";

const app = getAppById("marble-battles");

export const metadata = {
  title: pageTitle(app.name),
  description: "Play " + app.name + " from " + SITE_NAME + ".",
};

export default function MarbleBattlesPage() {
  return (
    <main className="marble-route">
      <iframe
        title={app.name}
        className="marble-frame"
        src={app.publicPath}
      />
    </main>
  );
}
