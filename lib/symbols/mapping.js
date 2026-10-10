/**
 * lib/symbols/mapping.js
 * 
 * TradeSpace Centralized Symbol Naming & MT5 Broker Mapping Engine.
 * 
 * Provides an authoritative single source of truth for:
 * 1. Canonical Symbol Registry: Every asset in TradeSpace has exactly ONE canonical name
 *    (e.g. NAS100, DJ30, SP500, GER40, XAUUSD, BTCUSD, EURUSD, GBPUSD).
 * 2. User-Configurable Broker Mapping: In settings, users can map any canonical symbol
 *    to their specific MT5 broker symbol (e.g. NAS100 -> USTEC or US100).
 * 3. Forex / Instrument Suffix Rules: Global suffix for currency pairs (e.g. .i, .I, _m, .pro).
 * 4. Bidirectional Resolvers:
 *    - toBrokerSymbol(canonicalSym): What to send to MT5 broker.
 *    - toCanonicalSymbol(brokerSym): What to store/display internally.
 * 5. Auto-Detection: Automatically detects broker naming patterns from MT5 symbols list.
 * 
 * Safe for both server (Node.js) and client (React) execution.
 */

// Global state bridge for Node.js server environments
const g = globalThis;

/**
 * Standard Canonical Symbol Registry
 */
export const DEFAULT_CANONICAL_SYMBOLS = [
  // Indices
  { symbol: "NAS100", name: "Nasdaq 100 Index", category: "index", defaultBroker: "NAS100", description: "US Tech 100 / Nasdaq Cash" },
  { symbol: "DJ30",   name: "Dow Jones 30 Index", category: "index", defaultBroker: "DJ30", description: "US Wall Street 30 / Dow Jones" },
  { symbol: "SP500",  name: "S&P 500 Index", category: "index", defaultBroker: "SP500", description: "US S&P 500 / US500" },
  { symbol: "GER40",  name: "DAX 40 Index", category: "index", defaultBroker: "GER40", description: "German DAX 40 / DE40" },
  { symbol: "UK100",  name: "FTSE 100 Index", category: "index", defaultBroker: "UK100", description: "UK FTSE 100" },
  { symbol: "JP225",  name: "Nikkei 225 Index", category: "index", defaultBroker: "JP225", description: "Japan Nikkei 225" },

  // Metals & Commodities
  { symbol: "XAUUSD", name: "Gold / US Dollar", category: "metal", defaultBroker: "XAUUSD", description: "Spot Gold vs USD" },
  { symbol: "XAGUSD", name: "Silver / US Dollar", category: "metal", defaultBroker: "XAGUSD", description: "Spot Silver vs USD" },
  { symbol: "USOIL",  name: "WTI Crude Oil", category: "commodity", defaultBroker: "USOIL", description: "US Crude Oil Spot" },

  // Cryptocurrencies
  { symbol: "BTCUSD", name: "Bitcoin / US Dollar", category: "crypto", defaultBroker: "BTCUSD", description: "Bitcoin vs USD" },
  { symbol: "ETHUSD", name: "Ethereum / US Dollar", category: "crypto", defaultBroker: "ETHUSD", description: "Ethereum vs USD" },
  { symbol: "SOLUSD", name: "Solana / US Dollar", category: "crypto", defaultBroker: "SOLUSD", description: "Solana vs USD" },

  // Forex Major & Minor Pairs
  { symbol: "EURUSD", name: "Euro / US Dollar", category: "forex", defaultBroker: "EURUSD", description: "EUR/USD Currency Pair" },
  { symbol: "GBPUSD", name: "British Pound / USD", category: "forex", defaultBroker: "GBPUSD", description: "GBP/USD Currency Pair" },
  { symbol: "USDJPY", name: "US Dollar / Japanese Yen", category: "forex", defaultBroker: "USDJPY", description: "USD/JPY Currency Pair" },
  { symbol: "AUDUSD", name: "Australian Dollar / USD", category: "forex", defaultBroker: "AUDUSD", description: "AUD/USD Currency Pair" },
  { symbol: "USDCAD", name: "US Dollar / Canadian Dollar", category: "forex", defaultBroker: "USDCAD", description: "USD/CAD Currency Pair" },
  { symbol: "USDCHF", name: "US Dollar / Swiss Franc", category: "forex", defaultBroker: "USDCHF", description: "USD/CHF Currency Pair" },
  { symbol: "NZDUSD", name: "New Zealand Dollar / USD", category: "forex", defaultBroker: "NZDUSD", description: "NZD/USD Currency Pair" },
  { symbol: "EURGBP", name: "Euro / British Pound", category: "forex", defaultBroker: "EURGBP", description: "EUR/GBP Cross" },
  { symbol: "EURJPY", name: "Euro / Japanese Yen", category: "forex", defaultBroker: "EURJPY", description: "EUR/JPY Cross" },
  { symbol: "GBPJPY", name: "British Pound / Japanese Yen", category: "forex", defaultBroker: "GBPJPY", description: "GBP/JPY Cross" },
  { symbol: "AUDJPY", name: "Australian Dollar / Japanese Yen", category: "forex", defaultBroker: "AUDJPY", description: "AUD/JPY Cross" },
  { symbol: "EURAUD", name: "Euro / Australian Dollar", category: "forex", defaultBroker: "EURAUD", description: "EUR/AUD Cross" },
  { symbol: "GBPAUD", name: "British Pound / Australian Dollar", category: "forex", defaultBroker: "GBPAUD", description: "GBP/AUD Cross" },
  { symbol: "EURCAD", name: "Euro / Canadian Dollar", category: "forex", defaultBroker: "EURCAD", description: "EUR/CAD Cross" },
  { symbol: "GBPCAD", name: "British Pound / Canadian Dollar", category: "forex", defaultBroker: "GBPCAD", description: "GBP/CAD Cross" },
  { symbol: "AUDCAD", name: "Australian Dollar / Canadian Dollar", category: "forex", defaultBroker: "AUDCAD", description: "AUD/CAD Cross" },
  { symbol: "CADJPY", name: "Canadian Dollar / Japanese Yen", category: "forex", defaultBroker: "CADJPY", description: "CAD/JPY Cross" },
  { symbol: "CHFJPY", name: "Swiss Franc / Japanese Yen", category: "forex", defaultBroker: "CHFJPY", description: "CHF/JPY Cross" },
];

/**
 * Built-in fallback alias regexes for standard brokers
 */
export const HEURISTIC_ALIASES = [
  ["NAS100", /^(NAS100|NDX100?|USTEC|US100|US100\.CASH|NAS100\.CASH|USTEC_M)$/i],
  ["DJ30",   /^(DJ30|US30|DOW30?|DJI|WALLSTREET|US30\.CASH|DJ30\.CASH)$/i],
  ["SP500",  /^(SP500|US500|SPX500?|SPX|SP500\.CASH|US500\.CASH)$/i],
  ["GER40",  /^(GER[34]0|DE[34]0|DAX40?|GER40\.CASH|DE40\.CASH)$/i],
  ["UK100",  /^(UK100|FTSE100?|UK100\.CASH)$/i],
  ["JP225",  /^(JP225|NIKKEI225?|N225)$/i],
  ["XAUUSD", /^(XAUUSD|GOLD|XAUUSD\.CASH|GOLD\.CASH)$/i],
  ["XAGUSD", /^(XAGUSD|SILVER|XAGUSD\.CASH)$/i],
  ["USOIL",  /^(USOIL|CRUDE|WTI|CRUDEOIL)$/i],
  ["BTCUSD", /^(BTCUSD|BITCOIN|BTCUSDm|BTCUSDT)$/i],
  ["ETHUSD", /^(ETHUSD|ETHEREUM|ETHUSDm|ETHUSDT)$/i],
  ["SOLUSD", /^(SOLUSD|SOLUSDT)$/i],
];

/**
 * Currency pairs standard 6-char forex regex
 */
const FOREX_PAIR_REGEX = /^(EUR|GBP|USD|AUD|NZD|CAD|CHF|JPY|SEK|NOK|SGD|HKD|CNH|ZAR|TRY|MXN){2}$/i;

export function isForexPair(symbol) {
  if (!symbol || typeof symbol !== "string") return false;
  const s = symbol.trim().replace(/[._-].*$/, "").replace(/m$/i, "");
  return s.length === 6 && FOREX_PAIR_REGEX.test(s);
}

/**
 * Default Mapping Configuration
 */
export const DEFAULT_SYMBOL_MAPPING = {
  forexSuffix: ".i", // Default suffix on active broker, user configurable
  generalSuffix: "",
  customMap: {
    NAS100: "NAS100",
    DJ30: "DJ30",
    SP500: "SP500",
    GER40: "GER40",
    XAUUSD: "XAUUSD",
    BTCUSD: "BTCUSD",
  },
};

export const KNOWN_BROKER_ALIASES = {
  NAS100: ["USTEC", "US100", "NAS100", "NDX100", "NAS100.cash", "US100.cash"],
  DJ30: ["US30", "DJ30", "DJI", "DOW30", "US30.cash", "DJ30.cash"],
  SP500: ["US500", "SP500", "SPX500", "SPX", "US500.cash", "SP500.cash"],
  GER40: ["DE40", "GER40", "GER30", "DAX", "DAX40", "DE40.cash"],
  UK100: ["UK100", "FTSE100", "UK100.cash"],
  JP225: ["JP225", "NIKKEI225", "N225"],
  XAUUSD: ["GOLD", "XAUUSD", "XAUUSD.cash", "GOLD.cash"],
  XAGUSD: ["SILVER", "XAGUSD", "XAGUSD.cash"],
  USOIL: ["WTI", "CRUDE", "USOIL", "CRUDEOIL"],
  BTCUSD: ["BTCUSD", "BITCOIN", "BTCUSDm", "BTCUSDT"],
  ETHUSD: ["ETHUSD", "ETHEREUM", "ETHUSDm", "ETHUSDT"],
  SOLUSD: ["SOLUSD", "SOLUSDT"],
};

export function getKnownAliasesForCanonical(canon) {
  if (!canon) return [];
  const upper = canon.toUpperCase();
  return KNOWN_BROKER_ALIASES[upper] || [];
}

/**
 * Storage Key
 */
export const SYMBOL_MAPPING_LS_KEY = "ts_symbol_mapping";

/**
 * Server Global Cache initialization
 */
if (!g._tsSymbolMapping) {
  g._tsSymbolMapping = { ...DEFAULT_SYMBOL_MAPPING };
}

export function getServerSymbolMapping() {
  return g._tsSymbolMapping || { ...DEFAULT_SYMBOL_MAPPING };
}

export function setServerSymbolMapping(mapping) {
  if (!mapping || typeof mapping !== "object") return;
  g._tsSymbolMapping = {
    ...DEFAULT_SYMBOL_MAPPING,
    ...g._tsSymbolMapping,
    ...mapping,
    customMap: {
      ...(DEFAULT_SYMBOL_MAPPING.customMap || {}),
      ...(g._tsSymbolMapping?.customMap || {}),
      ...(mapping.customMap || {}),
    },
  };
}

/**
 * Client Storage Access
 */
export function getClientSymbolMapping() {
  if (typeof window === "undefined") return getServerSymbolMapping();
  try {
    const raw = localStorage.getItem(SYMBOL_MAPPING_LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SYMBOL_MAPPING,
        ...parsed,
        customMap: {
          ...(DEFAULT_SYMBOL_MAPPING.customMap || {}),
          ...(parsed.customMap || {}),
        },
      };
    }
  } catch {}
  return { ...DEFAULT_SYMBOL_MAPPING };
}

export function saveClientSymbolMapping(mapping) {
  if (typeof window === "undefined") {
    setServerSymbolMapping(mapping);
    return;
  }
  try {
    localStorage.setItem(SYMBOL_MAPPING_LS_KEY, JSON.stringify(mapping));
    window.dispatchEvent(new CustomEvent("ts_symbol_mapping_updated", { detail: mapping }));
  } catch {}
}

/**
 * Resolves current active mapping configuration
 */
function resolveConfig(overrideConfig = null) {
  if (overrideConfig && typeof overrideConfig === "object") return overrideConfig;
  if (typeof window !== "undefined") return getClientSymbolMapping();
  return getServerSymbolMapping();
}

/**
 * Maps a Canonical Symbol -> MT5 Broker Symbol
 * 
 * Rules:
 * 1. Check customMap[sym]: if explicit user mapping exists (e.g. NAS100 -> USTEC), use it.
 * 2. If it's a forex pair and forexSuffix is specified, append suffix (e.g. EURUSD -> EURUSD.i).
 * 3. If generalSuffix is specified, append suffix.
 * 4. Return normalized symbol as fallback.
 * 
 * @param {string} canonicalSym - Canonical symbol (e.g. "NAS100", "EURUSD", "DJ30")
 * @param {object} [mappingConfig] - Optional explicit mapping config
 * @returns {string} - Broker symbol to query on MT5
 */
export function toBrokerSymbol(canonicalSym, mappingConfig = null) {
  if (!canonicalSym || typeof canonicalSym !== "string") return "";
  const sym = canonicalSym.trim().toUpperCase();
  const cfg = resolveConfig(mappingConfig);
  const customMap = cfg.customMap || {};

  // 1. Explicit user mapping takes top priority
  if (customMap[sym] && typeof customMap[sym] === "string" && customMap[sym].trim()) {
    return customMap[sym].trim();
  }

  // Check case-insensitive customMap
  for (const [k, v] of Object.entries(customMap)) {
    if (k.toUpperCase() === sym && v && typeof v === "string" && v.trim()) {
      return v.trim();
    }
  }

  // 2. Forex Pair Suffix Rule
  if (isForexPair(sym)) {
    const sfx = cfg.forexSuffix !== undefined && cfg.forexSuffix !== null && cfg.forexSuffix !== ""
      ? String(cfg.forexSuffix)
      : (cfg.generalSuffix || "");
    return `${sym}${sfx}`;
  }

  // 3. General Suffix Rule
  if (cfg.generalSuffix) {
    return `${sym}${cfg.generalSuffix}`;
  }

  return sym;
}

/**
 * Maps an MT5 Broker Symbol -> Canonical Symbol
 * 
 * Rules:
 * 1. Check reverse customMap: if broker symbol matches customMap[canonical], return canonical.
 * 2. Check if broker symbol ends with configured forexSuffix: strip suffix and check if canonical.
 * 3. Check stripped broker suffixes (.i, .I, _m, .pro, .cash, etc.).
 * 4. Check HEURISTIC_ALIASES table (e.g. USTEC -> NAS100, US30 -> DJ30, GOLD -> XAUUSD).
 * 5. Return cleaned base symbol.
 * 
 * @param {string} brokerSym - Incoming symbol from MT5 (e.g. "USTEC", "EURUSD.i", "GOLD")
 * @param {object} [mappingConfig] - Optional explicit mapping config
 * @returns {string} - Canonical symbol used inside TradeSpace
 */
export function toCanonicalSymbol(brokerSym, mappingConfig = null) {
  if (!brokerSym || typeof brokerSym !== "string") return "";
  const raw = brokerSym.trim();
  const upper = raw.toUpperCase();
  const cfg = resolveConfig(mappingConfig);
  const customMap = cfg.customMap || {};

  // 1. Explicit Reverse Mapping (Broker -> Canonical)
  for (const [canon, mapped] of Object.entries(customMap)) {
    if (mapped && typeof mapped === "string" && mapped.trim().toUpperCase() === upper) {
      return canon.toUpperCase();
    }
  }

  // 2. Forex Suffix Strip
  const forexSfx = (cfg.forexSuffix || "").trim().toUpperCase();
  if (forexSfx && upper.endsWith(forexSfx)) {
    const stripped = upper.slice(0, upper.length - forexSfx.length);
    if (isForexPair(stripped) || DEFAULT_CANONICAL_SYMBOLS.some((s) => s.symbol === stripped)) {
      return stripped;
    }
  }

  // 3. Generic Suffix Strip (.i, .I, _m, .pro, .cash, etc.)
  const strippedBase = upper.replace(/\.[a-zA-Z0-9]+$/, "").replace(/_m$/i, "").replace(/m$/i, "");

  // Check reverse customMap for stripped base
  for (const [canon, mapped] of Object.entries(customMap)) {
    if (mapped && typeof mapped === "string" && mapped.trim().toUpperCase() === strippedBase) {
      return canon.toUpperCase();
    }
  }

  // 4. Built-in Heuristic Aliases
  for (const [canon, re] of HEURISTIC_ALIASES) {
    if (re.test(upper) || re.test(strippedBase)) {
      return canon;
    }
  }

  // 5. Forex pair check on base
  if (isForexPair(strippedBase)) {
    return strippedBase;
  }

  // 6. Direct match with standard canonical symbols
  const found = DEFAULT_CANONICAL_SYMBOLS.find((s) => s.symbol === upper || s.symbol === strippedBase);
  if (found) return found.symbol;

  return strippedBase || upper;
}

/**
 * Translates an array of canonical symbols to broker symbols
 */
export function toBrokerSymbols(canonicalList, mappingConfig = null) {
  if (!Array.isArray(canonicalList)) return [];
  return canonicalList.map((s) => toBrokerSymbol(s, mappingConfig)).filter(Boolean);
}

/**
 * Translates an array of broker symbols to canonical symbols
 */
export function toCanonicalSymbols(brokerList, mappingConfig = null) {
  if (!Array.isArray(brokerList)) return [];
  return brokerList.map((s) => toCanonicalSymbol(s, mappingConfig)).filter(Boolean);
}

/**
 * Translates a batch of ticks from broker keys to canonical keys
 * @param {object} ticksMap - Object of { [brokerSymbol]: tickData }
 * @param {object} [mappingConfig] - Optional explicit mapping config
 * @returns {object} - Object of { [canonicalSymbol]: tickDataWithCanonicalSymbol }
 */
export function translateTickBatchToCanonical(ticksMap, mappingConfig = null) {
  if (!ticksMap || typeof ticksMap !== "object") return {};
  const out = {};
  for (const [brokerSym, tick] of Object.entries(ticksMap)) {
    if (!tick) continue;
    const canonSym = toCanonicalSymbol(brokerSym, mappingConfig);
    const enriched = {
      ...tick,
      symbol: canonSym,
      brokerSymbol: brokerSym,
    };
    out[canonSym] = enriched;
    // Also retain original key if distinct so backwards compatibility is preserved
    if (brokerSym !== canonSym && !out[brokerSym]) {
      out[brokerSym] = enriched;
    }
  }
  return out;
}

/**
 * Auto-detects recommended symbol mapping by inspecting a list of broker symbols.
 * 
 * @param {Array<string|object>} brokerSymbols - Array of symbol names or MT5 symbol objects
 * @returns {object} - Suggested symbol mapping configuration
 */
export function detectBrokerMapping(brokerSymbols) {
  if (!Array.isArray(brokerSymbols) || !brokerSymbols.length) {
    return { ...DEFAULT_SYMBOL_MAPPING };
  }

  const names = brokerSymbols.map((s) => (typeof s === "string" ? s : s?.name || "")).filter(Boolean);
  const nameSet = new Set(names.map((n) => n.toUpperCase()));

  // 1. Detect Forex Suffix
  let detectedForexSuffix = "";
  const candidateSuffixes = [".i", ".I", "_m", ".pro", ".raw", ".ecn", ".m", "m"];
  const forexTestPairs = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD"];

  for (const sfx of candidateSuffixes) {
    let matchCount = 0;
    let actualSuffix = "";
    for (const pair of forexTestPairs) {
      const match = names.find((n) => n.toUpperCase() === `${pair}${sfx}`.toUpperCase());
      if (match) {
        matchCount++;
        actualSuffix = match.slice(pair.length);
      }
    }
    if (matchCount >= 2) {
      detectedForexSuffix = actualSuffix || sfx;
      break;
    }
  }

  // 2. Detect Mappings for Indices & Commodities
  const detectedCustomMap = {};

  const searchBrokerMatch = (canon, aliases) => {
    for (const alias of aliases) {
      const match = names.find((n) => n.toUpperCase() === alias.toUpperCase());
      if (match) {
        return match;
      }
    }
    // Check with detected suffix
    if (detectedForexSuffix) {
      for (const alias of aliases) {
        const match = names.find((n) => n.toUpperCase() === `${alias}${detectedForexSuffix}`.toUpperCase());
        if (match) {
          return match;
        }
      }
    }
    return "";
  };

  // NAS100
  const nasMatch = searchBrokerMatch("NAS100", ["NAS100", "USTEC", "US100", "NDX100", "NAS100.cash"]);
  if (nasMatch) detectedCustomMap["NAS100"] = nasMatch;

  // DJ30
  const djMatch = searchBrokerMatch("DJ30", ["DJ30", "US30", "DOW30", "DJI", "WALLSTREET", "US30.cash"]);
  if (djMatch) detectedCustomMap["DJ30"] = djMatch;

  // SP500
  const spMatch = searchBrokerMatch("SP500", ["SP500", "US500", "SPX500", "SPX", "US500.cash"]);
  if (spMatch) detectedCustomMap["SP500"] = spMatch;

  // GER40
  const gerMatch = searchBrokerMatch("GER40", ["GER40", "DE40", "DAX40", "GER30", "DE30", "GER40.cash"]);
  if (gerMatch) detectedCustomMap["GER40"] = gerMatch;

  // UK100
  const ukMatch = searchBrokerMatch("UK100", ["UK100", "FTSE100", "UK100.cash"]);
  if (ukMatch) detectedCustomMap["UK100"] = ukMatch;

  // XAUUSD
  const goldMatch = searchBrokerMatch("XAUUSD", ["XAUUSD", "GOLD", "XAUUSD.cash", "GOLD.cash"]);
  if (goldMatch) detectedCustomMap["XAUUSD"] = goldMatch;

  // XAGUSD
  const silverMatch = searchBrokerMatch("XAGUSD", ["XAGUSD", "SILVER"]);
  if (silverMatch) detectedCustomMap["XAGUSD"] = silverMatch;

  // BTCUSD
  const btcMatch = searchBrokerMatch("BTCUSD", ["BTCUSD", "BITCOIN", "BTCUSDm", "BTCUSDT"]);
  if (btcMatch) detectedCustomMap["BTCUSD"] = btcMatch;

  // ETHUSD
  const ethMatch = searchBrokerMatch("ETHUSD", ["ETHUSD", "ETHEREUM", "ETHUSDm"]);
  if (ethMatch) detectedCustomMap["ETHUSD"] = ethMatch;

  return {
    forexSuffix: detectedForexSuffix,
    generalSuffix: "",
    customMap: {
      ...DEFAULT_SYMBOL_MAPPING.customMap,
      ...detectedCustomMap,
    },
  };
}
