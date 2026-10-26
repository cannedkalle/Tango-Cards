import { getAppById } from "../../lib/apps";
import { pageTitle, SITE_NAME } from "../../lib/names";
import Game from "./Game";
import "./marble-battles.css";

const app = getAppById("marble-battles");

export const metadata = {
  title: pageTitle(app.name),
  description: "Play " + app.name + " from " + SITE_NAME + ".",
};

export default function MarbleBattlesPage() {
  return <Game />;
}
