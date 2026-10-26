import { getAppById } from "../../lib/apps";
import { pageTitle, SITE_NAME } from "../../lib/names";
import Game from "./Game";
import "./before-the-bulb.css";

const app = getAppById("before-the-bulb");

export const metadata = {
  title: pageTitle(app.name),
  description: "Play " + app.name + " from " + SITE_NAME + ".",
};

export default function BeforeTheBulbPage() {
  return <Game />;
}
