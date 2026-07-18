"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PLATFORMS, PLATFORM_KEYS, platformMeta, type PlatformKey } from "@/lib/platforms";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };
const SHADOW = "0 1px 3px rgba(60,64,67,0.12), 0 1px 2px rgba(60,64,67,0.06)";

type Business = { id: number; name: string };
type Theme = { label: string; count: number; quote: string };
type Insights = {
  businessName: string;
  total: number;
  analyzedText: number;
  avg: number;
  responseRate: number;
  positive: number;
  negative: number;
  distribution: { rating: number; count: number }[];
  sources: { key: string; label: string; count: number; avg: number }[];
  trend: { label: string; count: number; avg: number }[];
  ai: {
    sentimentSummary: string;
    praiseThemes: Theme[];
    complaintThemes: Theme[];
    keywords: { word: string; polarity: "positif" | "negatif" | "neutre" }[];
    actions: string[];
  } | null;
  aiAvailable: boolean;
};

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: 12, boxShadow: SHADOW, ...style }}>{children}</div>;
}

export default function InsightsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [platform, setPlatform] = useState<string>("all");
  const [data, setData] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [loadingBiz, setLoadingBiz] = useState(true);

  useEffect(() => {
    fetch("/api/businesses")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Business[]) => {
        const list = Array.isArray(d) ? d : [];
        setBusinesses(list);
        if (list.length) setSelected(list[0].id);
      })
      .catch(() => setBusinesses([]))
      .finally(() => setLoadingBiz(false));
  }, []);

  const analyze = useCallback(async () => {
    if (!selected) return;
    setLoading(true);
    setErr("");
    setData(null);
    try {
      const r = await fetch(`/api/insights/${selected}?platform=${platform}`);
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || "Analyse impossible");
      }
      setData(await r.json());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [selected, platform]);

  const maxTrend = data ? Math.max(...data.trend.map((t) => t.count), 1) : 1;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "#202124", letterSpacing: "-0.5px" }}>
            Insights IA
          </h1>
          <p style={{ margin: 0, color: "#5F6368", fontSize: 14 }}>Ce que vos clients disent vraiment. Thèmes, tendances, actions.</p>
        </div>
        <Link href="/dashboard" style={{ padding: "8px 16px", background: "#fff", border: "1px solid #DADCE0", borderRadius: 8, textDecoration: "none", fontSize: 13, color: "#5F6368", boxShadow: SHADOW }}>
          ← Dashboard
        </Link>
      </div>

      {loadingBiz && <p style={{ color: "#80868B" }}>Chargement…</p>}

      {!loadingBiz && businesses.length === 0 && (
        <Card style={{ padding: "48px 24px", textAlign: "center" }}>
          <p style={{ margin: "0 0 8px", fontSize: 40 }}>🧠</p>
          <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: "#202124" }}>Aucun établissement</p>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#5F6368" }}>Ajoutez un établissement et synchronisez pour lancer l&apos;analyse.</p>
          <Link href="/businesses" style={{ padding: "10px 20px", background: G.blue, color: "#fff", textDecoration: "none", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
            Ajouter un établissement →
          </Link>
        </Card>
      )}

      {!loadingBiz && businesses.length > 0 && (
        <>
          {/* Barre de contrôle */}
          <Card style={{ padding: "16px 20px", marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 200px" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#5F6368", marginBottom: 6 }}>Établissement</label>
              <select value={selected ?? ""} onChange={(e) => setSelected(Number(e.target.value))}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #DADCE0", borderRadius: 8, fontSize: 14, color: "#202124", background: "#fff", fontFamily: "inherit" }}>
                {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div style={{ flex: "1 1 160px" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#5F6368", marginBottom: 6 }}>Source</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #DADCE0", borderRadius: 8, fontSize: 14, color: "#202124", background: "#fff", fontFamily: "inherit" }}>
                <option value="all">Toutes les sources</option>
                {PLATFORM_KEYS.map((k) => <option key={k} value={k}>{PLATFORMS[k].label}</option>)}
              </select>
            </div>
            <button onClick={analyze} disabled={loading || !selected}
              style={{ padding: "11px 22px", background: loading ? `${G.blue}80` : G.blue, border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              {loading ? "Analyse en cours…" : "✨ Analyser les avis"}
            </button>
          </Card>

          {err && (
            <Card style={{ padding: "14px 18px", marginBottom: 20, background: "#FCE8E6", border: "1px solid #F5B5AE", color: G.red, fontSize: 13 }}>
              ⚠ {err}
            </Card>
          )}

          {loading && (
            <Card style={{ padding: "40px 24px", textAlign: "center", marginBottom: 20 }}>
              <p style={{ margin: "0 0 6px", fontSize: 28 }}>🧠</p>
              <p style={{ margin: 0, fontSize: 14, color: "#5F6368" }}>L&apos;IA lit vos avis et en tire les tendances…</p>
            </Card>
          )}

          {data && !loading && (
            <>
              {data.total === 0 ? (
                <Card style={{ padding: "40px 24px", textAlign: "center", marginBottom: 20 }}>
                  <p style={{ margin: "0 0 8px", fontSize: 34 }}>📭</p>
                  <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#202124" }}>Aucun avis pour cette source</p>
                  <p style={{ margin: 0, fontSize: 13, color: "#5F6368" }}>Synchronisez, ou importez vos avis d&apos;une autre plateforme ci-dessous.</p>
                </Card>
              ) : (
                <>
                  {/* KPI */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 20 }}>
                    {[
                      { label: "Avis analysés", value: data.total, color: G.blue, sub: `${data.analyzedText} avec texte` },
                      { label: "Note moyenne", value: data.avg > 0 ? `${data.avg} ★` : "—", color: G.yellow, sub: "sur la sélection" },
                      { label: "Positifs (4-5★)", value: data.positive, color: G.green, sub: `${data.total > 0 ? Math.round((data.positive / data.total) * 100) : 0}% du total` },
                      { label: "À surveiller (1-3★)", value: data.negative, color: G.red, sub: `${data.total > 0 ? Math.round((data.negative / data.total) * 100) : 0}% du total` },
                      { label: "Taux de réponse", value: `${data.responseRate}%`, color: data.responseRate >= 80 ? G.green : G.yellow, sub: data.responseRate >= 80 ? "Excellent" : "À améliorer" },
                    ].map((c) => (
                      <Card key={c.label} style={{ padding: "16px 18px", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: c.color }} />
                        <p style={{ margin: "0 0 4px", fontSize: 11, color: "#5F6368", textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 500 }}>{c.label}</p>
                        <p style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "#202124", letterSpacing: "-0.6px" }}>{c.value}</p>
                        <p style={{ margin: 0, fontSize: 11, color: c.color, fontWeight: 500 }}>{c.sub}</p>
                      </Card>
                    ))}
                  </div>

                  {/* Sentiment global */}
                  {data.ai?.sentimentSummary && (
                    <Card style={{ padding: "20px 24px", marginBottom: 20, background: "linear-gradient(135deg,#E8F0FE,#F6FBF7)", border: "1px solid #D2E3FC" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: G.blue, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Synthèse</div>
                      <p style={{ margin: 0, fontSize: 15, color: "#202124", lineHeight: 1.6 }}>{data.ai.sentimentSummary}</p>
                    </Card>
                  )}

                  {!data.aiAvailable && (
                    <Card style={{ padding: "14px 18px", marginBottom: 20, background: "#FEF7E0", border: "1px solid #FBBC04", color: "#7A5900", fontSize: 13 }}>
                      L&apos;analyse par thèmes n&apos;est pas disponible (clé IA manquante ou avis sans texte). Les statistiques ci-dessus restent valides.
                    </Card>
                  )}

                  {/* Thèmes positifs / négatifs */}
                  {data.ai && (data.ai.praiseThemes.length > 0 || data.ai.complaintThemes.length > 0) && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 20 }}>
                      <ThemeColumn title="Ce que les clients adorent" color={G.green} bg="#E6F4EA" themes={data.ai.praiseThemes} />
                      <ThemeColumn title="Ce qui revient en négatif" color={G.red} bg="#FCE8E6" themes={data.ai.complaintThemes} />
                    </div>
                  )}

                  {/* Mots-clés */}
                  {data.ai && data.ai.keywords.length > 0 && (
                    <Card style={{ padding: "20px 24px", marginBottom: 20 }}>
                      <h2 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 600, color: "#202124" }}>Mots-clés récurrents</h2>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {data.ai.keywords.map((k, i) => {
                          const col = k.polarity === "positif" ? G.green : k.polarity === "negatif" ? G.red : "#5F6368";
                          const bg = k.polarity === "positif" ? "#E6F4EA" : k.polarity === "negatif" ? "#FCE8E6" : "#F1F3F4";
                          return <span key={i} style={{ padding: "6px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600, color: col, background: bg }}>{k.word}</span>;
                        })}
                      </div>
                    </Card>
                  )}

                  {/* Tendance + sources */}
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 20 }}>
                    <Card style={{ padding: "20px 24px" }}>
                      <h2 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: "#202124" }}>Volume sur 6 mois</h2>
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 120 }}>
                        {data.trend.map((t, i) => {
                          const pct = (t.count / maxTrend) * 100;
                          return (
                            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                              <span style={{ fontSize: 10, fontWeight: 600, color: "#202124" }}>{t.count > 0 ? t.count : ""}</span>
                              <div style={{ width: "100%", height: 90, background: "#F8F9FA", borderRadius: "6px 6px 0 0", display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                                <div style={{ width: "100%", height: `${Math.max(pct, t.count > 0 ? 4 : 0)}%`, background: G.blue, borderRadius: "4px 4px 0 0" }} />
                              </div>
                              <span style={{ fontSize: 10, color: "#80868B" }}>{t.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </Card>

                    <Card style={{ padding: "20px 24px" }}>
                      <h2 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 600, color: "#202124" }}>Par source</h2>
                      {data.sources.length === 0 && <p style={{ fontSize: 13, color: "#80868B", margin: 0 }}>—</p>}
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {data.sources.map((s) => {
                          const m = platformMeta(s.key);
                          return (
                            <div key={s.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <span style={{ padding: "2px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, color: m.color, background: m.bg }}>{s.label}</span>
                              <span style={{ fontSize: 13, color: "#202124" }}><strong>{s.count}</strong> · {s.avg > 0 ? `${s.avg}★` : "—"}</span>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </div>

                  {/* Actions recommandées */}
                  {data.ai && data.ai.actions.length > 0 && (
                    <Card style={{ padding: "20px 24px", marginBottom: 20, borderLeft: `4px solid ${G.blue}` }}>
                      <h2 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 600, color: "#202124" }}>Actions prioritaires</h2>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {data.ai.actions.map((a, i) => (
                          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: "#E8F0FE", color: G.blue, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                            <span style={{ fontSize: 14, color: "#202124", lineHeight: 1.5 }}>{a}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </>
              )}
            </>
          )}

          {/* Import multi-sources */}
          <ImportPanel businesses={businesses} defaultBusiness={selected} onDone={analyze} />
        </>
      )}
    </div>
  );
}

function ThemeColumn({ title, color, bg, themes }: { title: string; color: string; bg: string; themes: Theme[] }) {
  return (
    <Card style={{ padding: "20px 24px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 }}>{title}</div>
      {themes.length === 0 && <p style={{ fontSize: 13, color: "#80868B", margin: 0 }}>Rien de marquant.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {themes.map((t, i) => (
          <div key={i} style={{ background: bg, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#202124" }}>{t.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color, background: "#fff", borderRadius: 10, padding: "1px 8px" }}>{t.count}</span>
            </div>
            {t.quote && <p style={{ margin: 0, fontSize: 12, color: "#5F6368", fontStyle: "italic", lineHeight: 1.5 }}>&ldquo;{t.quote}&rdquo;</p>}
          </div>
        ))}
      </div>
    </Card>
  );
}

function ImportPanel({ businesses, defaultBusiness, onDone }: { businesses: Business[]; defaultBusiness: number | null; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [biz, setBiz] = useState<number | null>(defaultBusiness);
  const [platform, setPlatform] = useState<PlatformKey>("tripadvisor");
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { setBiz(defaultBusiness); }, [defaultBusiness]);

  async function submit() {
    if (!biz || !csv.trim()) { setMsg("Choisissez un établissement et collez vos avis."); return; }
    setBusy(true); setMsg("");
    try {
      const r = await fetch("/api/reviews/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: biz, platform, csv }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Import impossible");
      setMsg(`✓ ${d.imported} avis importés (${d.skipped} ignorés / doublons).`);
      setCsv("");
      onDone();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card style={{ padding: "20px 24px", marginTop: 8 }}>
      <button onClick={() => setOpen((o) => !o)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit" }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#202124" }}>📥 Importer des avis d&apos;une autre plateforme</span>
        <span style={{ fontSize: 12, color: G.blue }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ marginTop: 16 }}>
          <p style={{ margin: "0 0 14px", fontSize: 13, color: "#5F6368", lineHeight: 1.6 }}>
            Exportez vos avis depuis Tripadvisor, Facebook ou PagesJaunes, puis collez le tableau ici (CSV).
            Colonnes reconnues : <strong>auteur, note, avis, date</strong> (dans cet ordre, ou avec un en-tête). Une ligne = un avis.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <select value={biz ?? ""} onChange={(e) => setBiz(Number(e.target.value))}
              style={{ flex: "1 1 200px", padding: "10px 12px", border: "1px solid #DADCE0", borderRadius: 8, fontSize: 14, background: "#fff", fontFamily: "inherit" }}>
              {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select value={platform} onChange={(e) => setPlatform(e.target.value as PlatformKey)}
              style={{ flex: "1 1 160px", padding: "10px 12px", border: "1px solid #DADCE0", borderRadius: 8, fontSize: 14, background: "#fff", fontFamily: "inherit" }}>
              {PLATFORM_KEYS.filter((k) => k !== "google").map((k) => <option key={k} value={k}>{PLATFORMS[k].label}</option>)}
            </select>
          </div>
          <textarea value={csv} onChange={(e) => setCsv(e.target.value)}
            placeholder={'auteur,note,avis,date\nMarie D.,5,"Accueil parfait, je reviendrai",2026-05-12\nPaul R.,2,"Trop d\'attente le midi",2026-05-03'}
            rows={6}
            style={{ width: "100%", padding: "12px 14px", border: "1px solid #DADCE0", borderRadius: 8, fontSize: 13, fontFamily: "ui-monospace,Menlo,monospace", color: "#202124", boxSizing: "border-box", resize: "vertical" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
            <button onClick={submit} disabled={busy}
              style={{ padding: "10px 20px", background: busy ? `${G.green}80` : G.green, border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600, cursor: busy ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              {busy ? "Import…" : "Importer"}
            </button>
            {msg && <span style={{ fontSize: 13, color: msg.startsWith("✓") ? G.green : G.red }}>{msg}</span>}
          </div>
        </div>
      )}
    </Card>
  );
}
