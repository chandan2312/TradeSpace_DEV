/**
 * lib/watchlistAliases.js
 * 
 * Multi-alias symbol resolution and matching engine for Watchlist items,
 * quotes, ticks, daily opens, and cached bars.
 */

export function getSymbolAliases(sym) {
  if (!sym || typeof sym !== "string") return [];
  const s = sym.trim();
  const upper = s.toUpperCase();
  const lower = s.toLowerCase();
  const stripped = upper.replace(/\.[a-zA-Z0-9]+$/, "");
  const strippedLower = lower.replace(/\.[a-zA-Z0-9]+$/, "");

  const parts = s.split(".");
  const base = parts[0];
  const ext = parts.length > 1 ? parts.slice(1).join(".") : "";

  const set = new Set([
    s,
    upper,
    lower,
    stripped,
    strippedLower,
  ]);

  if (ext) {
    set.add(`${base.toUpperCase()}.${ext.toLowerCase()}`); // e.g. EURUSD.i
    set.add(`${base.toUpperCase()}.${ext.toUpperCase()}`); // e.g. EURUSD.I
    set.add(`${base.toLowerCase()}.${ext.toLowerCase()}`); // e.g. eurusd.i
    set.add(`${base.toLowerCase()}.${ext.toUpperCase()}`); // e.g. eurusd.I
  }

  return Array.from(set);
}

export function resolveAliasValue(sym, map) {
  if (!map || !sym) return null;
  if (map[sym] !== undefined && map[sym] !== null) return map[sym];

  const aliases = getSymbolAliases(sym);
  for (const a of aliases) {
    if (map[a] !== undefined && map[a] !== null) return map[a];
  }

  // Case-insensitive direct matching and suffix-insensitive matching
  const symLower = sym.toLowerCase();
  const strippedLower = symLower.replace(/\.[a-z0-9]+$/, "");

  for (const [k, v] of Object.entries(map)) {
    if (v === undefined || v === null) continue;
    const kLower = k.toLowerCase();
    if (kLower === symLower) return v;
    if (kLower.replace(/\.[a-z0-9]+$/, "") === strippedLower) return v;
  }

  return null;
}
