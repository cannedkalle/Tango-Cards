<<<<<<< HEAD
<<<<<<< HEAD
import { redirect } from "next/navigation";

export const metadata = {
  title: "Marble Battles | Kids Play Portal",
  description: "Play the Marble Battles cannon and territory simulator.",
};

export default function MarbleRoyaleAliasPage() {
  redirect("/marble-battles");
=======
=======
>>>>>>> c08131e62e2aef320c0fa689408867b93e593317
export const metadata = {
  title: "Marble Royale | Kids Play Portal",
  description: "Play the Marble Royale cannon and territory simulator.",
};

export default function MarbleRoyalePage() {
  return (
    <main className="marble-route">
      <iframe
        title="Marble Royale"
        className="marble-frame"
        src="/apps/marble-royale/index.html"
      />
    </main>
  );
<<<<<<< HEAD
>>>>>>> c08131e62e2aef320c0fa689408867b93e593317
=======
>>>>>>> c08131e62e2aef320c0fa689408867b93e593317
}
