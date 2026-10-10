import { getCols, allWatchlists } from "@/lib/mongo";
import { broadcast } from "@/lib/realtime";
import { json, oid } from "@/lib/http";
import { toCanonicalSymbol } from "@/lib/symbols/mapping";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  const _id = oid(params.id);
  if (!_id) return json({ ok: false, error: "invalid id" }, 400);
  const rawSymbol = String((await req.json())?.symbol || "").trim();
  if (!rawSymbol) return json({ ok: false, error: "symbol required" }, 400);

  const canonicalSymbol = toCanonicalSymbol(rawSymbol);

  const { watchlistsCol } = await getCols();
  await watchlistsCol.updateOne({ _id }, { $addToSet: { symbols: canonicalSymbol } });
  broadcast({ type: "watchlists_changed" });
  return json({ ok: true, watchlists: await allWatchlists() });
}
