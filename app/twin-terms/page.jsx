import { getAppById } from "../../lib/apps";
import { pageTitle } from "../../lib/names";
import Game from "./Game";
import "./twin-terms.css";

const app = getAppById("twin-terms");

export const metadata = {
  title: pageTitle(app.name),
  description: app.description,
};

export default function TwinTermsPage() {
  return <Game />;
}
