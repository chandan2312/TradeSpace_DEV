// Pure symbol normalization and canonical aliasing utilities.
// Re-exports and integrates with lib/symbols/mapping.js for centralized mapping.

import {
  toCanonicalSymbol,
  toBrokerSymbol,
  HEURISTIC_ALIASES,
  DEFAULT_CANONICAL_SYMBOLS,
  isForexPair,
} from "../symbols/mapping.js";

export {
  toCanonicalSymbol,
  toBrokerSymbol,
  DEFAULT_CANONICAL_SYMBOLS,
  isForexPair,
};

export const ALIASES = [
  ["DJ30",   /^(DJ30|US30|DOW30?|DJI|WALLSTREET)$/i],
  ["NAS100", /^(NAS100|NDX100?|USTEC|US100)$/i],
  ["SP500",  /^(SP500|US500|SPX500?|SPX)$/i],
  ["GER40",  /^(GER[34]0|DE[34]0|DAX40?)$/i],
  ["UK100",  /^(UK100|FTSE100?)$/i],
  ["XAUUSD", /^(XAUUSD|GOLD)$/i],
  ["XAGUSD", /^(XAGUSD|SILVER)$/i],
  ["BTCUSD", /^(BTCUSD|BITCOIN)$/i],
  ["ETHUSD", /^(ETHUSD|ETHEREUM)$/i],
];

export const baseOf = (s) => (s || "").replace(/[._-].*$/, "").replace(/m$/i, "").toUpperCase();

export const canonOf = (s) => toCanonicalSymbol(s);
