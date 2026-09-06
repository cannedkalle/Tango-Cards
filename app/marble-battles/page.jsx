export const metadata = {
  title: "Marble Battles | Kids Play Portal",
  description: "Play the Marble Battles cannon and territory simulator.",
};

export default function MarbleBattlesPage() {
  return (
    <main className="marble-route">
      <iframe
        title="Marble Battles"
        className="marble-frame"
        src="/apps/marble-royale/index.html"
      />
    </main>
  );
}
