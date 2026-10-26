import Link from "next/link";
import { ArrowLeftIcon } from "./Icons";
import { BACK_TO_SITE_LABEL, SITE_NAME } from "../../lib/names";

export default function PortalNav() {
  return (
    <nav className="pf-portal-nav portal-page-nav" aria-label="Portal navigation">
      <Link className="pf-brand" href="/"><img src="/design-system/brand.svg" alt="" />{SITE_NAME}</Link>
      <Link className="pf-back" href="/"><ArrowLeftIcon />{BACK_TO_SITE_LABEL}</Link>
    </nav>
  );
}
