"use client";

import { useState } from "react";
import ChatBot from "@/components/ChatBot";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };
const SHADOW_SM = "0 1px 3px rgba(60,64,67,0.12), 0 1px 2px rgba(60,64,67,0.06)";
const SHADOW_MD = "0 2px 6px rgba(60,64,67,0.15), 0 1px 4px rgba(60,64,67,0.1)";
const SHADOW_LG = "0 4px 12px rgba(60,64,67,0.18), 0 2px 6px rgba(60,64,67,0.1)";

function GDots({ size = 8 }: { size?: number }) {
  return (
    <div style={{ display: "flex", gap: `${Math.round(size * 0.4)}px`, alignItems: "center" }}>
      {[G.blue, G.red, G.yellow, G.green].map((c, i) => (
        <div key={i} style={{ width: size, height: size, borderRadius: "50%", background: c }} />
      ))}
    </div>
  );
}

function Stars({ n = 5 }: { n?: number }) {
  return <span>{[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= n ? G.yellow : "#DADCE0", fontSize: "14px" }}>★</span>)}</span>;
}

// Plaque NFC visual mockup
function PlaqueMockup({ type }: { type: "acrylic" | "epoxy" | "pvc" }) {
  const configs = {
    acrylic: { bg: "#0A0A0F", text: "#fff", border: "2px solid rgba(255,255,255,0.12)", label: "Acrylique", subtitle: "Premium" },
    epoxy: { bg: "#fff", text: "#202124", border: "2px solid #DADCE0", label: "Époxy", subtitle: "Haute résistance" },
    pvc: { bg: "#F8F9FA", text: "#202124", border: "2px solid #DADCE0", label: "PVC", subtitle: "Sticker vitrine" },
  };
  const c = configs[type];
  return (
    <div style={{
      width: "130px", height: "130px", borderRadius: type === "pvc" ? "12px" : "50%",
      background: c.bg, border: c.border, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: "6px",
      boxShadow: type === "acrylic" ? "0 8px 32px rgba(0,0,0,0.3)" : SHADOW_MD,
      position: "relative", overflow: "hidden",
      flexShrink: 0,
    }}>
      {/* Grid lines on acrylic */}
      {type === "acrylic" && (
        <>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 50% 50%, rgba(26,115,232,0.15) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
        </>
      )}
      <div style={{ fontSize: "22px", position: "relative", zIndex: 1 }}>
        <span style={{ fontWeight: 700, letterSpacing: "-1px" }}>
          <span style={{ color: G.blue }}>G</span>
          <span style={{ color: G.red }}>o</span>
          <span style={{ color: G.yellow }}>o</span>
          <span style={{ color: G.blue }}>g</span>
          <span style={{ color: G.green }}>l</span>
          <span style={{ color: G.red }}>e</span>
        </span>
      </div>
      <div style={{ fontSize: "9px", color: c.text, opacity: 0.7, textAlign: "center", lineHeight: 1.4, position: "relative", zIndex: 1, padding: "0 10px" }}>
        Posez votre téléphone
      </div>
      {/* NFC wave icon */}
      <div style={{ display: "flex", gap: "2px", alignItems: "center", position: "relative", zIndex: 1 }}>
        {[6,10,14].map((s, i) => (
          <div key={i} style={{ width: s, height: s, borderRadius: "50%", border: `1.5px solid ${G.blue}`, opacity: 0.6 + i * 0.2 }} />
        ))}
      </div>
      {/* QR code placeholder */}
      <div style={{ width: "28px", height: "28px", background: c.text === "#fff" ? "rgba(255,255,255,0.1)" : "#0A0A0F", borderRadius: "4px", display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "1px", padding: "3px", position: "relative", zIndex: 1 }}>
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} style={{ background: [0,1,5,6,10,4,9,14,20,21,24,23,18,19,12].includes(i) ? (c.text === "#fff" ? "rgba(255,255,255,0.8)" : "#202124") : "transparent", borderRadius: "1px" }} />
        ))}
      </div>
    </div>
  );
}

const PACKS = [
  {
    id: "solo",
    name: "Solo",
    desc: "1 plaque NFC acrylique",
    price: 19,
    features: ["Plaque acrylique ronde 9cm", "Puce NTAG213 programmée", "Lien Google Avis de votre fiche", "Livraison Colissimo 48h"],
    color: G.blue,
    bg: "#E8F0FE",
    popular: false,
  },
  {
    id: "etablissement",
    name: "Établissement",
    desc: "5 plaques — idéal restaurant/salon",
    price: 79,
    priceUnit: 15.80,
    features: ["5 plaques acryliques rondes 9cm", "Puce NTAG213 programmée ×5", "1 lien différent possible par plaque", "Livraison Colissimo 48h", "Support prioritaire"],
    color: G.green,
    bg: "#E6F4EA",
    popular: true,
  },
  {
    id: "reseau",
    name: "Réseau",
    desc: "25 plaques — agences & franchises",
    price: 299,
    priceUnit: 11.96,
    features: ["25 plaques acryliques", "25 liens Google configurés", "Emballage individuel par établissement", "Livraison express suivie", "Account manager dédié"],
    color: G.red,
    bg: "#FCE8E6",
    popular: false,
  },
];

const HOW = [
  { icon: "📦", step: "1", title: "Tu commandes", desc: "Choisis ton pack et indique le nom + adresse de chaque établissement." },
  { icon: "🔗", step: "2", title: "On programme", desc: "On récupère ton lien Google Avis officiel et on programme chaque puce NFC sous 24h." },
  { icon: "🚚", step: "3", title: "Tu reçois", desc: "Colissimo 48h. La plaque arrive prête à poser : pas d'appli, pas de config." },
  { icon: "📱", step: "4", title: "Tes clients tapent", desc: "Un client pose son téléphone. Google Avis s'ouvre en moins de 2 secondes. Fini." },
];

const FAQ = [
  { q: "Ça marche avec quel téléphone ?", r: "Tous les iPhones depuis le 7 (iOS 14+) et tous les Android depuis 2014. Aucune appli à installer." },
  { q: "Si je change de fiche Google, que se passe-t-il ?", r: "On reprogramme la plaque gratuitement. Envoyez un email à contact@caela.fr avec votre nouveau lien." },
  { q: "Puis-je mettre mon logo sur la plaque ?", r: "Oui, pour les commandes de 5 plaques minimum. Envoyez votre fichier AI ou PNG haute résolution, impression UV incluse. +5€/plaque." },
  { q: "Quelle est la durée de vie d'une plaque ?", r: "La puce NFC est garantie 10 ans minimum. L'acrylique résiste à l'eau, aux chocs et aux UV. Durée réelle : illimitée." },
  { q: "Peut-on l'utiliser pour Facebook ou Instagram aussi ?", r: "Oui. Précise la plateforme lors de la commande (Google / Facebook / Instagram). Même prix." },
];

type FormState = {
  name: string;
  email: string;
  phone: string;
  pack: string;
  etablissement: string;
  message: string;
};

export default function PlaquesNFCPage() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", phone: "", pack: "etablissement", etablissement: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeType, setActiveType] = useState<"acrylic" | "epoxy" | "pvc">("acrylic");

  const TYPES = [
    {
      id: "acrylic" as const,
      label: "Acrylique",
      badge: "Notre choix",
      badgeColor: G.blue,
      pros: ["Rigide 3-5mm", "Finition premium", "Impression UV vive", "Résiste 5 ans+"],
      cons: ["Plus épais"],
      best: "Plaque posée sur comptoir",
    },
    {
      id: "epoxy" as const,
      label: "Époxy",
      badge: "Luxe",
      badgeColor: G.green,
      pros: ["Couche résine bombée", "100% anti-eau", "Toucher ultra haut de gamme", "Ne s'efface jamais"],
      cons: ["Format carte (+3€)"],
      best: "Badge ou carte individuelle",
    },
    {
      id: "pvc" as const,
      label: "PVC / Sticker",
      badge: "Economique",
      badgeColor: G.yellow,
      pros: ["Format carte bancaire", "Ultra fin 0.76mm", "Idéal autocollant vitrine", "Prix le plus bas"],
      cons: ["Peut jaunir aux UV", "Moins premium"],
      best: "Sticker vitrine / distribution",
    },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.etablissement) return;
    setSending(true);
    // Simulate send — in production, wire to /api/nfc-order
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
  }

  return (
    <div style={{ fontFamily: "'Google Sans', system-ui, sans-serif", background: "#fff", color: "#202124", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{ borderBottom: "1px solid #DADCE0", background: "#fff", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ display: "flex", gap: "3px" }}>
              {[G.blue, G.red, G.yellow, G.green].map((c, i) => <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: c }} />)}
            </div>
            <span style={{ fontWeight: 700, fontSize: "15px", color: "#202124" }}>Caela Réputation</span>
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <a href="/" style={{ fontSize: "13px", color: "#5F6368", textDecoration: "none" }}>← Retour au site</a>
            <a href="#commander" style={{ padding: "8px 20px", background: G.blue, color: "#fff", borderRadius: "8px", textDecoration: "none", fontSize: "13px", fontWeight: 600, boxShadow: SHADOW_SM }}>
              Commander
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(160deg, #fff 0%, #F8F9FA 60%, #E8F0FE 100%)", padding: "80px 24px 64px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", gap: "64px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 420px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px", background: "#E8F0FE", borderRadius: "24px", fontSize: "12px", fontWeight: 600, color: G.blue, marginBottom: "20px" }}>
              <span>📱</span> Technologie NFC
            </div>
            <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, lineHeight: 1.15, color: "#202124", margin: "0 0 20px" }}>
              Vos clients laissent un avis{" "}
              <span style={{ color: G.blue }}>en 20 secondes</span>
            </h1>
            <p style={{ fontSize: "17px", color: "#5F6368", lineHeight: 1.7, margin: "0 0 32px", maxWidth: "480px" }}>
              Posez la plaque sur votre comptoir. Un téléphone au-dessus. Google Avis s&apos;ouvre. Pas d&apos;appli, pas de QR code à scanner, pas de friction.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a href="#commander" style={{ padding: "14px 28px", background: G.blue, color: "#fff", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "15px", boxShadow: `0 4px 16px ${G.blue}40` }}>
                Commander une plaque
              </a>
              <a href="#comment-ca-marche" style={{ padding: "14px 28px", background: "#fff", color: "#202124", borderRadius: "10px", textDecoration: "none", fontWeight: 600, fontSize: "15px", border: "1px solid #DADCE0" }}>
                Voir comment ça marche
              </a>
            </div>
            <div style={{ display: "flex", gap: "24px", marginTop: "28px" }}>
              {[{ n: "500+", l: "plaques livrées" }, { n: "48h", l: "délai livraison" }, { n: "10 ans", l: "garantie puce" }].map(s => (
                <div key={s.l}>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#202124" }}>{s.n}</div>
                  <div style={{ fontSize: "12px", color: "#80868B" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div style={{ flex: "1 1 300px", display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative" }}>
              {/* Glow */}
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "220px", height: "220px", background: `radial-gradient(circle, ${G.blue}20 0%, transparent 70%)`, borderRadius: "50%" }} />
              {/* Main plate */}
              <div style={{
                width: "180px", height: "180px", borderRadius: "50%",
                background: "#0A0A0F", border: "2px solid rgba(255,255,255,0.1)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: "8px", boxShadow: "0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)",
                position: "relative", zIndex: 2, overflow: "hidden",
              }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
                <div style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-1px", position: "relative", zIndex: 1 }}>
                  <span style={{ color: G.blue }}>G</span><span style={{ color: G.red }}>o</span><span style={{ color: G.yellow }}>o</span><span style={{ color: G.blue }}>g</span><span style={{ color: G.green }}>l</span><span style={{ color: G.red }}>e</span>
                </div>
                <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)", textAlign: "center", lineHeight: 1.5, position: "relative", zIndex: 1 }}>
                  Posez votre<br />téléphone ici
                </div>
                <div style={{ display: "flex", gap: "3px", position: "relative", zIndex: 1 }}>
                  {[8,12,16].map((s, i) => (
                    <div key={i} style={{ width: s, height: s, borderRadius: "50%", border: `1.5px solid ${G.blue}`, opacity: 0.5 + i * 0.25 }} />
                  ))}
                </div>
              </div>
              {/* Phone tap indicator */}
              <div style={{
                position: "absolute", top: "-30px", right: "-20px",
                background: "#fff", borderRadius: "12px", padding: "8px 12px",
                boxShadow: SHADOW_LG, border: "1px solid #DADCE0",
                fontSize: "11px", color: "#202124", fontWeight: 600, zIndex: 3,
                whiteSpace: "nowrap",
              }}>
                📱 Posez → Google s&apos;ouvre
              </div>
              {/* Star bubble */}
              <div style={{
                position: "absolute", bottom: "-20px", left: "-30px",
                background: "#fff", borderRadius: "12px", padding: "8px 12px",
                boxShadow: SHADOW_LG, border: "1px solid #DADCE0", zIndex: 3,
              }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#202124" }}>Nouvel avis !</div>
                <Stars n={5} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <div style={{ borderBottom: "1px solid #DADCE0", borderTop: "1px solid #DADCE0", padding: "14px 24px", background: "#F8F9FA" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "clamp(16px, 3vw, 48px)", flexWrap: "wrap" }}>
          {["✅ Compatible iOS & Android", "⚡ Livraison 48h France", "🔒 Puce verrouillée à vie", "🎨 Impression UV premium", "📞 Support français"].map(t => (
            <span key={t} style={{ fontSize: "12px", color: "#5F6368", fontWeight: 500, whiteSpace: "nowrap" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section id="comment-ca-marche" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <div style={{ display: "inline-block", padding: "4px 14px", background: "#E8F0FE", borderRadius: "24px", fontSize: "12px", fontWeight: 600, color: G.blue, marginBottom: "14px" }}>
              COMMENT ÇA MARCHE
            </div>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 800, margin: 0, color: "#202124" }}>
              De la commande à l&apos;avis Google — 4 étapes
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
            {HOW.map((step, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "16px", padding: "28px 24px", boxShadow: SHADOW_SM, position: "relative" }}>
                <div style={{ width: "40px", height: "40px", background: G.blue, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 800, color: "#fff", marginBottom: "16px" }}>
                  {step.step}
                </div>
                <div style={{ fontSize: "24px", marginBottom: "10px" }}>{step.icon}</div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 8px", color: "#202124" }}>{step.title}</h3>
                <p style={{ fontSize: "13px", color: "#5F6368", margin: 0, lineHeight: 1.6 }}>{step.desc}</p>
                {i < HOW.length - 1 && (
                  <div style={{ position: "absolute", right: "-12px", top: "50%", transform: "translateY(-50%)", fontSize: "18px", color: "#DADCE0", display: "none" }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MATERIAL COMPARISON */}
      <section style={{ padding: "80px 24px", background: "#F8F9FA" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ display: "inline-block", padding: "4px 14px", background: "#E6F4EA", borderRadius: "24px", fontSize: "12px", fontWeight: 600, color: G.green, marginBottom: "14px" }}>
              MATÉRIAUX
            </div>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 800, margin: 0, color: "#202124" }}>
              Acryique, Époxy ou PVC ?
            </h2>
            <p style={{ fontSize: "15px", color: "#5F6368", marginTop: "12px" }}>On utilise uniquement l&apos;acrylique pour nos plaques. Voici pourquoi.</p>
          </div>

          {/* Tab switcher */}
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "40px", flexWrap: "wrap" }}>
            {TYPES.map(t => (
              <button key={t.id} onClick={() => setActiveType(t.id)} style={{
                padding: "10px 24px", borderRadius: "24px", border: `2px solid ${activeType === t.id ? G.blue : "#DADCE0"}`,
                background: activeType === t.id ? "#E8F0FE" : "#fff",
                color: activeType === t.id ? G.blue : "#5F6368",
                fontWeight: 600, fontSize: "14px", cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s",
              }}>
                {t.label}
                {t.badge && <span style={{ marginLeft: "6px", padding: "2px 8px", background: t.badgeColor, color: "#fff", borderRadius: "12px", fontSize: "10px" }}>{t.badge}</span>}
              </button>
            ))}
          </div>

          {TYPES.filter(t => t.id === activeType).map(t => (
            <div key={t.id} style={{ display: "flex", gap: "48px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
              <PlaqueMockup type={t.id} />
              <div style={{ flex: "1 1 300px", maxWidth: "500px" }}>
                <h3 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 6px", color: "#202124" }}>{t.label}</h3>
                <p style={{ fontSize: "13px", color: "#80868B", margin: "0 0 20px" }}>Idéal pour : <strong>{t.best}</strong></p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                  {t.pros.map((p, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#202124" }}>
                      <div style={{ width: "20px", height: "20px", background: "#E6F4EA", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: G.green, fontSize: "11px", fontWeight: 700 }}>✓</span>
                      </div>
                      {p}
                    </div>
                  ))}
                  {t.cons.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#80868B" }}>
                      <div style={{ width: "20px", height: "20px", background: "#F8F9FA", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #DADCE0" }}>
                        <span style={{ fontSize: "11px" }}>−</span>
                      </div>
                      {c}
                    </div>
                  ))}
                </div>
                {t.id === "acrylic" && (
                  <div style={{ padding: "12px 16px", background: "#E8F0FE", borderRadius: "10px", fontSize: "13px", color: G.blue, fontWeight: 600 }}>
                    ✅ C&apos;est ce qu&apos;on utilise pour toutes nos plaques Caela Réputation.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PACKS */}
      <section id="packs" style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ display: "inline-block", padding: "4px 14px", background: "#FCE8E6", borderRadius: "24px", fontSize: "12px", fontWeight: 600, color: G.red, marginBottom: "14px" }}>
              TARIFS
            </div>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 800, margin: 0, color: "#202124" }}>
              Choisissez votre pack
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {PACKS.map(pack => (
              <div key={pack.id} style={{
                background: "#fff", borderRadius: "20px",
                border: pack.popular ? `2px solid ${G.green}` : "1px solid #DADCE0",
                padding: "32px 28px", boxShadow: pack.popular ? `0 8px 32px ${G.green}20` : SHADOW_SM,
                position: "relative",
              }}>
                {pack.popular && (
                  <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", background: G.green, color: "#fff", padding: "4px 16px", borderRadius: "24px", fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap" }}>
                    ⭐ LE PLUS POPULAIRE
                  </div>
                )}
                <div style={{ width: "44px", height: "44px", background: pack.bg, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <span style={{ fontSize: "20px" }}>📦</span>
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: 800, margin: "0 0 4px", color: "#202124" }}>{pack.name}</h3>
                <p style={{ fontSize: "13px", color: "#5F6368", margin: "0 0 20px" }}>{pack.desc}</p>
                <div style={{ marginBottom: "24px" }}>
                  <span style={{ fontSize: "36px", fontWeight: 800, color: "#202124" }}>{pack.price}€</span>
                  {pack.priceUnit && <span style={{ fontSize: "13px", color: "#80868B", marginLeft: "8px" }}>soit {pack.priceUnit.toFixed(2)}€/plaque</span>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                  {pack.features.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#202124" }}>
                      <span style={{ color: pack.color, flexShrink: 0 }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
                <a
                  href="#commander"
                  onClick={() => setForm(f => ({ ...f, pack: pack.id }))}
                  style={{
                    display: "block", textAlign: "center",
                    padding: "12px 20px", borderRadius: "10px",
                    background: pack.popular ? G.green : pack.color,
                    color: "#fff", textDecoration: "none",
                    fontWeight: 700, fontSize: "14px",
                    boxShadow: `0 4px 12px ${pack.color}40`,
                  }}
                >
                  Commander ce pack →
                </a>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", fontSize: "12px", color: "#80868B", marginTop: "24px" }}>
            Logo personnalisé disponible sur commande de 5+ plaques (+5€/plaque). Contactez-nous après commande.
          </p>
        </div>
      </section>

      {/* BUNDLE WITH REVIEWPILOT */}
      <section style={{ padding: "64px 24px", background: "linear-gradient(135deg, #E8F0FE 0%, #E6F4EA 100%)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <GDots size={10} />
          <h2 style={{ fontSize: "clamp(20px, 3vw, 32px)", fontWeight: 800, margin: "20px 0 16px", color: "#202124" }}>
            Encore plus fort avec Caela Réputation
          </h2>
          <p style={{ fontSize: "16px", color: "#5F6368", lineHeight: 1.7, margin: "0 0 32px" }}>
            La plaque NFC amène le client sur Google. Caela Réputation répond automatiquement en 30 secondes aux bons avis, et vous notifie avec 3 suggestions de réponse pour les avis négatifs.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginBottom: "24px" }}>
            <div style={{ background: "#fff", borderRadius: "12px", padding: "16px 24px", border: "1px solid #DADCE0", boxShadow: SHADOW_SM, fontSize: "14px", color: "#202124" }}>
              📱 Plaque NFC → avis reçu
            </div>
            <div style={{ fontSize: "20px", display: "flex", alignItems: "center", color: "#DADCE0" }}>→</div>
            <div style={{ background: "#fff", borderRadius: "12px", padding: "16px 24px", border: "1px solid #DADCE0", boxShadow: SHADOW_SM, fontSize: "14px", color: "#202124" }}>
              ⭐⭐⭐⭐⭐ Caela Réputation répond en 30 sec
            </div>
          </div>
          <a href="/" style={{ display: "inline-block", padding: "14px 32px", background: G.blue, color: "#fff", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "15px", boxShadow: `0 4px 16px ${G.blue}40` }}>
            Voir les offres Caela Réputation →
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 800, margin: 0, color: "#202124" }}>Questions fréquentes</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {FAQ.map((item, i) => (
              <div key={i} style={{ border: "1px solid #DADCE0", borderRadius: "12px", overflow: "hidden", background: "#fff" }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: "100%", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit" }}
                >
                  <span style={{ fontSize: "15px", fontWeight: 600, color: "#202124" }}>{item.q}</span>
                  <span style={{ color: G.blue, fontSize: "18px", fontWeight: 300, transform: openFaq === i ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0, marginLeft: "16px" }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 20px 18px", fontSize: "14px", color: "#5F6368", lineHeight: 1.7 }}>{item.r}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ORDER FORM */}
      <section id="commander" style={{ padding: "80px 24px", background: "#F8F9FA" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{ display: "inline-block", padding: "4px 14px", background: "#E8F0FE", borderRadius: "24px", fontSize: "12px", fontWeight: 600, color: G.blue, marginBottom: "14px" }}>
              COMMANDER
            </div>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 36px)", fontWeight: 800, margin: "0 0 12px", color: "#202124" }}>
              Votre commande
            </h2>
            <p style={{ fontSize: "15px", color: "#5F6368", margin: 0 }}>
              On vous contacte dans les 4h pour confirmer et vous envoyer le lien de paiement.
            </p>
          </div>

          {sent ? (
            <div style={{ background: "#fff", borderRadius: "20px", padding: "48px 32px", textAlign: "center", border: "1px solid #34A853", boxShadow: `0 4px 24px ${G.green}20` }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
              <h3 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 12px", color: "#202124" }}>Commande reçue !</h3>
              <p style={{ fontSize: "15px", color: "#5F6368", margin: "0 0 24px", lineHeight: 1.6 }}>
                On revient vers vous sous 4h à <strong>{form.email}</strong> avec la confirmation et le lien de paiement sécurisé.
              </p>
              <a href="/" style={{ display: "inline-block", padding: "12px 28px", background: G.blue, color: "#fff", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "14px" }}>
                Retour à l&apos;accueil
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: "20px", padding: "40px 36px", border: "1px solid #DADCE0", boxShadow: SHADOW_MD, display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* Pack selector */}
              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#202124", display: "block", marginBottom: "10px" }}>Pack choisi *</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {PACKS.map(p => (
                    <button key={p.id} type="button" onClick={() => setForm(f => ({ ...f, pack: p.id }))}
                      style={{
                        padding: "8px 16px", borderRadius: "8px",
                        border: `2px solid ${form.pack === p.id ? p.color : "#DADCE0"}`,
                        background: form.pack === p.id ? p.bg : "#fff",
                        color: form.pack === p.id ? p.color : "#5F6368",
                        fontWeight: 600, fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
                        transition: "all 0.15s",
                      }}>
                      {p.name} — {p.price}€
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#202124", display: "block", marginBottom: "6px" }}>Nom complet *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                    placeholder="Jean Dupont"
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #DADCE0", borderRadius: "8px", fontSize: "14px", color: "#202124", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    onFocus={e => { e.target.style.borderColor = G.blue; }}
                    onBlur={e => { e.target.style.borderColor = "#DADCE0"; }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#202124", display: "block", marginBottom: "6px" }}>Téléphone</label>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="06 XX XX XX XX"
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #DADCE0", borderRadius: "8px", fontSize: "14px", color: "#202124", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    onFocus={e => { e.target.style.borderColor = G.blue; }}
                    onBlur={e => { e.target.style.borderColor = "#DADCE0"; }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#202124", display: "block", marginBottom: "6px" }}>Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required
                  placeholder="vous@exemple.fr"
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #DADCE0", borderRadius: "8px", fontSize: "14px", color: "#202124", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                  onFocus={e => { e.target.style.borderColor = G.blue; }}
                  onBlur={e => { e.target.style.borderColor = "#DADCE0"; }}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#202124", display: "block", marginBottom: "6px" }}>Nom de votre établissement *</label>
                <input value={form.etablissement} onChange={e => setForm(f => ({ ...f, etablissement: e.target.value }))} required
                  placeholder="Restaurant Le Cèdre, Salon Beauté Paris..."
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #DADCE0", borderRadius: "8px", fontSize: "14px", color: "#202124", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                  onFocus={e => { e.target.style.borderColor = G.blue; }}
                  onBlur={e => { e.target.style.borderColor = "#DADCE0"; }}
                />
                <p style={{ fontSize: "11px", color: "#80868B", margin: "4px 0 0" }}>On utilise ce nom pour trouver votre fiche Google et programmer la puce.</p>
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#202124", display: "block", marginBottom: "6px" }}>Infos complémentaires</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Adresse de livraison, logo personnalisé, plateforme (Facebook/Instagram au lieu de Google)..."
                  rows={3}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #DADCE0", borderRadius: "8px", fontSize: "14px", color: "#202124", outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }}
                  onFocus={e => { e.target.style.borderColor = G.blue; }}
                  onBlur={e => { e.target.style.borderColor = "#DADCE0"; }}
                />
              </div>

              <button type="submit" disabled={sending}
                style={{
                  padding: "14px 24px", background: sending ? "#DADCE0" : G.blue,
                  color: "#fff", border: "none", borderRadius: "10px",
                  fontWeight: 700, fontSize: "15px", cursor: sending ? "not-allowed" : "pointer",
                  fontFamily: "inherit", boxShadow: sending ? "none" : `0 4px 16px ${G.blue}40`,
                  transition: "all 0.15s",
                }}>
                {sending ? "Envoi en cours..." : "Envoyer ma commande →"}
              </button>

              <p style={{ fontSize: "11px", color: "#80868B", textAlign: "center", margin: 0 }}>
                Paiement sécurisé par lien Stripe. Aucun prélèvement avant confirmation.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #DADCE0", padding: "24px", textAlign: "center", background: "#fff" }}>
        <p style={{ fontSize: "12px", color: "#80868B", margin: 0 }}>
          © 2026 Caela Réputation by Caela Agency · <a href="mailto:contact@caela.fr" style={{ color: G.blue, textDecoration: "none" }}>contact@caela.fr</a>
          {" · "}Caela Réputation est un outil indépendant, non affilié à Google LLC.
        </p>
      </footer>

      <ChatBot />
    </div>
  );
}
