/**
 * lib/draw/templates.js
 * 
 * Centralized, institutional template registry for chart drawing tools.
 * Provides:
 *  - Revived historical user templates (ICT OTE Fib, Institutional Position, etc.)
 *  - Professional institutional presets (FVG, Order Blocks, Liquidity Sweeps, Sessions)
 *  - Seamless Dual-Persistence: localStorage + MongoDB Atlas (/api/settings)
 *  - Cross-family tool aliasing (e.g. trend-line <-> ray <-> extended-line)
 *  - Instant reactive sync across DrawingSettings and MiniDrawingToolbar
 */

export const TEMPLATES_KEY = "ts_tool_templates";

export const DEFAULT_TEMPLATES = {
  "fib-retracement": [
    {
      name: "ICT OTE (0.5 / 0.72 / 0.85)",
      style: {
        color: "#2962ff",
        width: 1,
        lineStyle: "solid",
        levels: [
          { coeff: 0, color: "#808080", visible: true },
          { coeff: 0.236, color: "#f23645", visible: false },
          { coeff: 0.382, color: "#ff9800", visible: false },
          { coeff: 0.5, color: "#787b86", visible: true },
          { coeff: 0.72, color: "#089981", visible: true },
          { coeff: 0.85, color: "#f23646", visible: true },
          { coeff: 1, color: "#808080", visible: true },
          { coeff: 1.618, color: "#2962ff", visible: false },
          { coeff: 2.618, color: "#f23645", visible: false },
          { coeff: 3.618, color: "#9c27b0", visible: false },
          { coeff: 4.236, color: "#e91e63", visible: false },
          { coeff: 1.272, color: "#ff9800", visible: false },
          { coeff: 1.414, color: "#f23645", visible: false },
          { coeff: 2.272, color: "#ff9800", visible: false },
          { coeff: 2.414, color: "#4caf50", visible: false },
          { coeff: 2, color: "#089981", visible: false },
          { coeff: 3, color: "#00bcd4", visible: false },
          { coeff: 3.272, color: "#808080", visible: false },
          { coeff: 3.414, color: "#2962ff", visible: false },
          { coeff: 4, color: "#f23645", visible: false },
          { coeff: 4.272, color: "#9c27b0", visible: false },
          { coeff: 4.414, color: "#e91e63", visible: false },
          { coeff: 4.618, color: "#ff9800", visible: false },
          { coeff: 4.764, color: "#089981", visible: false },
        ],
        fillBackground: true,
        transparency: 90,
        fibTrendLine: { visible: false },
        showPrices: false,
        showCoeffs: false,
      },
    },
    {
      name: "ICT Equilibrium (50% EQ)",
      style: {
        color: "#2962ff",
        width: 1,
        lineStyle: "solid",
        levels: [
          { coeff: 0, color: "#808080", visible: true },
          { coeff: 0.5, color: "#4caf50", visible: true },
          { coeff: 1, color: "#808080", visible: true },
        ],
        fillBackground: true,
        transparency: 92,
        fibTrendLine: { visible: false },
        showPrices: true,
        showCoeffs: true,
      },
    },
    {
      name: "Standard Retracement & Extensions",
      style: {
        color: "#2962ff",
        width: 2,
        lineStyle: "solid",
        levels: [
          { coeff: 0, color: "#808080", visible: true },
          { coeff: 0.236, color: "#f23645", visible: true },
          { coeff: 0.382, color: "#ff9800", visible: true },
          { coeff: 0.5, color: "#4caf50", visible: true },
          { coeff: 0.618, color: "#089981", visible: true },
          { coeff: 0.786, color: "#00bcd4", visible: true },
          { coeff: 1, color: "#808080", visible: true },
          { coeff: 1.618, color: "#2962ff", visible: true },
          { coeff: 2.618, color: "#f23645", visible: true },
          { coeff: 3.618, color: "#9c27b0", visible: true },
          { coeff: 4.236, color: "#e91e63", visible: true },
        ],
        fillBackground: true,
        transparency: 80,
      },
    },
  ],

  "rectangle": [
    {
      name: "Fair Value Gap (FVG)",
      style: {
        color: "#00bcd4",
        backgroundColor: "#00bcd4",
        transparency: 88,
        width: 1,
        lineStyle: "solid",
        extendRight: false,
      },
    },
    {
      name: "Bullish Order Block (+OB)",
      style: {
        color: "#089981",
        backgroundColor: "#089981",
        transparency: 85,
        width: 1,
        lineStyle: "solid",
      },
    },
    {
      name: "Bearish Order Block (-OB)",
      style: {
        color: "#f23645",
        backgroundColor: "#f23645",
        transparency: 85,
        width: 1,
        lineStyle: "solid",
      },
    },
    {
      name: "Breaker Block / Mitigation",
      style: {
        color: "#ff9800",
        backgroundColor: "#ff9800",
        transparency: 85,
        width: 1,
        lineStyle: "dashed",
      },
    },
    {
      name: "Consolidation / Session Range",
      style: {
        color: "#9c27b0",
        backgroundColor: "#9c27b0",
        transparency: 90,
        width: 1,
        lineStyle: "dotted",
      },
    },
  ],

  "trend-line": [
    {
      name: "Major Key Level (H4 / D1)",
      style: {
        color: "#2962ff",
        width: 2,
        lineStyle: "solid",
      },
    },
    {
      name: "Liquidity Sweep Line (BSL / SSL)",
      style: {
        color: "#ff9800",
        width: 1,
        lineStyle: "dashed",
      },
    },
    {
      name: "Internal Market Structure (mMS)",
      style: {
        color: "#787b86",
        width: 1,
        lineStyle: "dotted",
      },
    },
    {
      name: "Session High / Low",
      style: {
        color: "#e91e63",
        width: 1,
        lineStyle: "dashed",
      },
    },
  ],

  "horizontal-line": [
    {
      name: "Daily Open (DO)",
      style: {
        color: "#ffeb3b",
        width: 1,
        lineStyle: "dashed",
      },
    },
    {
      name: "Weekly Open (WO)",
      style: {
        color: "#00bcd4",
        width: 2,
        lineStyle: "solid",
      },
    },
    {
      name: "PDH / PDL (Previous Day)",
      style: {
        color: "#ef5350",
        width: 1,
        lineStyle: "dashed",
      },
    },
    {
      name: "Equilibrium (50% EQ)",
      style: {
        color: "#787b86",
        width: 1,
        lineStyle: "dotted",
      },
    },
  ],

  "long-position": [
    {
      name: "Institutional Risk 25% (1:3 RR)",
      style: {
        color: "#808080",
        width: 1,
        lineStyle: "solid",
        textColor: "#ffffff",
        fontSize: 12,
        stopColor: "#f23645",
        stopTransparency: 80,
        targetColor: "#089981",
        targetTransparency: 80,
        showPriceLabels: true,
        accountSize: 1000,
        riskPercent: 25,
        lotSize: 1,
        riskDisplayMode: "percents",
        leverage: 10000,
      },
    },
    {
      name: "Standard 1% Risk (1:2 RR)",
      style: {
        color: "#808080",
        width: 1,
        lineStyle: "solid",
        textColor: "#ffffff",
        fontSize: 12,
        stopColor: "#f23645",
        stopTransparency: 80,
        targetColor: "#089981",
        targetTransparency: 80,
        showPriceLabels: true,
        accountSize: 10000,
        riskPercent: 1,
        lotSize: 1,
        riskDisplayMode: "percents",
        leverage: 100,
      },
    },
  ],

  "short-position": [
    {
      name: "Institutional Risk 25% (1:3 RR)",
      style: {
        color: "#808080",
        width: 1,
        lineStyle: "solid",
        textColor: "#ffffff",
        fontSize: 12,
        stopColor: "#f23645",
        stopTransparency: 80,
        targetColor: "#089981",
        targetTransparency: 80,
        showPriceLabels: true,
        accountSize: 1000,
        riskPercent: 25,
        lotSize: 1,
        riskDisplayMode: "percents",
        leverage: 10000,
      },
    },
    {
      name: "Standard 1% Risk (1:2 RR)",
      style: {
        color: "#808080",
        width: 1,
        lineStyle: "solid",
        textColor: "#ffffff",
        fontSize: 12,
        stopColor: "#f23645",
        stopTransparency: 80,
        targetColor: "#089981",
        targetTransparency: 80,
        showPriceLabels: true,
        accountSize: 10000,
        riskPercent: 1,
        lotSize: 1,
        riskDisplayMode: "percents",
        leverage: 100,
      },
    },
  ],
};

/**
 * Returns the primary template family for a given toolKind so variations
 * like "ray", "extended-line", and "trend-line" share relevant templates.
 */
export function getToolTemplateFamily(toolKind) {
  if (!toolKind) return "tool";
  if (toolKind.includes("fib") || toolKind.includes("pitchfan")) return "fib-retracement";
  if (toolKind === "rectangle" || toolKind === "rotated-rectangle") return "rectangle";
  if (toolKind.includes("line") || toolKind.includes("ray") || toolKind === "trend-angle") {
    if (toolKind.includes("horizontal")) return "horizontal-line";
    return "trend-line";
  }
  if (toolKind === "long-position") return "long-position";
  if (toolKind === "short-position") return "short-position";
  return toolKind;
}

/**
 * Loads all templates from localStorage, falling back to built-ins
 */
export function getAllTemplates() {
  if (typeof window === "undefined") return { ...DEFAULT_TEMPLATES };
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    const stored = raw ? JSON.parse(raw) : {};
    
    // Deep merge stored templates with default institutional templates
    const merged = { ...DEFAULT_TEMPLATES };
    for (const [k, list] of Object.entries(stored)) {
      if (Array.isArray(list)) {
        const defaults = merged[k] || [];
        const existingNames = new Set(list.map((t) => t.name));
        // Keep user templates and add non-conflicting default templates
        const combined = [...list, ...defaults.filter((d) => !existingNames.has(d.name))];
        merged[k] = combined;
      }
    }
    return merged;
  } catch (e) {
    console.error("[templates] Failed to parse local templates:", e);
    return { ...DEFAULT_TEMPLATES };
  }
}

/**
 * Retrieves templates for a specific toolKind
 */
export function getTemplatesForTool(toolKind) {
  if (!toolKind) return [];
  const all = getAllTemplates();
  const direct = all[toolKind] || [];
  const family = getToolTemplateFamily(toolKind);
  if (family !== toolKind && all[family]) {
    const existingNames = new Set(direct.map((t) => t.name));
    return [...direct, ...all[family].filter((t) => !existingNames.has(t.name))];
  }
  return direct;
}

/**
 * Saves a template for toolKind both locally and to MongoDB Atlas via /api/settings
 */
export function saveToolTemplate(toolKind, name, style) {
  const cleanName = (name || "").trim();
  if (!cleanName || !toolKind) return [];

  const all = getAllTemplates();
  const list = all[toolKind] || [];
  const updatedList = [...list.filter((t) => t.name !== cleanName), { name: cleanName, style: { ...style } }];
  all[toolKind] = updatedList;

  // Also mirror to family if distinct
  const family = getToolTemplateFamily(toolKind);
  if (family && family !== toolKind) {
    const famList = all[family] || [];
    all[family] = [...famList.filter((t) => t.name !== cleanName), { name: cleanName, style: { ...style } }];
  }

  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent("ts_templates_updated", { detail: { toolKind, all } }));
  } catch (e) {
    console.error("[templates] Failed to persist to localStorage:", e);
  }

  // Dual-persistence: Cloud sync to MongoDB
  syncTemplatesToServer(all);

  return updatedList;
}

/**
 * Deletes a template by name for toolKind
 */
export function deleteToolTemplate(toolKind, name) {
  if (!toolKind || !name) return [];
  const all = getAllTemplates();
  const list = all[toolKind] || [];
  const updatedList = list.filter((t) => t.name !== name);
  all[toolKind] = updatedList;

  const family = getToolTemplateFamily(toolKind);
  if (family && family !== toolKind && all[family]) {
    all[family] = all[family].filter((t) => t.name !== name);
  }

  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent("ts_templates_updated", { detail: { toolKind, all } }));
  } catch (e) {
    console.error("[templates] Failed to delete from localStorage:", e);
  }

  // Dual-persistence: Cloud sync to MongoDB
  syncTemplatesToServer(all);

  return updatedList;
}

/**
 * Background cloud sync to MongoDB Atlas
 */
let syncDebounceTimer = null;
export function syncTemplatesToServer(templatesData) {
  if (typeof window === "undefined") return;
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(() => {
    fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolTemplates: templatesData }),
    }).catch((err) => {
      console.warn("[templates] Background sync to MongoDB failed:", err);
    });
  }, 300);
}

/**
 * Merges templates received from MongoDB Atlas with local storage
 */
export function hydrateTemplatesFromServer(serverTemplates) {
  if (!serverTemplates || typeof serverTemplates !== "object") return;
  try {
    const currentLocal = getAllTemplates();
    const merged = { ...DEFAULT_TEMPLATES, ...serverTemplates };

    for (const [k, list] of Object.entries(currentLocal)) {
      if (Array.isArray(list)) {
        const sList = merged[k] || [];
        const sNames = new Set(sList.map((t) => t.name));
        merged[k] = [...sList, ...list.filter((l) => !sNames.has(l.name))];
      }
    }

    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent("ts_templates_updated", { detail: { all: merged } }));
  } catch (e) {
    console.error("[templates] Failed to hydrate server templates:", e);
  }
}
