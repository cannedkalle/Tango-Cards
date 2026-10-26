import { getAppById } from "../../lib/apps";
import { pageTitle } from "../../lib/names";
import Game from "./Game";
import "./two-hints.css";

const app = getAppById("two-hints");

export const metadata = {
  title: pageTitle(app.name),
  description: app.description,
};

export default function TwoHintsPage() {
  return <Game />;
}
