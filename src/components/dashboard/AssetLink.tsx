import Link from "next/link";

/** Same reasoning as EmployeeLink/CandidateLink — an asset's tag/name cell
 * links through to Asset Inventory (`?asset=<id>` auto-opens its edit modal
 * there). */
export default function AssetLink({ asset }: { asset: { id: number; name: string; asset_tag: string } }) {
  return (
    <Link href={`/dashboard/asset-inventory?asset=${asset.id}`} className="group/asset block">
      <div className="truncate font-semibold text-ink group-hover/asset:text-primary group-hover/asset:underline">
        {asset.name}
      </div>
      <div className="truncate text-xs text-ink-soft">{asset.asset_tag}</div>
    </Link>
  );
}
