import { redirect } from "next/navigation";

export const metadata = {
  title: "Marble Battles | Kids Play Portal",
  description: "Play the Marble Battles cannon and territory simulator.",
};

export default function MarbleRoyaleAliasPage() {
  redirect("/marble-battles");
}
