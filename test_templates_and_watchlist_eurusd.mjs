import {
  DEFAULT_TEMPLATES,
  getToolTemplateFamily,
  getAllTemplates,
  getTemplatesForTool,
  saveToolTemplate,
  deleteToolTemplate,
  hydrateTemplatesFromServer,
} from "./lib/draw/templates.js";
import { getSymbolAliases, resolveAliasValue } from "./lib/watchlistAliases.js";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  } else {
    console.log(`✅ PASS: ${message}`);
    passed++;
  }
}

console.log("\n=======================================================");
console.log("TEST SUITE 1: Drawing Tool Templates Registry & Persistence");
console.log("=======================================================");

// 1. Verify default templates exist
assert(Array.isArray(DEFAULT_TEMPLATES["fib-retracement"]), "DEFAULT_TEMPLATES has fib-retracement");
assert(DEFAULT_TEMPLATES["fib-retracement"].some(t => t.name.includes("ICT OTE")), "ICT OTE template present in Fib defaults");
assert(DEFAULT_TEMPLATES["rectangle"].some(t => t.name.includes("Fair Value Gap")), "FVG template present in Rectangle defaults");
assert(DEFAULT_TEMPLATES["trend-line"].some(t => t.name.includes("Major Key Level")), "Major Key Level template present in Trend Line defaults");

// 2. Family resolution
assert(getToolTemplateFamily("ray") === "trend-line", "ray maps to trend-line family");
assert(getToolTemplateFamily("extended-line") === "trend-line", "extended-line maps to trend-line family");
assert(getToolTemplateFamily("horizontal-ray") === "horizontal-line", "horizontal-ray maps to horizontal-line family");
assert(getToolTemplateFamily("rotated-rectangle") === "rectangle", "rotated-rectangle maps to rectangle family");
assert(getToolTemplateFamily("fib-channel") === "fib-retracement", "fib-channel maps to fib-retracement family");

// 3. Mock localStorage for node environment
globalThis.window = {
  dispatchEvent: () => {},
};
const storage = new Map();
globalThis.localStorage = {
  getItem: (k) => storage.get(k) || null,
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
};

// 4. getTemplatesForTool with family inheritance
const rayTemplates = getTemplatesForTool("ray");
assert(rayTemplates.length > 0, "ray inherits templates from trend-line family");
assert(rayTemplates.some(t => t.name.includes("Major Key Level")), "ray includes Major Key Level template");

// 5. saveToolTemplate and deleteToolTemplate
saveToolTemplate("rectangle", "My Custom Breaker", { color: "#ff00ff", width: 2 });
const rectTemplates = getTemplatesForTool("rectangle");
assert(rectTemplates.some(t => t.name === "My Custom Breaker"), "Saved custom template in rectangle");

deleteToolTemplate("rectangle", "My Custom Breaker");
const rectTemplatesAfter = getTemplatesForTool("rectangle");
assert(!rectTemplatesAfter.some(t => t.name === "My Custom Breaker"), "Deleted custom template from rectangle");

// 6. hydrateTemplatesFromServer preserves user templates and adds server templates
storage.set("ts_tool_templates", JSON.stringify({
  "trend-line": [{ name: "Local User Line", style: { color: "#ffffff" } }]
}));
hydrateTemplatesFromServer({
  "trend-line": [{ name: "Server Synced Line", style: { color: "#00ff00" } }]
});
const lineTemplates = getTemplatesForTool("trend-line");
assert(lineTemplates.some(t => t.name === "Local User Line"), "Preserves existing local template");
assert(lineTemplates.some(t => t.name === "Server Synced Line"), "Hydrates server synced template");

console.log("\n=======================================================");
console.log("TEST SUITE 2: Watchlist EURUSD.I Alias & Percentage Resolution");
console.log("=======================================================");

// 1. Alias extraction
const eurusdAliases = getSymbolAliases("EURUSD.I");
assert(eurusdAliases.includes("EURUSD.I"), "Aliases include EURUSD.I");
assert(eurusdAliases.includes("EURUSD.i"), "Aliases include EURUSD.i");
assert(eurusdAliases.includes("EURUSD"), "Aliases include EURUSD");

const btcAliases = getSymbolAliases("BTCUSD");
assert(btcAliases.includes("BTCUSD"), "Aliases include BTCUSD");

// 2. resolveAliasValue for ticks, daily opens, fallback prices
const testTicks = {
  "EURUSD.i": { bid: 1.11985, ask: 1.11995, digits: 5 },
  "BTCUSD": { bid: 65400, ask: 65405, digits: 2 }
};

const resolvedTick = resolveAliasValue("EURUSD.I", testTicks);
assert(resolvedTick !== null && resolvedTick.bid === 1.11985, "EURUSD.I successfully resolves EURUSD.i tick");

const testDailyOpens = {
  "EURUSD": 1.12095,
  "BTCUSD": 64500
};

const resolvedOpen = resolveAliasValue("EURUSD.I", testDailyOpens);
assert(resolvedOpen === 1.12095, "EURUSD.I successfully resolves EURUSD daily open (1.12095)");

// 3. Fallback price calculation and percentage change
const effectivePrice = resolvedTick.bid;
const dailyOpen = resolvedOpen;
const percentChange = (((effectivePrice - dailyOpen) / dailyOpen) * 100).toFixed(2);
assert(percentChange === "-0.10", `Percent change is exactly -0.10% (got ${percentChange}%)`);

// 4. Offline / Cached Fallback resolution when tick is null
const emptyTicks = {};
const testFallbackPrices = {
  "EURUSD": 1.11981
};
const offlineResolvedPrice = resolveAliasValue("EURUSD.I", testFallbackPrices);
assert(offlineResolvedPrice === 1.11981, "Offline EURUSD.I resolves fallback price (1.11981)");
const offlinePercent = (((offlineResolvedPrice - resolvedOpen) / resolvedOpen) * 100).toFixed(2);
assert(offlinePercent === "-0.10", `Offline percent change is exactly -0.10% (got ${offlinePercent}%)`);

console.log("\n=======================================================");
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log("=======================================================");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎯 ALL TEMPLATE & EURUSD.I RESOLUTION TESTS PASSED WITH 100% SUCCESS!\n");
  process.exit(0);
}
