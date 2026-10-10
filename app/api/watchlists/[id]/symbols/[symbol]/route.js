import { getCols, allWatchlists } from "@/lib/mongo";
import { broadcast } from "@/lib/realtime";
import { json, oid } from "@/lib/http";
import { toCanonicalSymbol } from "@/lib/symbols/mapping";
import { getSymbolAliases } from "@/lib/watchlistAliases";

export const dynamic = "force-dynamic";

export async function DELETE(_req, { params }) {
  const _id = oid(params.id);
  if (!_id) return json({ ok: false, error: "invalid id" }, 400);
  const rawSymbol = String(params.symbol || "").trim();
  const canon = toCanonicalSymbol(rawSymbol);
  const aliases = getSymbolAliases(rawSymbol);
  const targets = Array.from(new Set([rawSymbol, rawSymbol.toUpperCase(), canon, ...aliases]));

  const { watchlistsCol } = await getCols();
  await watchlistsCol.updateOne(
    { _id },
    { $pull: { symbols: { $in: targets } } }
  );
  broadcast({ type: "watchlists_changed" });
  return json({ ok: true, watchlists: await allWatchlists() });
}
