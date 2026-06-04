"use client";

import { useState } from "react";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };
const SHADOW = "0 1px 3px rgba(60,64,67,0.12), 0 1px 2px rgba(60,64,67,0.06)";

const BUSINESS_TYPES = [
  { value: "restaurant", label: "🍽️ Restaurant / Café" },
  { value: "salon", label: "💇 Salon coiffure / Beauté" },
  { value: "hotel", label: "🏨 Hôtel / Hébergement" },
  { value: "garage", label: "🔧 Garage / Artisan" },
  { value: "medical", label: "🏥 Médical / Paramédical" },
  { value: "commerce", label: "🛍️ Commerce / Boutique" },
  { value: "other", label: "📌 Autre" },
];

const COMPENSATION_EXAMPLES: Record<string, string[]> = {
  restaurant: ["Un café offert lors de votre prochain passage", "10% de réduction sur votre prochain repas", "Un dessert offert pour nous excuser"],
  salon: ["10% sur votre prochaine prestation", "Un soin offert lors de votre prochain rendez-vous", "Retouche gratuite sous 7 jours"],
  hotel: ["Surclassement à disponibilité lors de votre prochain séjour", "Petit-déjeuner offert pour votre prochaine réservation"],
  garage: ["10% sur votre prochaine révision", "Vérification gratuite des pneumatiques"],
  medical: ["Consultation de suivi offerte", "Priorité de rendez-vous"],
  commerce: ["15% sur votre prochain achat", "Livraison offerte sur votre prochaine commande"],
  other: ["Un geste commercial lors de votre prochaine visite", "10% de réduction exclusive"],
};

type Settings = {
  businessType: string;
  autoReply5Star: boolean;
  autoReplyNegative: boolean;
  negativeMode: "email" | "auto" | "manual";
  compensationEnabled: boolean;
  compensationText: string;
  compensationThreshold: number;
  fallbackHours: number;
  fallbackEnabled: boolean;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    businessType: "restaurant",
    autoReply5Star: true,
    autoReplyNegative: false,
    negativeMode: "email",
    compensationEnabled: false,
    compensationText: "",
    compensationThreshold: 2,
    fallbackHours: 48,
    fallbackEnabled: false,
  });
  const [saved, setSaved] = useState(false);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings(s => ({ ...s, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const examples = COMPENSATION_EXAMPLES[settings.businessType] || COMPENSATION_EXAMPLES.other;

  return (
    <div>
      <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: 700, color: "#202124" }}>Paramètres</h1>
          <p style={{ margin: 0, color: "#5F6368", fontSize: "14px" }}>Configuration de votre bot de réponse aux avis</p>
        </div>
        <button onClick={handleSave} style={{
          padding: "10px 24px", background: saved ? G.green : G.blue, color: "#fff", border: "none",
          borderRadius: "8px", fontWeight: 700, fontSize: "14px", cursor: "pointer", fontFamily: "inherit",
          transition: "background 0.2s",
        }}>
          {saved ? "✓ Enregistré" : "Enregistrer"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Business type */}
        <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", padding: "24px", boxShadow: SHADOW }}>
          <h2 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 700, color: "#202124" }}>Type d&apos;établissement</h2>
          <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#5F6368" }}>Permet à l&apos;IA d&apos;adapter le ton et les suggestions au contexte de votre activité.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {BUSINESS_TYPES.map(bt => (
              <button key={bt.value} onClick={() => update("businessType", bt.value)} style={{
                padding: "8px 16px", borderRadius: "8px", border: `2px solid ${settings.businessType === bt.value ? G.blue : "#DADCE0"}`,
                background: settings.businessType === bt.value ? "#E8F0FE" : "#fff",
                color: settings.businessType === bt.value ? G.blue : "#5F6368",
                fontWeight: 500, fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
              }}>
                {bt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Auto-reply 4-5★ */}
        <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", padding: "24px", boxShadow: SHADOW }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1, marginRight: "20px" }}>
              <h2 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: "#202124" }}>
                Réponse automatique aux avis 4-5 ★
              </h2>
              <p style={{ margin: 0, fontSize: "13px", color: "#5F6368" }}>
                L&apos;IA répond automatiquement en moins de 30 secondes. Réponse personnalisée avec le prénom du client.
              </p>
            </div>
            <Toggle value={settings.autoReply5Star} onChange={v => update("autoReply5Star", v)} color={G.green} />
          </div>
        </div>

        {/* Negative reviews */}
        <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", padding: "24px", boxShadow: SHADOW }}>
          <h2 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: "#202124" }}>Avis négatifs (1-3 ★)</h2>
          <p style={{ margin: "0 0 18px", fontSize: "13px", color: "#5F6368" }}>Comment souhaitez-vous gérer les avis négatifs ?</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
            {([
              { value: "email", label: "Email avec 3 suggestions", desc: "Vous recevez un email avec 3 réponses suggérées. 1 clic pour publier.", icon: "📧" },
              { value: "auto", label: "Réponse automatique IA", desc: "L'IA choisit et publie automatiquement la meilleure réponse. Zéro action de votre part.", icon: "🤖" },
              { value: "manual", label: "Je gère moi-même", desc: "Aucune notification. Vous répondez directement sur Google.", icon: "✍️" },
            ] as { value: Settings["negativeMode"]; label: string; desc: string; icon: string }[]).map(opt => (
              <button key={opt.value} onClick={() => update("negativeMode", opt.value)} style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "14px 16px", borderRadius: "10px",
                border: `2px solid ${settings.negativeMode === opt.value ? G.blue : "#DADCE0"}`,
                background: settings.negativeMode === opt.value ? "#E8F0FE" : "#fff",
                cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              }}>
                <span style={{ fontSize: "20px", flexShrink: 0 }}>{opt.icon}</span>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: settings.negativeMode === opt.value ? G.blue : "#202124" }}>{opt.label}</div>
                  <div style={{ fontSize: "12px", color: "#5F6368" }}>{opt.desc}</div>
                </div>
                <div style={{ marginLeft: "auto", width: "18px", height: "18px", borderRadius: "50%", border: `2px solid ${settings.negativeMode === opt.value ? G.blue : "#DADCE0"}`, background: settings.negativeMode === opt.value ? G.blue : "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {settings.negativeMode === opt.value && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fff" }} />}
                </div>
              </button>
            ))}
          </div>

          {/* Fallback auto */}
          {settings.negativeMode === "email" && (
            <div style={{ padding: "16px", background: "#F8F9FA", borderRadius: "10px", border: "1px solid #DADCE0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#202124" }}>Réponse automatique si non répondu</div>
                  <div style={{ fontSize: "12px", color: "#5F6368" }}>Si vous ne cliquez pas dans le délai, le bot publie automatiquement.</div>
                </div>
                <Toggle value={settings.fallbackEnabled} onChange={v => update("fallbackEnabled", v)} color={G.yellow} />
              </div>
              {settings.fallbackEnabled && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "13px", color: "#5F6368" }}>Délai avant publication auto :</span>
                  <select value={settings.fallbackHours} onChange={e => update("fallbackHours", parseInt(e.target.value))}
                    style={{ padding: "6px 10px", border: "1px solid #DADCE0", borderRadius: "6px", fontSize: "13px", color: "#202124", fontFamily: "inherit" }}>
                    {[12, 24, 48, 72].map(h => <option key={h} value={h}>{h}h</option>)}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Compensation */}
        <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", padding: "24px", boxShadow: SHADOW }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
            <div style={{ flex: 1, marginRight: "20px" }}>
              <h2 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: "#202124" }}>Geste commercial automatique</h2>
              <p style={{ margin: 0, fontSize: "13px", color: "#5F6368" }}>
                L&apos;IA propose un geste commercial dans la réponse aux avis négatifs. Augmente de 45% les chances de reconversion.
              </p>
            </div>
            <Toggle value={settings.compensationEnabled} onChange={v => update("compensationEnabled", v)} color={G.green} />
          </div>

          {settings.compensationEnabled && (
            <>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#202124", display: "block", marginBottom: "8px" }}>
                  Seuil d&apos;activation :
                </label>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {[1, 2, 3].map(n => (
                    <button key={n} onClick={() => update("compensationThreshold", n)} style={{
                      padding: "6px 16px", borderRadius: "6px",
                      border: `2px solid ${settings.compensationThreshold === n ? G.red : "#DADCE0"}`,
                      background: settings.compensationThreshold === n ? "#FCE8E6" : "#fff",
                      color: settings.compensationThreshold === n ? G.red : "#5F6368",
                      fontWeight: 600, fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
                    }}>
                      {"★".repeat(n)} et moins
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#202124", display: "block", marginBottom: "6px" }}>
                  Votre geste commercial :
                </label>
                <textarea
                  value={settings.compensationText}
                  onChange={e => update("compensationText", e.target.value)}
                  placeholder="Décrivez ce que vous offrez..."
                  rows={2}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #DADCE0", borderRadius: "8px", fontSize: "13px", color: "#202124", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", outline: "none" }}
                  onFocus={e => { e.target.style.borderColor = G.blue; }}
                  onBlur={e => { e.target.style.borderColor = "#DADCE0"; }}
                />
                <div style={{ marginTop: "8px" }}>
                  <div style={{ fontSize: "12px", color: "#80868B", marginBottom: "6px" }}>Exemples pour votre secteur :</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {examples.map(ex => (
                      <button key={ex} onClick={() => update("compensationText", ex)} style={{
                        padding: "4px 10px", background: "#F8F9FA", border: "1px solid #DADCE0",
                        borderRadius: "16px", fontSize: "11px", color: "#5F6368", cursor: "pointer", fontFamily: "inherit",
                      }}>
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Save */}
        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "8px" }}>
          <button onClick={handleSave} style={{
            padding: "12px 32px", background: saved ? G.green : G.blue, color: "#fff", border: "none",
            borderRadius: "10px", fontWeight: 700, fontSize: "15px", cursor: "pointer", fontFamily: "inherit",
            boxShadow: `0 4px 12px ${saved ? G.green : G.blue}40`, transition: "all 0.2s",
          }}>
            {saved ? "✓ Paramètres enregistrés" : "Enregistrer les paramètres"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ value, onChange, color }: { value: boolean; onChange: (v: boolean) => void; color: string }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: "48px", height: "26px", borderRadius: "13px",
      background: value ? color : "#DADCE0",
      border: "none", cursor: "pointer", position: "relative",
      flexShrink: 0, transition: "background 0.2s",
    }}>
      <div style={{
        width: "20px", height: "20px", borderRadius: "50%", background: "#fff",
        position: "absolute", top: "3px", left: value ? "25px" : "3px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        transition: "left 0.2s",
      }} />
    </button>
  );
}
