import { APP_NAMES, pageTitle } from "../../lib/names";
import NameQuestClient from "./NameQuestClient";

export const metadata = {
  title: pageTitle(APP_NAMES.nameQuest),
  description: "Play " + APP_NAMES.nameQuest + " from Whimsical Play Ideas.",
};

export default function NameQuestPage() {
  return <NameQuestClient />;
}
