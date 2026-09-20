import { getAppById } from "../../lib/apps";
import { pageTitle, SITE_NAME } from "../../lib/names";

const app = getAppById("before-the-bulb");

export const metadata = {
  title: pageTitle(app.name),
  description: "Play " + app.name + " from " + SITE_NAME + ".",
};

export default function BeforeTheBulbPage() {
  return (
    <main className="static-app-route">
      <iframe title={app.name} className="static-app-frame" src={app.publicPath} />
    </main>
  );
}
