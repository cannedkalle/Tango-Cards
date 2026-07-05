import "./globals.css";

export const metadata = {
  title: "Tango Cards",
  description: "Browse and rate generated Tango Cards.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
