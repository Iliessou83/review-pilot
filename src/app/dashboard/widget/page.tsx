"use client";

import { useEffect, useState } from "react";

const G = { blue: "#2457C5", green: "#16856B", red: "#D6455D" };

type Business = {
  id: number;
  name: string;
  widgetPublicToken: string | null;
  widgetEnabled: boolean;
  widgetAllowedOrigins: string[];
};

export default function WidgetPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [available, setAvailable] = useState(false);
  const [origin, setOrigin] = useState("");
  const [domains, setDomains] = useState<Record<number, string>>( {} );
  const [busy, setBusy] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

  async function load() {
    const [businessResponse, settingsResponse] = await Promise.all([
      fetch("/api/businesses"),
      fetch("/api/settings"),
    ]);
    const businessData = businessResponse.ok ? await businessResponse.json() : [];
    const settingsData = settingsResponse.ok ? await settingsResponse.json() : {};
    const rows = Array.isArray(businessData) ? businessData as Business[] : [];
    setBusinesses(rows);
    setAvailable(Boolean(settingsData.externalReviewWidgetAvailable));
    setDomains(Object.fromEntries(rows.map((b) => [b.id, (b.widgetAllowedOrigins || []).join("\n")])));
  }

  useEffect(() => {
    setOrigin(window.location.origin);
    load().catch(() => setNotice("Impossible de charger la configuration du widget."));
  }, []);

  async function save(business: Business, enable: boolean) {
    setBusy(business.id);
    setNotice("");
    const allowedOrigins = (domains[business.id] || "")
      .split(/[,\n]/)
      .map((v) => v.trim())
      .filter(Boolean);
    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId: business.id, widgetEnabled: enable, widgetAllowedOrigins: allowedOrigins }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setNotice(data.error || "Enregistrement impossible.");
    else {
      setNotice(enable ? "Widget activé pour les domaines indiqués." : "Widget désactivé.");
      await load();
    }
    setBusy(null);
  }

  function embedCode(token: string) {
    return `<div data-caela-widget="${token}"></div>\n<script src="${origin}/widget.js" async></script>`;
  }

  function copy(business: Business) {
    if (!business.widgetPublicToken) return;
    navigator.clipboard.writeText(embedCode(business.widgetPublicToken)).then(() => {
      setCopied(business.id);
      setTimeout(() => setCopied(null), 1800);
    });
  }

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "#202124", margin: "0 0 6px" }}>Widget d&apos;avis</h1>
      <p style={{ fontSize: 15, color: "#5F6368", margin: "0 0 18px", lineHeight: 1.6, maxWidth: 700 }}>
        Le widget visible et le balisage SEO sont deux choses différentes. Caela ne génère plus de bloc AggregateRating et ne promet pas d&apos;étoiles dans les résultats de recherche.
      </p>

      {!available && (
        <div style={{ background: "#FFF7E6", border: "1px solid #E0A11A", borderRadius: 12, padding: "16px 18px", color: "#6F5200", fontSize: 13, lineHeight: 1.6, marginBottom: 22 }}>
          <strong>Activation suspendue :</strong> le widget de contenus Google/Trustpilot restera coupé jusqu&apos;à la confirmation des licences et règles d&apos;affichage. La sécurité technique est prête, mais elle ne remplace pas l&apos;autorisation contractuelle.
        </div>
      )}

      {notice && (
        <div style={{ background: notice.includes("impossible") || notice.includes("Ajoutez") ? "#FCE8E6" : "#E6F4EA", borderRadius: 10, padding: "12px 15px", color: notice.includes("impossible") ? G.red : G.green, fontSize: 13, marginBottom: 18 }}>
          {notice}
        </div>
      )}

      {businesses.map((business) => (
        <section key={business.id} style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: 16, padding: "24px 26px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <h2 style={{ fontSize: 18, margin: "0 0 4px" }}>{business.name}</h2>
              <span style={{ fontSize: 12, color: business.widgetEnabled ? G.green : "#80868B" }}>
                {business.widgetEnabled ? "● Actif" : "● Désactivé"}
              </span>
            </div>
            <button
              disabled={!available || busy === business.id}
              onClick={() => save(business, !business.widgetEnabled)}
              style={{ border: 0, borderRadius: 8, padding: "10px 16px", background: business.widgetEnabled ? "#FCE8E6" : G.blue, color: business.widgetEnabled ? G.red : "#fff", fontWeight: 700, cursor: available ? "pointer" : "not-allowed", opacity: available ? 1 : .5 }}
            >
              {business.widgetEnabled ? "Désactiver" : "Activer"}
            </button>
          </div>

          <label style={{ display: "block", marginTop: 20, fontSize: 12, fontWeight: 700, color: "#5F6368" }}>
            Domaines autorisés — un par ligne
          </label>
          <textarea
            value={domains[business.id] || ""}
            onChange={(event) => setDomains((current) => ({ ...current, [business.id]: event.target.value }))}
            placeholder={"https://monsite.fr\nhttps://www.monsite.fr"}
            rows={3}
            disabled={!available}
            style={{ boxSizing: "border-box", width: "100%", marginTop: 7, padding: "11px 12px", border: "1px solid #DADCE0", borderRadius: 8, fontFamily: "inherit", resize: "vertical" }}
          />

          {business.widgetPublicToken && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, marginBottom: 7 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#5F6368" }}>Code d&apos;intégration protégé</span>
                <button disabled={!business.widgetEnabled} onClick={() => copy(business)} style={{ padding: "7px 12px", border: "1px solid #DADCE0", borderRadius: 7, background: "#fff", cursor: business.widgetEnabled ? "pointer" : "not-allowed", opacity: business.widgetEnabled ? 1 : .5 }}>
                  {copied === business.id ? "✓ Copié" : "Copier"}
                </button>
              </div>
              <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", background: "#111827", color: "#E5E7EB", borderRadius: 9, padding: 13, fontSize: 12 }}>{embedCode(business.widgetPublicToken)}</pre>
            </>
          )}

          <p style={{ margin: "12px 0 0", color: "#80868B", fontSize: 12, lineHeight: 1.5 }}>
            L&apos;identifiant aléatoire empêche l&apos;énumération des clients. Le domaine autorisé et la limite de requêtes réduisent aussi la copie abusive du flux.
          </p>
        </section>
      ))}
    </div>
  );
}
