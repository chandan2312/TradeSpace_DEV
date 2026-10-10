import { bridge, ratesCache, RATES_TTL_MS } from "@/lib/bridge";
import { json } from "@/lib/http";
import { normalizeCandles } from "@/lib/candleNormalization";
import { toCanonicalSymbol, toBrokerSymbol } from "@/lib/symbols/mapping";

export const dynamic = "force-dynamic";

const TF_NORMALIZE = {
  "1M": "M1", "5M": "M5", "15M": "M15", "30M": "M30", "1H": "H1", "4H": "H4", "1D": "D1",
  "M1": "M1", "M5": "M5", "M15": "M15", "M30": "M30", "H1": "H1", "H4": "H4", "D1": "D1",
};

export async function GET(req) {
  const sp = req.nextUrl.searchParams;
  const rawSymbol = sp.get("symbol");
  const rawTf = String(sp.get("tf") || "M5").toUpperCase();
  const tf = TF_NORMALIZE[rawTf] || rawTf;
  const count = sp.get("count") || 600;
  const offset = sp.get("offset") || 0;
  if (!rawSymbol) return json({ ok: false, error: "symbol required" }, 400);

  const canonicalSym = toCanonicalSymbol(rawSymbol);
  const brokerSym = toBrokerSymbol(canonicalSym);
  const n = Math.min(Number(count) || 600, 5000);
  const off = Math.max(0, Number(offset) || 0);
  
  // Cache keys use canonical symbol for universal consistency
  const key = `${canonicalSym}:${tf}:${n}:${off}`;
  const brokerKey = `${brokerSym}:${tf}:${n}:${off}`;

  const cached = ratesCache.get(key) || ratesCache.get(brokerKey);
  if (cached && Date.now() - cached.at < RATES_TTL_MS) return json(cached.data);

  try {
    const data = await bridge("POST", "/rates", { sym: brokerSym, timeframe: tf, count: n, offset: off }, { timeoutMs: 6_000 });
    if (data.ok && Array.isArray(data.bars)) {
      data.bars = normalizeCandles(data.bars, tf);
      data.symbol = canonicalSym;
      data.brokerSymbol = brokerSym;
      ratesCache.set(key, { at: Date.now(), data });
      if (brokerKey !== key) ratesCache.set(brokerKey, { at: Date.now(), data });
      return json(data);
    }
    // Bridge error / offline: serve cached bars if available
    if (cached?.data?.bars?.length) {
      return json({ ...cached.data, stale: true, offline: true, error: data.message });
    }
    return json(data);
  } catch (err) {
    if (cached?.data?.bars?.length) {
      return json({ ...cached.data, stale: true, offline: true, error: err.message });
    }
    return json({ ok: false, error: err.message }, 502);
  }
}
