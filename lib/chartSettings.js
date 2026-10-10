import { useState, useEffect } from "react";

export const THEME_PRESETS = {
  dark: {
    id: "dark",
    name: "Dark",
    // UI Theme Variables
    bg: "#0e1116",
    panel: "#151a23",
    panel2: "#1a202c",
    border: "#232a38",
    borderHi: "#2f3949",
    text: "#d7dce6",
    muted: "#8a93a6",
    accent: "#2962ff",
    accentSoft: "rgba(41, 98, 255, 0.14)",
    green: "#26a69a",
    red: "#ef5350",
    orange: "#ff9800",
    purple: "#ab47bc",
    // Chart Canvas Variables
    bgColor: "#0e1116",
    bgGradientTop: "#151a23",
    bgGradientBottom: "#0e1116",
    textColor: "#d7dce6",
    linesColor: "#232a38",
    gridVertColor: "#151a23",
    gridHorzColor: "#151a23",
    watermarkColor: "rgba(255, 255, 255, 0.04)",
    upColor: "#26a69a",
    downColor: "#ef5350",
    wickUpColor: "#26a69a",
    wickDownColor: "#ef5350",
    borderUpColor: "#000000",
    borderDownColor: "#000000",
  },
  light: {
    id: "light",
    name: "Light",
    bg: "#f4f5f8",
    panel: "#ffffff",
    panel2: "#f0f3fa",
    border: "#e0e3eb",
    borderHi: "#c5cbd8",
    text: "#191919",
    muted: "#6a6d78",
    accent: "#2962ff",
    accentSoft: "rgba(41, 98, 255, 0.08)",
    green: "#089981",
    red: "#f23645",
    orange: "#e67e22",
    purple: "#8e44ad",
    bgColor: "#ffffff",
    bgGradientTop: "#f8f9fa",
    bgGradientBottom: "#ffffff",
    textColor: "#191919",
    linesColor: "#e0e3eb",
    gridVertColor: "#f0f3fa",
    gridHorzColor: "#f0f3fa",
    watermarkColor: "rgba(0, 0, 0, 0.04)",
    upColor: "#089981",
    downColor: "#f23645",
    wickUpColor: "#089981",
    wickDownColor: "#f23645",
    borderUpColor: "#089981",
    borderDownColor: "#f23645",
  },
  navyblue: {
    id: "navyblue",
    name: "Navy Blue",
    bg: "#0a1322",
    panel: "#0f1d33",
    panel2: "#152642",
    border: "#1d3356",
    borderHi: "#284470",
    text: "#e1e8f5",
    muted: "#7f95b6",
    accent: "#0088ff",
    accentSoft: "rgba(0, 136, 255, 0.16)",
    green: "#00c853",
    red: "#ff5252",
    orange: "#ffa726",
    purple: "#b388ff",
    bgColor: "#0a1322",
    bgGradientTop: "#0f1d33",
    bgGradientBottom: "#0a1322",
    textColor: "#e1e8f5",
    linesColor: "#1d3356",
    gridVertColor: "#0f1d33",
    gridHorzColor: "#0f1d33",
    watermarkColor: "rgba(255, 255, 255, 0.04)",
    upColor: "#00c853",
    downColor: "#ff5252",
    wickUpColor: "#00c853",
    wickDownColor: "#ff5252",
    borderUpColor: "#00c853",
    borderDownColor: "#ff5252",
  },
  creamy: {
    id: "creamy",
    name: "Creamy",
    bg: "#fbf8f1",
    panel: "#f4eee0",
    panel2: "#e9dfce",
    border: "#ded4c2",
    borderHi: "#c9bba5",
    text: "#2c2825",
    muted: "#7a7267",
    accent: "#2962ff",
    accentSoft: "rgba(41, 98, 255, 0.1)",
    green: "#16a34a",
    red: "#dc2626",
    orange: "#d97706",
    purple: "#9333ea",
    bgColor: "#fbf8f1",
    bgGradientTop: "#f4eee0",
    bgGradientBottom: "#fbf8f1",
    textColor: "#2c2825",
    linesColor: "#ded4c2",
    gridVertColor: "#f4eee0",
    gridHorzColor: "#f4eee0",
    watermarkColor: "rgba(0, 0, 0, 0.04)",
    upColor: "#16a34a",
    downColor: "#dc2626",
    wickUpColor: "#16a34a",
    wickDownColor: "#dc2626",
    borderUpColor: "#16a34a",
    borderDownColor: "#dc2626",
  },
  midnight: {
    id: "midnight",
    name: "Midnight OLED",
    bg: "#000000",
    panel: "#0a0a0a",
    panel2: "#121212",
    border: "#1f1f1f",
    borderHi: "#333333",
    text: "#ededed",
    muted: "#666666",
    accent: "#0088ff",
    accentSoft: "rgba(0, 136, 255, 0.12)",
    green: "#00e5ff",
    red: "#ff1744",
    orange: "#ff9100",
    purple: "#d500f9",
    bgColor: "#000000",
    bgGradientTop: "#0a0a0a",
    bgGradientBottom: "#000000",
    textColor: "#ededed",
    linesColor: "#1f1f1f",
    gridVertColor: "#0d0d0d",
    gridHorzColor: "#0d0d0d",
    watermarkColor: "rgba(255, 255, 255, 0.03)",
    upColor: "#00e5ff",
    downColor: "#ff1744",
    wickUpColor: "#00e5ff",
    wickDownColor: "#ff1744",
    borderUpColor: "#00b0ff",
    borderDownColor: "#d50000",
  },
  matrix: {
    id: "matrix",
    name: "Matrix",
    bg: "#000000",
    panel: "#001100",
    panel2: "#001a00",
    border: "#003300",
    borderHi: "#005500",
    text: "#00ff00",
    muted: "#00aa00",
    accent: "#00ff00",
    accentSoft: "rgba(0, 255, 0, 0.15)",
    green: "#00ff66",
    red: "#005500",
    orange: "#00dd44",
    purple: "#00bb33",
    bgColor: "#000a00",
    bgGradientTop: "#001400",
    bgGradientBottom: "#000000",
    textColor: "#00ff66",
    linesColor: "#003311",
    gridVertColor: "#001a08",
    gridHorzColor: "#001a08",
    watermarkColor: "rgba(0, 255, 102, 0.04)",
    upColor: "#00ff66",
    downColor: "#004d1a",
    wickUpColor: "#00ff66",
    wickDownColor: "#006622",
    borderUpColor: "#00ff88",
    borderDownColor: "#003311",
  }
};

export function hexToRgba(hex, alpha = 1) {
  if (!hex || typeof hex !== "string") return `rgba(41, 98, 255, ${alpha})`;
  let clean = hex.replace("#", "");
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  if (clean.length === 8) {
    clean = clean.slice(0, 6);
  }
  if (clean.length !== 6) return `rgba(41, 98, 255, ${alpha})`;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const CSS_VAR_MAP = {
  bg: "--bg",
  panel: "--panel",
  panel2: "--panel-2",
  border: "--border",
  borderHi: "--border-hi",
  text: "--text",
  muted: "--muted",
  accent: "--accent",
  accentSoft: "--accent-soft",
  green: "--green",
  red: "--red",
  orange: "--orange",
  purple: "--purple",
};

export const DEFAULT_CHART_SETTINGS = {
  // Symbol
  upColor: "#26a69a",
  downColor: "#ef5350",
  wickUpColor: "#26a69a",
  wickDownColor: "#ef5350",
  borderUpColor: "#000000",
  borderDownColor: "#000000",
  borderVisible: false,
  colorBasedOnPreviousClose: false,
  precision: "Default",
  timezone: "Local",
  
  // Canvas
  bgType: "Solid", // "Solid" or "Gradient"
  bgColor: "#0e1116",
  bgGradientTop: "#151a23",
  bgGradientBottom: "#0e1116",
  gridVertEnabled: true,
  gridHorzEnabled: true,
  gridVertColor: "#151a23",
  gridHorzColor: "#151a23",
  crosshairColor: "#758696",
  watermark: true,
  watermarkColor: "rgba(255, 255, 255, 0.04)",
  textColor: "#d7dce6",
  linesColor: "#232a38",
  
  // Margins
  marginTop: 10,
  marginBottom: 10,
  marginRight: 12,

  // Advanced / Institutional
  appTheme: "dark",         // Global UI theme: dark, light, navyblue, creamy, midnight, matrix
  dynamicVolatility: false, // Glow candles on high volume/momentum
  pnlAtmosphere: false,     // Background hue shifts based on open positions

  // Per-theme customizable candle bodies, wicks, borders
  themeCandleColors: {
    dark: { upColor: "#26a69a", downColor: "#ef5350", wickUpColor: "#26a69a", wickDownColor: "#ef5350", borderUpColor: "#000000", borderDownColor: "#000000" },
    light: { upColor: "#089981", downColor: "#f23645", wickUpColor: "#089981", wickDownColor: "#f23645", borderUpColor: "#089981", borderDownColor: "#f23645" },
    navyblue: { upColor: "#00c853", downColor: "#ff5252", wickUpColor: "#00c853", wickDownColor: "#ff5252", borderUpColor: "#00c853", borderDownColor: "#ff5252" },
    creamy: { upColor: "#16a34a", downColor: "#dc2626", wickUpColor: "#16a34a", wickDownColor: "#dc2626", borderUpColor: "#16a34a", borderDownColor: "#dc2626" },
    midnight: { upColor: "#00e5ff", downColor: "#ff1744", wickUpColor: "#00e5ff", wickDownColor: "#ff1744", borderUpColor: "#00b0ff", borderDownColor: "#d50000" },
    matrix: { upColor: "#00ff66", downColor: "#004d1a", wickUpColor: "#00ff66", wickDownColor: "#006622", borderUpColor: "#00ff88", borderDownColor: "#003311" },
  },

  // Per-theme customizable UI colors (bg, panel, accent, text, border, etc.)
  themeCustomColors: {
    dark: {},
    light: {},
    navyblue: {},
    creamy: {},
    midnight: {},
    matrix: {},
  },
};

let currentSettings = { ...DEFAULT_CHART_SETTINGS };
const listeners = new Set();
const recentListeners = new Set();

let recentColors = ["#ef5350", "#26a69a", "#2962ff", "#ff9800", "#ffffff"];

export function syncDomTheme(themeKey, customOverrides = null) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const activeTheme = themeKey || currentSettings.appTheme || "dark";
  root.setAttribute("data-theme", activeTheme);

  const activeCustom = customOverrides || (currentSettings.themeCustomColors && currentSettings.themeCustomColors[activeTheme]) || {};

  Object.entries(CSS_VAR_MAP).forEach(([key, varName]) => {
    if (activeCustom[key]) {
      root.style.setProperty(varName, activeCustom[key]);
      if (key === "text") {
        root.style.setProperty("--fg", activeCustom[key]);
      }
    } else {
      root.style.removeProperty(varName);
      if (key === "text") {
        root.style.removeProperty("--fg");
      }
    }
  });
}

try {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("ts_chart_settings");
    if (saved) {
      currentSettings = { ...DEFAULT_CHART_SETTINGS, ...JSON.parse(saved) };
      syncDomTheme(currentSettings.appTheme);
    }
    const savedRecents = localStorage.getItem("ts_recent_colors");
    if (savedRecents) {
      recentColors = JSON.parse(savedRecents);
    }

    fetch("/api/settings").then(r => r.json()).then(d => {
      if (d.ok && d.settings) {
        if (d.settings.chartSettings) {
          currentSettings = { ...DEFAULT_CHART_SETTINGS, ...d.settings.chartSettings };
          syncDomTheme(currentSettings.appTheme);
          localStorage.setItem("ts_chart_settings", JSON.stringify(currentSettings));
          listeners.forEach((l) => l(currentSettings));
        }
        if (d.settings.recentColors) {
          recentColors = d.settings.recentColors;
          localStorage.setItem("ts_recent_colors", JSON.stringify(recentColors));
          recentListeners.forEach((l) => l(recentColors));
        }
      }
    }).catch(()=>{});
  }
} catch (err) {
  console.warn("Failed to load chart settings", err);
}

export function getChartSettings() {
  return currentSettings;
}

export function updateChartSettings(updates) {
  const activeTheme = currentSettings.appTheme || "dark";
  const candleKeys = ["upColor", "downColor", "wickUpColor", "wickDownColor", "borderUpColor", "borderDownColor"];
  const hasCandleUpdate = candleKeys.some((k) => updates[k] !== undefined);
  
  if (hasCandleUpdate) {
    const existingTheme = (currentSettings.themeCandleColors && currentSettings.themeCandleColors[activeTheme]) || {};
    const updatedTheme = {
      ...existingTheme,
      upColor: updates.upColor ?? currentSettings.upColor,
      downColor: updates.downColor ?? currentSettings.downColor,
      wickUpColor: updates.wickUpColor ?? currentSettings.wickUpColor,
      wickDownColor: updates.wickDownColor ?? currentSettings.wickDownColor,
      borderUpColor: updates.borderUpColor ?? currentSettings.borderUpColor,
      borderDownColor: updates.borderDownColor ?? currentSettings.borderDownColor,
    };
    updates.themeCandleColors = {
      ...(DEFAULT_CHART_SETTINGS.themeCandleColors || {}),
      ...(currentSettings.themeCandleColors || {}),
      [activeTheme]: updatedTheme,
    };
  }

  currentSettings = { ...currentSettings, ...updates };
  if (updates.appTheme || updates.themeCustomColors) {
    syncDomTheme(currentSettings.appTheme);
  }
  if (typeof window !== "undefined") {
    localStorage.setItem("ts_chart_settings", JSON.stringify(currentSettings));
    fetch("/api/settings", { method: "PATCH", body: JSON.stringify({ chartSettings: currentSettings }) }).catch(()=>{});
  }
  listeners.forEach((l) => l(currentSettings));
}

export function updateThemeCustomColor(colorKey, hexColor) {
  const activeTheme = currentSettings.appTheme || "dark";
  const existingCustom = (currentSettings.themeCustomColors && currentSettings.themeCustomColors[activeTheme]) || {};
  const updatedCustom = {
    ...existingCustom,
    [colorKey]: hexColor,
  };

  if (colorKey === "accent" && !updatedCustom.accentSoft) {
    updatedCustom.accentSoft = hexToRgba(hexColor, 0.15);
  }

  const themeCustomColors = {
    ...(currentSettings.themeCustomColors || {}),
    [activeTheme]: updatedCustom,
  };

  // Also sync chart canvas settings if colorKey maps to chart canvas
  const chartUpdates = {};
  if (colorKey === "bg") chartUpdates.bgColor = hexColor;
  if (colorKey === "text") chartUpdates.textColor = hexColor;
  if (colorKey === "border") chartUpdates.linesColor = hexColor;
  if (colorKey === "green") { chartUpdates.upColor = hexColor; chartUpdates.wickUpColor = hexColor; }
  if (colorKey === "red") { chartUpdates.downColor = hexColor; chartUpdates.wickDownColor = hexColor; }

  updateChartSettings({
    ...chartUpdates,
    themeCustomColors,
  });

  syncDomTheme(activeTheme, updatedCustom);
}

export function resetThemeToDefaults(themeKey = null) {
  const targetTheme = themeKey || currentSettings.appTheme || "dark";
  const preset = THEME_PRESETS[targetTheme] || THEME_PRESETS.dark;

  const themeCustomColors = {
    ...(currentSettings.themeCustomColors || {}),
  };
  delete themeCustomColors[targetTheme];

  const themeCandleColors = {
    ...(currentSettings.themeCandleColors || {}),
  };
  delete themeCandleColors[targetTheme];

  updateChartSettings({
    ...preset,
    themeCustomColors,
    themeCandleColors,
  });

  syncDomTheme(targetTheme, {});
}

export function getThemeActiveColors(themeKey = null) {
  const activeTheme = themeKey || currentSettings.appTheme || "dark";
  const preset = THEME_PRESETS[activeTheme] || THEME_PRESETS.dark;
  const custom = (currentSettings.themeCustomColors && currentSettings.themeCustomColors[activeTheme]) || {};
  return {
    ...preset,
    ...custom,
  };
}

export function switchTheme(themeKey) {
  const preset = THEME_PRESETS[themeKey] || THEME_PRESETS.dark;
  const currentTheme = currentSettings.appTheme || "dark";

  // Snapshot active candle colors into current theme before switching
  const snapshot = {
    upColor: currentSettings.upColor,
    downColor: currentSettings.downColor,
    wickUpColor: currentSettings.wickUpColor,
    wickDownColor: currentSettings.wickDownColor,
    borderUpColor: currentSettings.borderUpColor,
    borderDownColor: currentSettings.borderDownColor,
  };

  const themeCandleColors = {
    ...(DEFAULT_CHART_SETTINGS.themeCandleColors || {}),
    ...(currentSettings.themeCandleColors || {}),
    [currentTheme]: {
      ...((currentSettings.themeCandleColors && currentSettings.themeCandleColors[currentTheme]) || {}),
      ...snapshot,
    },
  };

  // Retrieve candle palette saved for the incoming theme
  const targetColors = themeCandleColors[themeKey] || {
    upColor: preset.upColor,
    downColor: preset.downColor,
    wickUpColor: preset.wickUpColor,
    wickDownColor: preset.wickDownColor,
    borderUpColor: preset.borderUpColor || preset.upColor,
    borderDownColor: preset.borderDownColor || preset.downColor,
  };

  // Retrieve custom UI overrides for incoming theme
  const targetCustom = (currentSettings.themeCustomColors && currentSettings.themeCustomColors[themeKey]) || {};

  // Compute effective chart canvas overrides from targetCustom if set
  const chartCanvasOverrides = {};
  if (targetCustom.bg) chartCanvasOverrides.bgColor = targetCustom.bg;
  if (targetCustom.text) chartCanvasOverrides.textColor = targetCustom.text;
  if (targetCustom.border) chartCanvasOverrides.linesColor = targetCustom.border;

  updateChartSettings({
    ...preset,
    ...chartCanvasOverrides,
    ...targetColors,
    appTheme: themeKey,
    themeCandleColors,
  });

  syncDomTheme(themeKey, targetCustom);
}

export function addRecentColor(hex) {
  if (!hex || hex === "transparent") return;
  const normalized = hex.substring(0, 7).toLowerCase(); // store base hex without alpha
  recentColors = [normalized, ...recentColors.filter(c => c !== normalized)].slice(0, 10);
  if (typeof window !== "undefined") {
    localStorage.setItem("ts_recent_colors", JSON.stringify(recentColors));
    fetch("/api/settings", { method: "PATCH", body: JSON.stringify({ recentColors }) }).catch(()=>{});
  }
  recentListeners.forEach((l) => l(recentColors));
}

export function useChartSettings() {
  const [settings, setSettings] = useState(currentSettings);

  useEffect(() => {
    const listener = (newSettings) => setSettings(newSettings);
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  return [settings, updateChartSettings];
}

export function useRecentColors() {
  const [colors, setColors] = useState(recentColors);

  useEffect(() => {
    const listener = (newColors) => setColors(newColors);
    recentListeners.add(listener);
    return () => recentListeners.delete(listener);
  }, []);

  return colors;
}
