import PacksClient from "../components/PacksClient";
import Topbar from "../components/Topbar";
import { expansionPacks, oddsLabel } from "../../lib/packs";
import { seriesList } from "../../lib/cards";

export const metadata = {
  title: "Expansion Packs - Tango Cards",
};

export default async function PacksPage({ searchParams }) {
  const params = await searchParams;
  const requestedPackKey = params?.pack || "";
  const initialPackKey = expansionPacks.some((pack) => pack.key === requestedPackKey) ? requestedPackKey : expansionPacks[0]?.key;

  return (
    <>
      <Topbar
        eyebrow="Digital card collection"
        title="Expansion Packs"
        stats={[`${expansionPacks.length} packs`, oddsLabel()]}
      />
      <PacksClient packs={expansionPacks} series={seriesList} initialPackKey={initialPackKey} />
    </>
  );
}
