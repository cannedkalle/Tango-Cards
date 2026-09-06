import "./globals.css";

export const metadata = {
  title: "Kids Play Portal",
  description: "A polished portal for kids play apps including Tango Cards and Marble Battles.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
