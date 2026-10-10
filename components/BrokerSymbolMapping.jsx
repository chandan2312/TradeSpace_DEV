"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search, Wand2, Save, RotateCcw, Plus, Trash2, Check,
  AlertCircle, ShieldCheck, ArrowRight, RefreshCw, Layers
} from "lucide-react";
import {
  DEFAULT_CANONICAL_SYMBOLS,
  DEFAULT_SYMBOL_MAPPING,
  getClientSymbolMapping,
  saveClientSymbolMapping,
  toBrokerSymbol,
  detectBrokerMapping,
} from "../lib/symbols/mapping";

const CATEGORY_COLORS = {
  index: { color: "#a855f7", bg: "rgba(168, 85, 247, 0.12)", label: "Index" },
  forex: { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.12)", label: "Forex" },
  metal: { color: "#eab308", bg: "rgba(234, 179, 8, 0.12)", label: "Metal" },
  commodity: { color: "#f97316", bg: "rgba(249, 115, 22, 0.12)", label: "Commodity" },
  crypto: { color: "#10b981", bg: "rgba(16, 185, 129, 0.12)", label: "Crypto" },
  custom: { color: "#06b6d4", bg: "rgba(6, 182, 212, 0.12)", label: "Custom" },
};

export default function BrokerSymbolMapping({ onClose, onSaved }) {
  const [mapping, setMapping] = useState(() => getClientSymbolMapping());
  const [filterQuery, setFilterQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [brokerSymbols, setBrokerSymbols] = useState([]);
  const [loadingSymbols, setLoadingSymbols] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newSymbolName, setNewSymbolName] = useState("");
  const [newBrokerName, setNewBrokerName] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch live broker symbols list from bridge for verification & auto-detection
  useEffect(() => {
    let mounted = true;
    const fetchBrokerSymbols = async () => {
      setLoadingSymbols(true);
      try {
        const res = await fetch("/api/symbols?limit=500");
        const data = await res.json();
        if (mounted && data?.ok && Array.isArray(data.symbols)) {
          setBrokerSymbols(data.symbols);
        }
      } catch (e) {
        console.warn("[BrokerSymbolMapping] Error fetching symbols:", e);
      } finally {
        if (mounted) setLoadingSymbols(false);
      }
    };
    fetchBrokerSymbols();
    return () => { mounted = false; };
  }, []);

  // Fetch latest settings from server on mount
  useEffect(() => {
    let mounted = true;
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (mounted && d?.ok && d.settings?.symbolMapping) {
          setMapping((prev) => ({
            ...prev,
            ...d.settings.symbolMapping,
            customMap: {
              ...(prev.customMap || {}),
              ...(d.settings.symbolMapping.customMap || {}),
            },
          }));
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const brokerNamesSet = useMemo(() => {
    return new Set(brokerSymbols.map((s) => (s?.name || "").toUpperCase()));
  }, [brokerSymbols]);

  // Combined list of symbols (defaults + any user added custom symbols in customMap)
  const allSymbolsList = useMemo(() => {
    const defaultKeys = new Set(DEFAULT_CANONICAL_SYMBOLS.map((s) => s.symbol));
    const list = [...DEFAULT_CANONICAL_SYMBOLS];

    if (mapping.customMap) {
      for (const [sym] of Object.entries(mapping.customMap)) {
        if (!defaultKeys.has(sym)) {
          list.push({
            symbol: sym,
            name: `${sym} Asset`,
            category: "custom",
            defaultBroker: sym,
            description: "Custom user-mapped asset",
          });
        }
      }
    }
    return list;
  }, [mapping.customMap]);

  // Filtered symbols based on search & category
  const filteredSymbols = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    return allSymbolsList.filter((s) => {
      if (activeCategory !== "all" && s.category !== activeCategory) return false;
      if (!q) return true;
      const mapped = mapping.customMap?.[s.symbol] || "";
      return (
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        mapped.toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q)
      );
    });
  }, [allSymbolsList, filterQuery, activeCategory, mapping.customMap]);

  // Handlers for mapping mutations
  const handleCustomMapChange = useCallback((canonicalSym, value) => {
    setMapping((prev) => ({
      ...prev,
      customMap: {
        ...(prev.customMap || {}),
        [canonicalSym]: value,
      },
    }));
  }, []);

  const handleForexSuffixChange = useCallback((suffix) => {
    setMapping((prev) => ({
      ...prev,
      forexSuffix: suffix,
    }));
  }, []);

  const handleGeneralSuffixChange = useCallback((suffix) => {
    setMapping((prev) => ({
      ...prev,
      generalSuffix: suffix,
    }));
  }, []);

  const handleResetRow = useCallback((canonicalSym, defaultBroker) => {
    setMapping((prev) => {
      const nextCustom = { ...(prev.customMap || {}) };
      delete nextCustom[canonicalSym];
      return {
        ...prev,
        customMap: nextCustom,
      };
    });
  }, []);

  // Auto-Detect from connected broker symbols
  const handleAutoDetect = useCallback(() => {
    if (!brokerSymbols.length) {
      alert("No broker symbols available to analyze. Please ensure the MT5 bridge is connected.");
      return;
    }
    setDetecting(true);
    try {
      const detected = detectBrokerMapping(brokerSymbols);
      setMapping((prev) => ({
        ...prev,
        forexSuffix: detected.forexSuffix !== undefined ? detected.forexSuffix : prev.forexSuffix,
        generalSuffix: detected.generalSuffix || prev.generalSuffix || "",
        customMap: {
          ...(prev.customMap || {}),
          ...(detected.customMap || {}),
        },
      }));
    } finally {
      setTimeout(() => setDetecting(false), 300);
    }
  }, [brokerSymbols]);

  // Save Mapping to server & client storage
  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Client save & event dispatch
      saveClientSymbolMapping(mapping);

      // 2. Server save to MongoDB via settings PATCH
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbolMapping: mapping }),
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      if (onSaved) onSaved(mapping);
    } catch (e) {
      console.error("[BrokerSymbolMapping] Error saving:", e);
      alert("Failed to save mapping to server. Stored locally.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCustomSymbol = () => {
    const sym = newSymbolName.trim().toUpperCase();
    if (!sym) return;
    handleCustomMapChange(sym, newBrokerName.trim() || sym);
    setNewSymbolName("");
    setNewBrokerName("");
    setShowAddModal(false);
  };

  const suffixPresets = [".i", ".I", "_m", ".pro", ".raw", ""];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 16 }}>
      {/* Overview Banner */}
      <div style={{
        background: "rgba(41, 98, 255, 0.06)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
        lineHeight: 1.5,
        display: "flex",
        alignItems: "flex-start",
        gap: 10
      }}>
        <ShieldCheck size={18} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontWeight: 600, color: "var(--text)" }}>Centralized Canonical Symbol System</div>
          <div style={{ color: "var(--muted)", fontSize: 11 }}>
            TradeSpace features, watchlists, market brain, charts, and autonomous execution operate exclusively on unified canonical symbols (e.g. <b>NAS100</b>, <b>DJ30</b>, <b>EURUSD</b>).
            Map each canonical symbol to your MT5 account's specific broker identifier below. If your MT5 account changes, update this configuration once to maintain complete continuity across all pages.
          </div>
        </div>
      </div>

      {/* Global Suffix Controls */}
      <div style={{
        background: "var(--panel-2, rgba(255,255,255,0.02))",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "12px 14px",
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
        alignItems: "center"
      }}>
        {/* Forex Suffix */}
        <div style={{ flex: "1 1 280px", minWidth: 260 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Forex Broker Suffix</span>
            <span style={{ fontSize: 10, color: "var(--muted)" }}>e.g. EURUSD → EURUSD{mapping.forexSuffix || ""}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="text"
              value={mapping.forexSuffix ?? ""}
              onChange={(e) => handleForexSuffixChange(e.target.value)}
              placeholder="e.g. .i or .I"
              style={{
                width: 90,
                background: "var(--bg)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                padding: "6px 8px",
                borderRadius: 4,
                fontSize: 12,
                fontFamily: "var(--mono)"
              }}
            />
            <div style={{ display: "flex", gap: 4 }}>
              {suffixPresets.map((sfx) => (
                <button
                  key={sfx || "none"}
                  onClick={() => handleForexSuffixChange(sfx)}
                  style={{
                    padding: "4px 7px",
                    fontSize: 11,
                    fontFamily: "var(--mono)",
                    background: mapping.forexSuffix === sfx ? "var(--accent)" : "rgba(255,255,255,0.04)",
                    color: mapping.forexSuffix === sfx ? "#fff" : "var(--muted)",
                    border: "1px solid var(--border)",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  {sfx ? sfx : "None"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* General Fallback Suffix */}
        <div style={{ flex: "1 1 200px", minWidth: 180 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
            General Suffix (Optional)
          </div>
          <input
            type="text"
            value={mapping.generalSuffix ?? ""}
            onChange={(e) => handleGeneralSuffixChange(e.target.value)}
            placeholder="e.g. .cash"
            style={{
              width: "100%",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              padding: "6px 8px",
              borderRadius: 4,
              fontSize: 12,
              fontFamily: "var(--mono)"
            }}
          />
        </div>

        {/* Auto Detect Action */}
        <div style={{ display: "flex", alignItems: "flex-end", flexShrink: 0 }}>
          <button
            onClick={handleAutoDetect}
            disabled={detecting || loadingSymbols}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "var(--panel)",
              border: "1px solid var(--accent)",
              color: "var(--accent)",
              padding: "7px 12px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer"
            }}
            title="Scan broker symbols on connected MT5 and auto-populate matching identifiers"
          >
            <Wand2 size={13} className={detecting ? "spin" : ""} />
            {detecting ? "Detecting..." : "Auto-Detect from MT5"}
          </button>
        </div>
      </div>

      {/* Filter & Category Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", width: 220 }}>
          <Search size={13} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
          <input
            type="text"
            placeholder="Search assets..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            style={{
              width: "100%",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              padding: "5px 8px 5px 26px",
              borderRadius: 4,
              fontSize: 11
            }}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
          {["all", "index", "forex", "metal", "crypto"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "4px 8px",
                fontSize: 11,
                textTransform: "capitalize",
                background: activeCategory === cat ? "var(--accent-soft)" : "transparent",
                color: activeCategory === cat ? "var(--text)" : "var(--muted)",
                border: activeCategory === cat ? "1px solid var(--accent)" : "1px solid transparent",
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              {cat === "all" ? "All Assets" : cat}
            </button>
          ))}
        </div>

        {/* Add Symbol & Save Action */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text)",
              padding: "5px 10px",
              borderRadius: 6,
              fontSize: 11,
              cursor: "pointer"
            }}
          >
            <Plus size={12} /> Add Asset
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: saveSuccess ? "var(--green, #10b981)" : "var(--accent)",
              border: "none",
              color: "#fff",
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            {saveSuccess ? <Check size={14} /> : <Save size={14} />}
            {saveSuccess ? "Saved!" : saving ? "Saving..." : "Save Mapping"}
          </button>
        </div>
      </div>

      {/* Mapping Matrix Table */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        border: "1px solid var(--border)",
        borderRadius: 8,
        background: "var(--bg)"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--panel)", borderBottom: "1px solid var(--border)", color: "var(--muted)", fontSize: 11, textTransform: "uppercase" }}>
              <th style={{ padding: "8px 12px" }}>TradeSpace Canonical</th>
              <th style={{ padding: "8px 12px" }}>Category</th>
              <th style={{ padding: "8px 12px" }}>MT5 Broker Identifier</th>
              <th style={{ padding: "8px 12px" }}>Effective Query</th>
              <th style={{ padding: "8px 12px" }}>Broker Verification</th>
              <th style={{ padding: "8px 12px", width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredSymbols.map((item) => {
              const userVal = mapping.customMap?.[item.symbol] || "";
              const effectiveBroker = toBrokerSymbol(item.symbol, mapping);
              const isVerified = brokerNamesSet.has(effectiveBroker.toUpperCase());
              const hasCustomOverride = Boolean(userVal && userVal !== item.defaultBroker);
              const catCfg = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.custom;

              return (
                <tr
                  key={item.symbol}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: hasCustomOverride ? "rgba(41, 98, 255, 0.03)" : "transparent"
                  }}
                >
                  {/* Canonical Symbol */}
                  <td style={{ padding: "8px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 700, fontFamily: "var(--mono)", fontSize: 13, color: "var(--text)" }}>
                        {item.symbol}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }}>
                      {item.name}
                    </div>
                  </td>

                  {/* Category */}
                  <td style={{ padding: "8px 12px" }}>
                    <span style={{
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: catCfg.bg,
                      color: catCfg.color,
                      fontWeight: 600,
                      textTransform: "uppercase"
                    }}>
                      {catCfg.label}
                    </span>
                  </td>

                  {/* MT5 Broker Input */}
                  <td style={{ padding: "8px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input
                        type="text"
                        value={userVal}
                        onChange={(e) => handleCustomMapChange(item.symbol, e.target.value)}
                        placeholder={item.category === "forex" ? `${item.symbol}${mapping.forexSuffix || ""}` : item.defaultBroker}
                        style={{
                          width: 140,
                          background: "var(--panel)",
                          border: hasCustomOverride ? "1px solid var(--accent)" : "1px solid var(--border)",
                          color: "var(--text)",
                          padding: "5px 8px",
                          borderRadius: 4,
                          fontSize: 12,
                          fontFamily: "var(--mono)"
                        }}
                      />
                    </div>
                  </td>

                  {/* Effective Query Preview */}
                  <td style={{ padding: "8px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--muted)", fontSize: 11, fontFamily: "var(--mono)" }}>
                      <ArrowRight size={11} />
                      <span style={{ color: "var(--text)", fontWeight: 600 }}>{effectiveBroker}</span>
                    </div>
                  </td>

                  {/* Broker Verification Status */}
                  <td style={{ padding: "8px 12px" }}>
                    {loadingSymbols ? (
                      <span style={{ color: "var(--muted)", fontSize: 10 }}>Checking...</span>
                    ) : isVerified ? (
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                        fontSize: 10,
                        color: "#10b981",
                        background: "rgba(16, 185, 129, 0.1)",
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontWeight: 600
                      }}>
                        <Check size={10} /> Active on MT5
                      </span>
                    ) : (
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                        fontSize: 10,
                        color: "var(--muted)",
                        background: "rgba(255,255,255,0.04)",
                        padding: "2px 6px",
                        borderRadius: 4
                      }}>
                        Default / Unverified
                      </span>
                    )}
                  </td>

                  {/* Reset Action */}
                  <td style={{ padding: "8px 12px", textAlign: "right" }}>
                    {hasCustomOverride && (
                      <button
                        onClick={() => handleResetRow(item.symbol, item.defaultBroker)}
                        title="Reset to default"
                        style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", padding: 2 }}
                      >
                        <RotateCcw size={12} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Custom Symbol Modal */}
      {showAddModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10001,
          background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 10,
            padding: 20, width: 340, display: "flex", flexDirection: "column", gap: 12
          }}>
            <h3 style={{ margin: 0, fontSize: 14 }}>Add Custom Canonical Asset</h3>
            <div>
              <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 4 }}>TradeSpace Canonical Name</label>
              <input
                type="text"
                value={newSymbolName}
                onChange={(e) => setNewSymbolName(e.target.value.toUpperCase())}
                placeholder="e.g. US2000"
                style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "6px 8px", borderRadius: 4, fontSize: 12 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, color: "var(--muted)", display: "block", marginBottom: 4 }}>MT5 Broker Identifier</label>
              <input
                type="text"
                value={newBrokerName}
                onChange={(e) => setNewBrokerName(e.target.value)}
                placeholder="e.g. RUSSELL2000"
                style={{ width: "100%", background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)", padding: "6px 8px", borderRadius: 4, fontSize: 12 }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text)", padding: "6px 12px", borderRadius: 4, fontSize: 12, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomSymbol}
                style={{ background: "var(--accent)", border: "none", color: "#fff", padding: "6px 12px", borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                Add Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
