import "./globals.css";
import { APP_NAMES } from "../lib/apps";
import { SITE_NAME } from "../lib/names";
import RegisterServiceWorker from "./components/RegisterServiceWorker";

export const metadata = {
  title: SITE_NAME,
  icons: {
    icon: "/design-system/brand.svg",
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  description: `A polished lab for kids play apps including ${APP_NAMES.tangoCards}, ${APP_NAMES.marbleBattles}, ${APP_NAMES.nameQuest}, and ${APP_NAMES.animalOutsider}.`,
};

export const viewport = {
  themeColor: "#276044",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
