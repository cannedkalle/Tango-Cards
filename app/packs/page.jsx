import { APP_NAMES } from "../../lib/apps";
import { pageTitle } from "../../lib/names";
import PacksClient from "../tango-cards/PacksClient";
import Topbar from "../components/Topbar";
import { expansionPacks, oddsLabel } from "../../lib/tango-cards/packs.mjs";
import { seriesList } from "../../lib/tango-cards/cards.mjs";

export const metadata = {
  title: pageTitle("Expansion Packs - " + APP_NAMES.tangoCards),
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
