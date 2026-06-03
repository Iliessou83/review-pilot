"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Business } from "@/db/schema";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };
const SHADOW = "0 1px 3px rgba(60,64,67,0.12), 0 1px 2px rgba(60,64,67,0.06)";

type BusinessWithStats = Business & { reviewCount: number };

function Field({ label, value, onChange, type = "text", placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#202124", marginBottom: "6px" }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        style={{
          width: "100%", padding: "10px 14px",
          background: "#fff", border: "1px solid #DADCE0",
          borderRadius: "6px", color: "#202124", fontSize: "14px",
          outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
          fontFamily: "inherit",
        }}
        onFocus={(e) => { e.target.style.borderColor = G.blue; e.target.style.boxShadow = `0 0 0 2px ${G.blue}20`; }}
        onBlur={(e) => { e.target.style.borderColor = "#DADCE0"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

export default function BusinessesClient({ businesses }: { businesses: BusinessWithStats[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", platform: "google" as "google" | "trustpilot",
    platformId: "", platformToken: "", ownerEmail: "", autoReply5Star: true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ name: "", platform: "google", platformId: "", platformToken: "", ownerEmail: "", autoReply5Star: true });
        router.refresh();
      } else {
        const data = await res.json() as { error: string };
        setError(data.error);
      }
    } catch {
      setError("Erreur réseau. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSync(id: number) {
    setSyncingId(id);
    try {
      await fetch(`/api/reviews/sync?businessId=${id}`, { method: "POST" });
      router.refresh();
    } finally {
      setSyncingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cet établissement et tous ses avis ?")) return;
    await fetch(`/api/businesses?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: 700, color: "#202124", letterSpacing: "-0.5px" }}>
            Établissements
          </h1>
          <p style={{ margin: 0, color: "#5F6368", fontSize: "14px" }}>
            {businesses.length} établissement{businesses.length !== 1 ? "s" : ""} connecté{businesses.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "10px 20px",
            background: showForm ? "#fff" : G.blue,
            border: showForm ? "1px solid #DADCE0" : "none",
            borderRadius: "6px", color: showForm ? "#5F6368" : "#fff",
            fontSize: "14px", fontWeight: 600, cursor: "pointer",
            boxShadow: showForm ? SHADOW : `0 2px 8px ${G.blue}40`,
            fontFamily: "inherit",
          }}
        >
          {showForm ? "Annuler" : "+ Ajouter un établissement"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{
          background: "#fff", border: `1px solid ${G.blue}30`,
          borderRadius: "12px", padding: "28px", marginBottom: "24px",
          boxShadow: SHADOW,
        }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 600, color: "#202124" }}>
            Nouvel établissement
          </h3>

          {/* Info banner */}
          <div style={{
            padding: "12px 16px", background: "#E8F0FE",
            borderRadius: "8px", marginBottom: "20px",
            fontSize: "13px", color: G.blue, lineHeight: 1.5,
          }}>
            <strong>Configuration Google Business Profile :</strong> Vous aurez besoin de votre Place ID Google
            (trouvable sur <strong>developers.google.com/maps/documentation/places</strong>) et d&apos;un token OAuth
            obtenu via la Google Cloud Console.
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <Field label="Nom de l'établissement" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Le Jardin Bio" required />

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#202124", marginBottom: "6px" }}>
                  Plateforme
                </label>
                <select
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value as "google" | "trustpilot" })}
                  style={{
                    width: "100%", padding: "10px 14px",
                    background: "#fff", border: "1px solid #DADCE0",
                    borderRadius: "6px", color: "#202124", fontSize: "14px",
                    outline: "none", cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  <option value="google">Google Business Profile</option>
                  <option value="trustpilot">Trustpilot</option>
                </select>
              </div>

              <Field
                label={form.platform === "google" ? "Google Place ID" : "Trustpilot Business Unit ID"}
                value={form.platformId}
                onChange={(v) => setForm({ ...form, platformId: v })}
                placeholder={form.platform === "google" ? "accounts/123/locations/456" : "507f1f77bcf86cd799439011"}
                required
              />

              <Field
                label={form.platform === "google" ? "Token OAuth" : "Clé API"}
                value={form.platformToken}
                onChange={(v) => setForm({ ...form, platformToken: v })}
                placeholder="Token / Clé API"
                type="password"
                required
              />

              <Field
                label="Email du responsable (notifications)"
                value={form.ownerEmail}
                onChange={(v) => setForm({ ...form, ownerEmail: v })}
                placeholder="responsable@etablissement.fr"
                type="email"
                required
              />

              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", paddingBottom: "10px" }}>
                  <div
                    onClick={() => setForm({ ...form, autoReply5Star: !form.autoReply5Star })}
                    style={{
                      width: "42px", height: "24px",
                      background: form.autoReply5Star ? G.blue : "#DADCE0",
                      borderRadius: "12px", position: "relative",
                      transition: "background 0.2s", cursor: "pointer", flexShrink: 0,
                    }}
                  >
                    <div style={{
                      position: "absolute", top: "3px",
                      left: form.autoReply5Star ? "21px" : "3px",
                      width: "18px", height: "18px",
                      background: "#fff", borderRadius: "50%",
                      transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }} />
                  </div>
                  <span style={{ fontSize: "13px", color: "#202124" }}>
                    Auto-réponse 4-5 étoiles activée
                  </span>
                </label>
              </div>
            </div>

            {error && (
              <div style={{ padding: "10px 14px", background: "#FCE8E6", borderRadius: "6px", color: G.red, fontSize: "13px", marginBottom: "14px" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              padding: "10px 24px", background: loading ? `${G.blue}80` : G.blue,
              border: "none", borderRadius: "6px", color: "#fff",
              fontSize: "14px", fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}>
              {loading ? "Ajout en cours..." : "Ajouter l'établissement"}
            </button>
          </form>
        </div>
      )}

      {/* List */}
      {businesses.length === 0 ? (
        <div style={{
          background: "#fff", border: "1px solid #DADCE0",
          borderRadius: "12px", padding: "64px 24px",
          textAlign: "center", boxShadow: SHADOW,
        }}>
          <p style={{ margin: "0 0 12px", fontSize: "44px" }}>🏢</p>
          <p style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 600, color: "#202124" }}>
            Aucun établissement connecté
          </p>
          <p style={{ margin: 0, fontSize: "13px", color: "#5F6368" }}>
            Ajoutez votre premier établissement pour commencer à gérer vos avis.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {businesses.map((biz) => (
            <div key={biz.id} style={{
              background: "#fff", border: "1px solid #DADCE0",
              borderRadius: "12px", padding: "18px 24px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: "16px", boxShadow: SHADOW,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "15px", fontWeight: 600, color: "#202124" }}>{biz.name}</span>
                  <span style={{
                    padding: "2px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                    background: biz.platform === "google" ? "#E8F0FE" : "#E6F4EA",
                    color: biz.platform === "google" ? G.blue : G.green,
                  }}>
                    {biz.platform === "google" ? "Google" : "Trustpilot"}
                  </span>
                  {biz.autoReply5Star && (
                    <span style={{
                      padding: "2px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                      background: "#E6F4EA", color: G.green,
                    }}>
                      Auto-réponse ✓
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#5F6368" }}>
                  <span>{biz.reviewCount} avis</span>
                  <span>{biz.ownerEmail}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleSync(biz.id)}
                  disabled={syncingId === biz.id}
                  style={{
                    padding: "8px 16px",
                    background: "#E8F0FE", border: "none",
                    borderRadius: "6px", color: G.blue,
                    fontSize: "13px", fontWeight: 500,
                    cursor: syncingId === biz.id ? "not-allowed" : "pointer",
                    opacity: syncingId === biz.id ? 0.6 : 1, fontFamily: "inherit",
                  }}
                >
                  {syncingId === biz.id ? "Synchronisation..." : "Synchroniser"}
                </button>
                <button
                  onClick={() => handleDelete(biz.id)}
                  style={{
                    padding: "8px 14px", background: "#fff",
                    border: "1px solid #DADCE0", borderRadius: "6px",
                    color: "#5F6368", fontSize: "13px",
                    cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget).style.borderColor = G.red;
                    (e.currentTarget).style.color = G.red;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget).style.borderColor = "#DADCE0";
                    (e.currentTarget).style.color = "#5F6368";
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
