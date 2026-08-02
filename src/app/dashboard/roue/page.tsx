"use client";

import { useEffect, useState } from "react";
import type { WheelSegment } from "@/db/schema";
import DelegateBanner from "@/components/DelegateBanner";

type Wheel = {
  id: number;
  slug: string;
  mode: "avis" | "concours";
  theme: "dark" | "neon" | "warm";
  businessName: string;
  headline: string;
  brandColor: string;
  reviewUrl: string;
  segments: WheelSegment[];
  requireContact: boolean;
  consentText: string | null;
  active: boolean;
  spins: number;
  reviewClicks: number;
};

const DEFAULT_SEGMENTS: WheelSegment[] = [
  { label: "-10%", weight: 50, color: "#10b981" },
  { label: "Café offert", weight: 15, color: "#1e40af" },
  { label: "Dessert", weight: 15, color: "#0ea5e9" },
  { label: "Rejouez", weight: 10, color: "#6366f1" },
  { label: "-15%", weight: 7, color: "#059669" },
  { label: "Surprise", weight: 3, color: "#d4af37" },
];

const EMPTY = {
  id: 0,
  businessName: "",
  slug: "",
  mode: "avis" as "avis" | "concours",
  theme: "dark" as "dark" | "neon" | "warm",
  brandColor: "#10b981",
  headline: "Merci de votre visite !",
  reviewUrl: "",
  requireContact: false,
  consentText: "",
  segments: DEFAULT_SEGMENTS,
};

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  padding: 20,
  marginBottom: 16,
};
const label: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 };
const input: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, marginBottom: 14 };

export default function RouePage() {
  const [wheels, setWheels] = useState<Wheel[]>([]);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  async function load() {
    const res = await fetch("/api/wheel");
    if (res.ok) setWheels((await res.json()).wheels);
  }
  useEffect(() => { load(); }, []);

  function set<K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function setSeg(i: number, patch: Partial<WheelSegment>) {
    setForm((f) => ({ ...f, segments: f.segments.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));
  }
  function addSeg() {
    setForm((f) => ({ ...f, segments: [...f.segments, { label: "Lot", weight: 10, color: "#10b981" }] }));
  }
  function removeSeg(i: number) {
    setForm((f) => ({ ...f, segments: f.segments.filter((_, j) => j !== i) }));
  }

  function edit(w: Wheel) {
    setEditing(true);
    setForm({
      id: w.id, businessName: w.businessName, slug: w.slug, mode: w.mode, theme: w.theme,
      brandColor: w.brandColor, headline: w.headline, reviewUrl: w.reviewUrl,
      requireContact: w.requireContact, consentText: w.consentText || "", segments: w.segments,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function reset() { setEditing(false); setForm(EMPTY); setMsg(""); }

  async function save() {
    setMsg("");
    if (!form.businessName.trim()) return setMsg("Nom du commerce requis.");
    if (!form.reviewUrl.trim()) return setMsg("Lien d'avis Google requis.");
    if (form.segments.length < 2) return setMsg("Au moins 2 segments.");
    setSaving(true);
    const isUpdate = form.id > 0;
    const res = await fetch("/api/wheel", {
      method: isUpdate ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setMsg(data.error || "Erreur.");
    setMsg(isUpdate ? "Roue mise à jour." : "Roue créée.");
    reset();
    load();
  }

  async function toggleActive(w: Wheel) {
    await fetch("/api/wheel", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: w.id, active: !w.active }),
    });
    load();
  }
  async function del(w: Wheel) {
    if (!confirm(`Supprimer la roue "${w.businessName}" ?`)) return;
    await fetch(`/api/wheel?id=${w.id}`, { method: "DELETE" });
    load();
  }

  const totalWeight = form.segments.reduce((s, x) => s + (x.weight || 0), 0);

  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>🎡 Roue de la chance</h1>
      <p style={{ color: "#6B7280", marginBottom: 24 }}>
        Configure la roue que tes clients scannent. Le tirage est pondéré côté serveur.
        La récompense reste indépendante de l&apos;avis Google (conformité Google + RGPD).
      </p>

      <DelegateBanner
        storageKey="roue"
        icon="🎡"
        title="Pas à l'aise avec le design des lots ?"
        body="Caela Agency peut créer vos visuels de roue (illustrations, habillage) assortis à votre enseigne. Prestation payante, sur devis. Le QR à afficher en caisse, lui, est généré automatiquement ci-dessous, gratuitement."
        ctaLabel="En discuter →"
        mailSubject="Déléguer la création des visuels de ma roue à avis"
        kind="visuel"
      />

      {/* Éditeur */}
      <div style={card}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
          {editing ? "Modifier la roue" : "Nouvelle roue"}
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={label}>Nom du commerce</label>
            <input style={input} value={form.businessName} onChange={(e) => set("businessName", e.target.value)} placeholder="Chez Marco" />
          </div>
          <div>
            <label style={label}>Lien d&apos;avis Google</label>
            <input style={input} value={form.reviewUrl} onChange={(e) => set("reviewUrl", e.target.value)} placeholder="https://g.page/r/..." />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <div>
            <label style={label}>Thème</label>
            <select style={input} value={form.theme} onChange={(e) => set("theme", e.target.value as typeof form.theme)}>
              <option value="dark">Dark Premium</option>
              <option value="neon">Néon Futuriste</option>
              <option value="warm">Chaleureux Clair</option>
            </select>
          </div>
          <div>
            <label style={label}>Mode</label>
            <select style={input} value={form.mode} onChange={(e) => { const m = e.target.value as typeof form.mode; set("mode", m); set("requireContact", m === "concours"); }}>
              <option value="avis">Avis (boutique)</option>
              <option value="concours">Jeu-concours (réseaux)</option>
            </select>
          </div>
          <div>
            <label style={label}>Couleur d&apos;accent</label>
            <input type="color" style={{ ...input, height: 42, padding: 4 }} value={form.brandColor} onChange={(e) => set("brandColor", e.target.value)} />
          </div>
        </div>

        <label style={label}>Sous-titre</label>
        <input style={input} value={form.headline} onChange={(e) => set("headline", e.target.value)} />

        {form.mode === "concours" && (
          <>
            <label style={label}>Texte de consentement RGPD (mode concours)</label>
            <input style={input} value={form.consentText} onChange={(e) => set("consentText", e.target.value)} placeholder="En participant, j'accepte d'être recontacté par email." />
          </>
        )}

        {/* Segments */}
        <label style={label}>Lots & probabilités (poids relatifs, total = {totalWeight})</label>
        {form.segments.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <input style={{ ...input, marginBottom: 0, flex: 2 }} value={s.label} onChange={(e) => setSeg(i, { label: e.target.value })} placeholder="Lot" />
            <input type="number" min={0} style={{ ...input, marginBottom: 0, width: 90 }} value={s.weight} onChange={(e) => setSeg(i, { weight: Number(e.target.value) })} title="Poids" />
            <span style={{ fontSize: 12, color: "#6B7280", width: 44 }}>{totalWeight > 0 ? Math.round((s.weight / totalWeight) * 100) : 0}%</span>
            <input type="color" style={{ width: 42, height: 38, padding: 2, border: "1px solid #D1D5DB", borderRadius: 8 }} value={s.color} onChange={(e) => setSeg(i, { color: e.target.value })} />
            <button onClick={() => removeSeg(i)} style={{ border: "none", background: "#FEE2E2", color: "#B91C1C", borderRadius: 8, width: 38, height: 38, cursor: "pointer" }}>✕</button>
          </div>
        ))}
        <button onClick={addSeg} style={{ marginTop: 4, marginBottom: 16, border: "1px dashed #9CA3AF", background: "transparent", color: "#374151", borderRadius: 8, padding: "8px 14px", cursor: "pointer" }}>+ Ajouter un lot</button>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={save} disabled={saving} style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: 8, padding: "12px 24px", fontWeight: 700, cursor: "pointer" }}>
            {saving ? "..." : editing ? "Mettre à jour" : "Créer la roue"}
          </button>
          {editing && <button onClick={reset} style={{ background: "transparent", border: "1px solid #D1D5DB", borderRadius: 8, padding: "12px 20px", cursor: "pointer" }}>Annuler</button>}
          {msg && <span style={{ color: msg.includes("Erreur") || msg.includes("requis") || msg.includes("segments") ? "#B91C1C" : "#059669", fontSize: 14 }}>{msg}</span>}
        </div>
      </div>

      {/* Liste */}
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: "24px 0 12px" }}>Mes roues ({wheels.length})</h2>
      {wheels.length === 0 && <p style={{ color: "#6B7280" }}>Aucune roue pour l&apos;instant.</p>}
      {wheels.map((w) => (
        <div key={w.id} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              {w.businessName}{" "}
              <span style={{ fontSize: 12, fontWeight: 500, color: "#6B7280" }}>
                · {w.mode === "concours" ? "Jeu-concours" : "Avis"} · {w.theme}
              </span>
            </div>
            <a href={`/r/${w.slug}`} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "#1A73E8" }}>
              {origin}/r/{w.slug} ↗
            </a>
            <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
              🎡 {w.spins} tours · ⭐ {w.reviewClicks} clics avis
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src={`/api/wheel/${w.id}/qr`}
                alt={`QR code de la roue ${w.businessName}`}
                width={72}
                height={72}
                style={{ borderRadius: 8, border: "1px solid #E5E7EB", display: "block" }}
              />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>QR à afficher en caisse</div>
                <a
                  href={`/api/wheel/${w.id}/qr?dl=1`}
                  download={`roue-${w.slug}-qr.png`}
                  style={{ fontSize: 13, color: "#1A73E8" }}
                >
                  Télécharger (PNG) ↓
                </a>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => toggleActive(w)} style={{ border: "1px solid #D1D5DB", background: w.active ? "#ECFDF5" : "#F3F4F6", color: w.active ? "#059669" : "#6B7280", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 13 }}>
                {w.active ? "Active" : "Inactive"}
              </button>
              <button onClick={() => edit(w)} style={{ border: "1px solid #D1D5DB", background: "#fff", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 13 }}>Modifier</button>
              <button onClick={() => del(w)} style={{ border: "none", background: "#FEE2E2", color: "#B91C1C", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontSize: 13 }}>Supprimer</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
