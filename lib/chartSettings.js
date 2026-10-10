import { useState, useEffect } from "react";

export const THEME_PRESETS = {
  dark: {
    id: "dark",
    name: "Dark",
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
  },
  light: {
    id: "light",
    name: "Light",
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
  },
  navyblue: {
    id: "navyblue",
    name: "Navy Blue",
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
  },
  creamy: {
    id: "creamy",
    name: "Creamy",
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
};

let currentSettings = { ...DEFAULT_CHART_SETTINGS };
const listeners = new Set();
const recentListeners = new Set();

let recentColors = ["#ef5350", "#26a69a", "#2962ff", "#ff9800", "#ffffff"];

function syncDomTheme(themeKey) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", themeKey || "dark");
  }
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
  if (updates.appTheme) {
    syncDomTheme(updates.appTheme);
  }
  if (typeof window !== "undefined") {
    localStorage.setItem("ts_chart_settings", JSON.stringify(currentSettings));
    fetch("/api/settings", { method: "PATCH", body: JSON.stringify({ chartSettings: currentSettings }) }).catch(()=>{});
  }
  listeners.forEach((l) => l(currentSettings));
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

  updateChartSettings({
    ...preset,
    ...targetColors,
    appTheme: themeKey,
    themeCandleColors,
  });
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
