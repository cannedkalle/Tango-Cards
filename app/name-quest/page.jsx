import { getAppById } from "../../lib/apps";
import { pageTitle, SITE_NAME } from "../../lib/names";
import NameQuestClient from "./NameQuestClient";

const app = getAppById("name-quest");

export const metadata = {
  title: pageTitle(app.name),
  description: "Play " + app.name + " from " + SITE_NAME + ".",
};

export default function NameQuestPage() {
  return <NameQuestClient />;
}
