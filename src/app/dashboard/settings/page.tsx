"use client";

import { useState, useEffect } from "react";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };
const SHADOW = "0 1px 3px rgba(60,64,67,0.12), 0 1px 2px rgba(60,64,67,0.06)";

const BUSINESS_TYPES = [
  { value: "restaurant", label: "🍽️ Restaurant" },
  { value: "salon", label: "💇 Salon beauté" },
  { value: "hotel", label: "🏨 Hôtel" },
  { value: "garage", label: "🔧 Garage" },
  { value: "medical", label: "🏥 Médical" },
  { value: "commerce", label: "🛍️ Commerce" },
  { value: "other", label: "📌 Autre" },
];

const COMPENSATION_EXAMPLES: Record<string, string[]> = {
  restaurant: ["Un café offert lors de votre prochain passage", "10% sur votre prochain repas", "Un dessert offert pour nous excuser"],
  salon: ["10% sur votre prochaine prestation", "Un soin offert lors de votre prochain RDV"],
  hotel: ["Surclassement à disponibilité", "Petit-déjeuner offert prochaine réservation"],
  garage: ["10% sur votre prochaine révision", "Vérification pneumatiques gratuite"],
  medical: ["Consultation de suivi offerte", "Priorité de rendez-vous"],
  commerce: ["15% sur votre prochain achat", "Livraison offerte commande suivante"],
  other: ["Un geste commercial lors de votre prochaine visite", "10% de réduction exclusive"],
};

type BusinessSettings = {
  id: number;
  name: string;
  businessType: string;
  autoReply5Star: boolean;
  autoReplyNegative: boolean;
  compensationEnabled: boolean;
  compensationText: string;
  ownerEmail: string;
};

function Toggle({ value, onChange, color }: { value: boolean; onChange: (v: boolean) => void; color: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      style={{
        width: "48px", height: "26px", borderRadius: "13px",
        background: value ? color : "#DADCE0",
        border: "none", cursor: "pointer", position: "relative",
        flexShrink: 0, transition: "background 0.2s",
      }}
    >
      <div style={{
        width: "20px", height: "20px", borderRadius: "50%", background: "#fff",
        position: "absolute", top: "3px", left: value ? "25px" : "3px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        transition: "left 0.2s",
      }} />
    </button>
  );
}

function BusinessCard({ biz, onSave }: { biz: BusinessSettings; onSave: (id: number, data: Partial<BusinessSettings>) => Promise<void> }) {
  const [local, setLocal] = useState({ ...biz });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function update<K extends keyof BusinessSettings>(key: K, value: BusinessSettings[K]) {
    setLocal(s => ({ ...s, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      await onSave(biz.id, {
        businessType: local.businessType,
        autoReply5Star: local.autoReply5Star,
        autoReplyNegative: local.autoReplyNegative,
        compensationEnabled: local.compensationEnabled,
        compensationText: local.compensationText,
        ownerEmail: local.ownerEmail,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  const examples = COMPENSATION_EXAMPLES[local.businessType] || COMPENSATION_EXAMPLES.other;

  return (
    <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "16px", overflow: "hidden", boxShadow: SHADOW }}>
      {/* Card header */}
      <div style={{ padding: "18px 24px", borderBottom: "1px solid #DADCE0", background: "#F8F9FA", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: "0 0 2px", fontSize: "16px", fontWeight: 700, color: "#202124" }}>{biz.name}</h2>
          <p style={{ margin: 0, fontSize: "12px", color: "#5F6368" }}>{biz.ownerEmail}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "8px 20px",
            background: saved ? G.green : G.blue,
            border: "none", borderRadius: "8px", color: "#fff",
            fontSize: "13px", fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
            transition: "background 0.2s",
            fontFamily: "inherit",
          }}
        >
          {saving ? "Enregistrement..." : saved ? "✓ Enregistré" : "Enregistrer"}
        </button>
      </div>

      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {error && (
          <div style={{ padding: "10px 14px", background: "#FCE8E6", borderRadius: "8px", color: G.red, fontSize: "13px" }}>
            ⚠ {error}
          </div>
        )}

        {/* Type établissement */}
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#202124", marginBottom: "10px" }}>
            Type d&apos;établissement
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {BUSINESS_TYPES.map(bt => (
              <button
                key={bt.value}
                type="button"
                onClick={() => update("businessType", bt.value)}
                style={{
                  padding: "7px 14px", borderRadius: "8px",
                  border: `2px solid ${local.businessType === bt.value ? G.blue : "#DADCE0"}`,
                  background: local.businessType === bt.value ? "#E8F0FE" : "#fff",
                  color: local.businessType === bt.value ? G.blue : "#5F6368",
                  fontWeight: 500, fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
                }}
              >
                {bt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Auto-reply 4-5★ */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "#F8F9FA", borderRadius: "10px" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#202124" }}>Réponse automatique 4-5 ★</div>
            <div style={{ fontSize: "12px", color: "#5F6368", marginTop: "2px" }}>L&apos;IA répond en 30s. Personnalisée avec le prénom.</div>
          </div>
          <Toggle value={local.autoReply5Star} onChange={v => update("autoReply5Star", v)} color={G.green} />
        </div>

        {/* Auto-reply négatif */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: "#F8F9FA", borderRadius: "10px" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#202124" }}>Réponse automatique avis négatifs 1-3 ★</div>
            <div style={{ fontSize: "12px", color: "#5F6368", marginTop: "2px" }}>
              {local.autoReplyNegative ? "L'IA répond automatiquement sans vous demander." : "Désactivé: vous recevez 3 suggestions par email (recommandé)."}
            </div>
          </div>
          <Toggle value={local.autoReplyNegative} onChange={v => update("autoReplyNegative", v)} color={G.yellow} />
        </div>

        {/* Email notification */}
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#202124", marginBottom: "6px" }}>
            Email notifications
          </label>
          <input
            type="email"
            value={local.ownerEmail}
            onChange={e => update("ownerEmail", e.target.value)}
            placeholder="responsable@etablissement.fr"
            style={{
              width: "100%", padding: "10px 14px",
              border: "1px solid #DADCE0", borderRadius: "8px",
              fontSize: "14px", color: "#202124", outline: "none",
              boxSizing: "border-box", fontFamily: "inherit",
            }}
            onFocus={e => { e.target.style.borderColor = G.blue; e.target.style.boxShadow = `0 0 0 2px ${G.blue}20`; }}
            onBlur={e => { e.target.style.borderColor = "#DADCE0"; e.target.style.boxShadow = "none"; }}
          />
          <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#80868B" }}>
            Reçoit les emails avec les 3 suggestions de réponse pour les avis négatifs.
          </p>
        </div>

        {/* Compensation */}
        <div style={{ border: "1px solid #DADCE0", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 16px", background: "#F8F9FA",
          }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#202124" }}>Geste commercial automatique</div>
              <div style={{ fontSize: "12px", color: "#5F6368", marginTop: "2px" }}>
                Inclut une offre dans les réponses aux avis négatifs. +45% de reconversion.
              </div>
            </div>
            <Toggle value={local.compensationEnabled} onChange={v => update("compensationEnabled", v)} color={G.green} />
          </div>

          {local.compensationEnabled && (
            <div style={{ padding: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#202124", marginBottom: "6px" }}>
                Votre geste commercial
              </label>
              <textarea
                value={local.compensationText}
                onChange={e => update("compensationText", e.target.value)}
                placeholder="Ex: Un café offert lors de votre prochain passage"
                rows={2}
                style={{
                  width: "100%", padding: "10px 14px",
                  border: "1px solid #DADCE0", borderRadius: "8px",
                  fontSize: "13px", color: "#202124",
                  fontFamily: "inherit", resize: "vertical",
                  boxSizing: "border-box", outline: "none",
                }}
                onFocus={e => { e.target.style.borderColor = G.blue; }}
                onBlur={e => { e.target.style.borderColor = "#DADCE0"; }}
              />
              <div style={{ marginTop: "10px" }}>
                <p style={{ margin: "0 0 6px", fontSize: "11px", color: "#80868B" }}>Suggestions pour votre secteur :</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {examples.map(ex => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => update("compensationText", ex)}
                      style={{
                        padding: "4px 10px", background: "#F8F9FA",
                        border: "1px solid #DADCE0", borderRadius: "16px",
                        fontSize: "11px", color: "#5F6368",
                        cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [businesses, setBusinesses] = useState<BusinessSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then((data: { businesses?: BusinessSettings[]; error?: string }) => {
        if (data.businesses) setBusinesses(data.businesses);
        else setGlobalError(data.error || "Erreur chargement");
      })
      .catch(() => setGlobalError("Erreur réseau"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(id: number, fields: Partial<BusinessSettings>) {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId: id, ...fields }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { error?: string };
      throw new Error(data.error || `Erreur ${res.status}`);
    }
    const saved = await res.json() as { business?: BusinessSettings };
    if (saved.business) {
      setBusinesses(bs => bs.map(b => b.id === id ? { ...b, ...saved.business } : b));
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: 700, color: "#202124", letterSpacing: "-0.5px" }}>
          Paramètres
        </h1>
        <p style={{ margin: 0, color: "#5F6368", fontSize: "14px" }}>
          Configuration du bot de réponse par établissement
        </p>
      </div>

      {loading && (
        <div style={{ padding: "48px 24px", textAlign: "center", background: "#fff", borderRadius: "12px", border: "1px solid #DADCE0" }}>
          <p style={{ margin: 0, color: "#5F6368", fontSize: "14px" }}>Chargement...</p>
        </div>
      )}

      {globalError && (
        <div style={{ padding: "14px 18px", background: "#FCE8E6", borderRadius: "10px", color: G.red, fontSize: "14px" }}>
          ⚠ {globalError}
        </div>
      )}

      {!loading && businesses.length === 0 && !globalError && (
        <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", padding: "56px 24px", textAlign: "center", boxShadow: SHADOW }}>
          <p style={{ margin: "0 0 10px", fontSize: "40px" }}>⚙️</p>
          <p style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 600, color: "#202124" }}>
            Aucun établissement à configurer
          </p>
          <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#5F6368" }}>
            Ajoutez d&apos;abord un établissement dans la section Établissements.
          </p>
          <a href="/businesses" style={{ padding: "10px 20px", background: G.blue, color: "#fff", textDecoration: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600 }}>
            Ajouter un établissement →
          </a>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {businesses.map(biz => (
          <BusinessCard key={biz.id} biz={biz} onSave={handleSave} />
        ))}
      </div>

      {/* Info box */}
      {businesses.length > 0 && (
        <div style={{ marginTop: "20px", padding: "14px 18px", background: "#E8F0FE", borderRadius: "10px", display: "flex", gap: "10px" }}>
          <span style={{ fontSize: "16px" }}>💡</span>
          <div style={{ fontSize: "13px", color: "#1A73E8", lineHeight: 1.5 }}>
            <strong>ANTHROPIC_API_KEY requis</strong> pour générer les réponses IA. Sans cette clé, le bot ne peut pas répondre aux avis.
            Configurez-la dans les variables d&apos;environnement Vercel et dans <code style={{ background: "#D2E3FC", padding: "1px 4px", borderRadius: "4px", fontSize: "12px" }}>.env.local</code>.
          </div>
        </div>
      )}
    </div>
  );
}
