import "./globals.css";
import { APP_NAMES, SITE_NAME } from "../lib/names";

export const metadata = {
  title: SITE_NAME,
  description: `A polished lab for kids play apps including ${APP_NAMES.tangoCards}, ${APP_NAMES.marbleBattles}, and ${APP_NAMES.nameQuest}.`,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
