"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Google's exact brand colors
const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };
const SHADOW_SM = "0 1px 3px rgba(60,64,67,0.12), 0 1px 2px rgba(60,64,67,0.06)";
const SHADOW_MD = "0 2px 6px rgba(60,64,67,0.15), 0 1px 4px rgba(60,64,67,0.1)";
const SHADOW_LG = "0 4px 12px rgba(60,64,67,0.18), 0 2px 6px rgba(60,64,67,0.1)";

function GDots({ size = 8 }: { size?: number }) {
  return (
    <div style={{ display: "flex", gap: `${size * 0.4}px`, alignItems: "center" }}>
      {[G.blue, G.red, G.yellow, G.green].map((c, i) => (
        <div key={i} style={{ width: size, height: size, borderRadius: "50%", background: c }} />
      ))}
    </div>
  );
}

function GoogleLogo({ size = 22 }: { size?: number }) {
  return (
    <span style={{ fontSize: size, fontWeight: 700, letterSpacing: "-0.5px", lineHeight: 1 }}>
      <span style={{ color: G.blue }}>G</span>
      <span style={{ color: G.red }}>o</span>
      <span style={{ color: G.yellow }}>o</span>
      <span style={{ color: G.blue }}>g</span>
      <span style={{ color: G.green }}>l</span>
      <span style={{ color: G.red }}>e</span>
    </span>
  );
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ fontSize: size, color: i <= rating ? G.yellow : "#DADCE0" }}>★</span>
      ))}
    </span>
  );
}

// Simulates a Google Business Profile result card (Knowledge Panel)
function GMBCard() {
  return (
    <div style={{
      background: "#fff",
      borderRadius: "12px",
      boxShadow: SHADOW_LG,
      overflow: "hidden",
      width: "320px",
      flexShrink: 0,
      border: "1px solid #DADCE0",
    }}>
      {/* Map header */}
      <div style={{
        height: "140px",
        background: "linear-gradient(135deg, #E8F0FE 0%, #D2E3FC 50%, #E6F4EA 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Fake map grid */}
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            position: "absolute", left: 0, right: 0,
            top: `${i * 28}px`, height: "1px",
            background: "rgba(26,115,232,0.08)",
          }} />
        ))}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: "absolute", top: 0, bottom: 0,
            left: `${i * 42}px`, width: "1px",
            background: "rgba(26,115,232,0.08)",
          }} />
        ))}
        {/* Roads */}
        <div style={{ position: "absolute", top: "40px", left: 0, right: 0, height: "8px", background: "rgba(255,255,255,0.6)", borderRadius: "2px" }} />
        <div style={{ position: "absolute", top: "85px", left: 0, right: 0, height: "5px", background: "rgba(255,255,255,0.4)", borderRadius: "2px" }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "120px", width: "8px", background: "rgba(255,255,255,0.6)", borderRadius: "2px" }} />
        {/* Pin */}
        <div style={{ position: "absolute", top: "30px", left: "100px" }}>
          <div style={{
            width: "28px", height: "28px",
            background: G.red,
            borderRadius: "50% 50% 50% 0",
            transform: "rotate(-45deg)",
            boxShadow: "0 2px 8px rgba(234,67,53,0.4)",
          }} />
          <div style={{ width: "8px", height: "8px", background: "#fff", borderRadius: "50%", position: "absolute", top: "10px", left: "10px" }} />
        </div>
        {/* Google Maps label */}
        <div style={{
          position: "absolute", bottom: "8px", right: "10px",
          fontSize: "10px", fontWeight: 500, color: "rgba(32,33,36,0.5)",
        }}>
          Google Maps
        </div>
      </div>

      {/* Business info */}
      <div style={{ padding: "16px" }}>
        <h3 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 700, color: "#202124" }}>
          Restaurant Le Cèdre
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#202124" }}>4.6</span>
          <Stars rating={5} size={14} />
          <span style={{ fontSize: "13px", color: G.blue }}>847 avis</span>
        </div>
        <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#5F6368" }}>
          Restaurant · Cuisine libanaise · Ouvert
        </p>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          {[
            { icon: "📍", label: "Itinéraire", color: G.blue },
            { icon: "🌐", label: "Site web", color: G.blue },
            { icon: "📞", label: "Appeler", color: G.blue },
          ].map((btn) => (
            <div key={btn.label} style={{
              flex: 1, padding: "7px 4px",
              background: "#E8F0FE",
              borderRadius: "8px",
              textAlign: "center",
              cursor: "pointer",
            }}>
              <div style={{ fontSize: "14px" }}>{btn.icon}</div>
              <div style={{ fontSize: "11px", fontWeight: 500, color: G.blue }}>{btn.label}</div>
            </div>
          ))}
        </div>

        <div style={{ height: "1px", background: "#DADCE0", margin: "0 0 12px" }} />

        {/* Recent review with AI response highlight */}
        <div style={{ fontSize: "12px", color: "#5F6368", marginBottom: "8px", fontWeight: 500 }}>
          Dernier avis
        </div>
        <div style={{
          background: "#F8F9FA",
          borderRadius: "8px",
          padding: "10px",
          fontSize: "12px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontWeight: 600, color: "#202124" }}>Marie T.</span>
            <Stars rating={5} size={11} />
          </div>
          <p style={{ margin: "0 0 8px", color: "#5F6368", lineHeight: 1.5 }}>
            Excellent service, l&apos;équipe est aux petits soins. Je reviendrai sans hésiter !
          </p>
          {/* AI response */}
          <div style={{
            background: "#E8F4EA",
            borderLeft: `3px solid ${G.green}`,
            borderRadius: "0 6px 6px 0",
            padding: "8px 10px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
              <div style={{ width: "14px", height: "14px", background: G.green, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "8px", color: "#fff", fontWeight: 700 }}>✓</span>
              </div>
              <span style={{ fontSize: "10px", fontWeight: 700, color: G.green }}>Réponse IA — il y a 12 sec</span>
            </div>
            <p style={{ margin: 0, color: "#1E6B38", fontSize: "11px", lineHeight: 1.5 }}>
              Merci beaucoup Marie ! C&apos;est avec plaisir que nous vous accueillons et nous nous réjouissons de votre retour...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    color: G.green,
    bg: "#E6F4EA",
    icon: "✓",
    title: "Auto-réponse 4-5 étoiles",
    desc: "L'IA répond en moins de 30 secondes aux avis positifs. Ton humain, jamais robotique. Chaque réponse cite un détail de l'avis.",
  },
  {
    color: G.yellow,
    bg: "#FEF7E0",
    icon: "★",
    title: "5 suggestions psychologiques",
    desc: "Avis 1-3 étoiles: 5 réponses calibrées par état émotionnel. Empathique, Direct, Solution, Professionnel. Tu choisis, tu publies.",
  },
  {
    color: G.blue,
    bg: "#E8F0FE",
    icon: "⚡",
    title: "Sync Google automatique",
    desc: "Nouveaux avis détectés toutes les heures. Notification immédiate sur les avis critiques. Tableau de bord centralisé.",
  },
];

const SERVICES = [
  {
    color: G.blue,
    bg: "#E8F0FE",
    icon: "✨",
    title: "Création de fiche GMB",
    tag: "Prestation unique",
    price: "199€",
    desc: "Fiche créée de zéro: catégories, horaires, description SEO, zones. Opérationnel en 48h.",
  },
  {
    color: G.green,
    bg: "#E6F4EA",
    icon: "📈",
    title: "Optimisation de fiche",
    tag: "Le plus demandé",
    price: "299€",
    desc: "Audit + rewriting SEO local. Photos, posts, Q&A, attributs. Position 1 sur votre zone sous 30 jours.",
    highlight: true,
  },
  {
    color: G.yellow,
    bg: "#FEF7E0",
    icon: "📊",
    title: "Suivi mensuel",
    tag: "Abonnement",
    price: "149€/mois",
    desc: "Rapport performance, mise à jour des posts, veille concurrentielle locale, gestion des photos.",
  },
  {
    color: G.red,
    bg: "#FCE8E6",
    icon: "🔔",
    title: "Gestion des avis",
    tag: "Premium",
    price: "Sur devis",
    desc: "Réponse manuelle aux avis complexes, stratégie de collecte, formation équipe. Note améliorée sous 60 jours.",
  },
];

const DIY_ARGS = [
  {
    color: G.red,
    icon: "⏱",
    stat: "3h / semaine",
    title: "Ton temps vaut plus que ça",
    desc: "50 avis/mois à répondre = 3h de ton temps. À 50€/h pour un gérant, c'est 150€ partis. ReviewPilot coûte 49€.",
  },
  {
    color: G.blue,
    icon: "📉",
    stat: "+12% de vues",
    title: "La vitesse impacte ton SEO",
    desc: "Google Maps favorise les fiches avec un taux de réponse >90%. Répondre sous 30 minutes = signal fort pour l'algorithme Maps.",
  },
  {
    color: G.yellow,
    icon: "🧠",
    stat: "45% convertis",
    title: "Les avis négatifs mal gérés coûtent cher",
    desc: "Une réponse pro à un avis 1★ reconvertit 45% des clients insatisfaits. Une mauvaise réponse à chaud détruit la réputation.",
  },
  {
    color: G.green,
    icon: "📊",
    stat: "89% lisent tes réponses",
    title: "Les clients jugent tes réponses avant d'appeler",
    desc: "89% des consommateurs lisent les réponses du propriétaire avant de choisir. Une réponse bien rédigée = conversion directe.",
  },
  {
    color: G.blue,
    icon: "🔁",
    stat: "100% de cohérence",
    title: "Tu vas finir par oublier",
    desc: "Pendant les rush, les vacances, les périodes chargées — les avis s'accumulent sans réponse. L'IA, elle, ne rate jamais une seule entrée.",
  },
  {
    color: G.red,
    icon: "📈",
    stat: "×5 établissements",
    title: "Impossible à scaler manuellement",
    desc: "Dès que tu passes à 3+ établissements, gérer les avis manuellement devient un poste à plein temps. ReviewPilot gère 100 fiches comme une seule.",
  },
];

const COMPETITORS = [
  { name: "ReviewPilot", solo: "49€", business: "99€", agency: "249€", aiAuto: true, fr: true, gmb: true, highlight: true },
  { name: "Partoo", solo: "~120€", business: "~250€", agency: "Custom", aiAuto: false, fr: true, gmb: true, highlight: false },
  { name: "Uberall", solo: "~180€", business: "~350€", agency: "Custom", aiAuto: false, fr: false, gmb: true, highlight: false },
  { name: "Birdeye", solo: "~290€", business: "~450€", agency: "Custom", aiAuto: true, fr: false, gmb: true, highlight: false },
  { name: "Avis Vérifiés", solo: "~79€", business: "~149€", agency: "Custom", aiAuto: false, fr: true, gmb: false, highlight: false },
  { name: "Widewail", solo: "~180€", business: "~320€", agency: "Custom", aiAuto: true, fr: false, gmb: true, highlight: false },
];

const PLANS = [
  {
    name: "Solo",
    price: "49",
    desc: "1 établissement",
    color: G.blue,
    features: ["1 établissement connecté", "Auto-réponse 4-5 étoiles", "5 suggestions IA par avis négatif", "Notifications email", "Dashboard centralisé", "Sync Google & Trustpilot"],
    cta: "Démarrer gratuitement",
    highlight: false,
  },
  {
    name: "Business",
    price: "99",
    desc: "5 établissements",
    color: G.green,
    features: ["5 établissements connectés", "Tout Solo inclus", "Rapport hebdomadaire", "Personnalisation du ton", "Multi-utilisateurs (3)", "Sync prioritaire (2h)"],
    cta: "Choisir Business",
    highlight: true,
  },
  {
    name: "Agence",
    price: "249",
    desc: "Illimité",
    color: G.red,
    features: ["Établissements illimités", "Tout Business inclus", "Marque blanche", "API complète", "Support 7j/7", "Onboarding dédié"],
    cta: "Nous contacter",
    highlight: false,
  },
];

// Web SVG with white/light Google style
function SpiderWeb() {
  const nodes = [
    { id: "gmb", label: "Votre Fiche", sub: "Google Business", cx: 200, cy: 200, r: 38, color: G.blue, main: true },
    { id: "avis", label: "Avis & IA", sub: "Réponses auto", cx: 200, cy: 58, r: 26, color: G.green },
    { id: "seo", label: "Local SEO", sub: "Référencement", cx: 330, cy: 118, r: 26, color: G.blue },
    { id: "photos", label: "Photos", sub: "& Contenu", cx: 348, cy: 258, r: 26, color: G.red },
    { id: "creation", label: "Création", sub: "de Fiche", cx: 252, cy: 352, r: 26, color: G.yellow },
    { id: "monitoring", label: "Monitoring", sub: "& Alertes", cx: 118, cy: 345, r: 26, color: G.green },
    { id: "stats", label: "Stats", sub: "Performance", cx: 50, cy: 248, r: 26, color: G.blue },
    { id: "veille", label: "Veille", sub: "Locale", cx: 72, cy: 112, r: 26, color: G.red },
  ];
  const center = nodes[0];
  const outer = nodes.slice(1);

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "440px", margin: "0 auto" }}>
      <svg viewBox="0 0 400 400" style={{ width: "100%", height: "auto" }}>
        {/* Rings */}
        <circle cx="200" cy="200" r="155" fill="none" stroke="#DADCE0" strokeWidth="1" />
        <circle cx="200" cy="200" r="100" fill="none" stroke="#DADCE0" strokeWidth="1" />
        <circle cx="200" cy="200" r="55" fill="none" stroke="#E8F0FE" strokeWidth="1.5" />

        {/* Cross lines */}
        {outer.map((n, i) => {
          const next = outer[(i + 1) % outer.length];
          return <line key={n.id + "c"} x1={n.cx} y1={n.cy} x2={next.cx} y2={next.cy} stroke="#DADCE0" strokeWidth="1" />;
        })}

        {/* Lines to center */}
        {outer.map((n) => (
          <line key={n.id + "l"} x1={center.cx} y1={center.cy} x2={n.cx} y2={n.cy} stroke={n.color} strokeWidth="1.5" opacity="0.35" strokeDasharray="4 3" />
        ))}

        {/* Outer nodes */}
        {outer.map((n) => (
          <g key={n.id}>
            <circle cx={n.cx} cy={n.cy} r={n.r + 10} fill={n.color} opacity="0.07" />
            <circle cx={n.cx} cy={n.cy} r={n.r} fill="#fff" stroke={n.color} strokeWidth="1.5" />
            <text x={n.cx} y={n.cy - 3} textAnchor="middle" fill={n.color} fontSize="8.5" fontWeight="700" fontFamily="'Google Sans', system-ui">
              {n.label}
            </text>
            <text x={n.cx} y={n.cy + 8} textAnchor="middle" fill="#5F6368" fontSize="7" fontFamily="'Google Sans', system-ui">
              {n.sub}
            </text>
          </g>
        ))}

        {/* Center node */}
        <circle cx={center.cx} cy={center.cy} r={center.r + 16} fill={G.blue} opacity="0.07" />
        <circle cx={center.cx} cy={center.cy} r={center.r + 8} fill={G.blue} opacity="0.04" />
        <circle cx={center.cx} cy={center.cy} r={center.r} fill="#fff" stroke={G.blue} strokeWidth="2" />
        {/* G dots inside */}
        <circle cx="188" cy="193" r="4.5" fill={G.blue} />
        <circle cx="200" cy="187" r="4.5" fill={G.red} />
        <circle cx="212" cy="193" r="4.5" fill={G.yellow} />
        <circle cx="206" cy="205" r="4.5" fill={G.green} />
        <circle cx="194" cy="205" r="4.5" fill={G.blue} opacity="0.6" />
        <text x={center.cx} y={center.cy + 19} textAnchor="middle" fill="#5F6368" fontSize="7.5" fontFamily="'Google Sans', system-ui">
          {center.label}
        </text>
        <text x={center.cx} y={center.cy + 29} textAnchor="middle" fill={G.blue} fontSize="7" fontWeight="700" fontFamily="'Google Sans', system-ui">
          {center.sub}
        </text>
      </svg>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json() as { error: string };
        setError(data.error || "Identifiants incorrects");
      }
    } catch {
      setError("Erreur réseau. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: "#fff", color: "#202124" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "#fff",
        borderBottom: "1px solid #DADCE0",
        padding: "0 40px",
        height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <GDots size={9} />
          <span style={{ fontSize: "20px", fontWeight: 700, color: "#202124", letterSpacing: "-0.3px" }}>
            ReviewPilot
          </span>
          <span style={{
            fontSize: "11px", fontWeight: 600, padding: "2px 8px",
            background: "#E8F0FE", color: G.blue,
            borderRadius: "12px",
          }}>by Caela</span>
        </div>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          {["#services", "#pricing"].map((href, i) => (
            <a key={href} href={href} style={{
              padding: "8px 16px", fontSize: "14px", fontWeight: 500,
              color: "#5F6368", textDecoration: "none", borderRadius: "24px",
              transition: "background 0.15s",
            }}>
              {i === 0 ? "Services GMB" : "Tarifs"}
            </a>
          ))}
          <a href="#login" style={{
            padding: "9px 20px", fontSize: "14px", fontWeight: 600,
            background: G.blue, color: "#fff", textDecoration: "none",
            borderRadius: "6px", marginLeft: "8px",
          }}>
            Se connecter
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(180deg, #F8F9FA 0%, #fff 100%)",
        padding: "80px 40px 96px",
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex", alignItems: "center", gap: "64px",
        flexWrap: "wrap",
      }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          {/* Chip */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "6px 14px",
            background: "#E8F0FE",
            borderRadius: "24px",
            marginBottom: "28px",
          }}>
            <GDots size={7} />
            <span style={{ fontSize: "13px", fontWeight: 600, color: G.blue }}>
              Spécialiste Google Business Profile
            </span>
          </div>

          <h1 style={{
            margin: "0 0 20px",
            fontSize: "clamp(36px, 5vw, 58px)",
            fontWeight: 700,
            letterSpacing: "-1.5px",
            lineHeight: 1.1,
            color: "#202124",
          }}>
            Vos avis <GoogleLogo size={44} /><br />
            répondus. <span style={{ color: G.green }}>Automatiquement.</span>
          </h1>

          <p style={{
            margin: "0 0 36px",
            fontSize: "18px",
            lineHeight: 1.65,
            color: "#5F6368",
            maxWidth: "480px",
          }}>
            ReviewPilot gère vos réponses Google en temps réel. L&apos;IA détecte chaque avis, répond aux 4-5 étoiles automatiquement, et génère 5 suggestions pour les avis négatifs.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "40px" }}>
            <a href="#pricing" style={{
              padding: "13px 28px",
              background: G.blue, color: "#fff",
              textDecoration: "none", borderRadius: "6px",
              fontSize: "15px", fontWeight: 600,
              boxShadow: `0 2px 8px ${G.blue}40`,
            }}>
              Voir les tarifs
            </a>
            <a href="#services" style={{
              padding: "13px 28px",
              background: "#fff",
              border: "1px solid #DADCE0",
              color: G.blue, textDecoration: "none",
              borderRadius: "6px", fontSize: "15px", fontWeight: 600,
              boxShadow: SHADOW_SM,
            }}>
              Nos services GMB
            </a>
          </div>

          {/* Trust bar */}
          <div style={{
            display: "flex", gap: "24px", flexWrap: "wrap",
          }}>
            {[
              { icon: "⭐", label: "Note moyenne +0.4 en 60j", color: G.yellow },
              { icon: "⚡", label: "Réponse en moins de 30s", color: G.green },
              { icon: "🔒", label: "Partenaire Google My Business", color: G.blue },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "15px" }}>{item.icon}</span>
                <span style={{ fontSize: "13px", color: "#5F6368", fontWeight: 500 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* GMB card mockup */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
          <GMBCard />
          {/* Search bar above card */}
          <div style={{
            width: "320px",
            background: "#fff",
            border: "1px solid #DADCE0",
            borderRadius: "24px",
            padding: "10px 20px",
            display: "flex", alignItems: "center", gap: "12px",
            boxShadow: SHADOW_SM,
            order: -1,
          }}>
            <GDots size={7} />
            <span style={{ flex: 1, fontSize: "14px", color: "#5F6368" }}>restaurant le cèdre paris</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke={G.blue} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── METRICS BAND ── */}
      <div style={{ background: "#F8F9FA", borderTop: "1px solid #DADCE0", borderBottom: "1px solid #DADCE0" }}>
        <div style={{
          maxWidth: "900px", margin: "0 auto",
          display: "flex", flexWrap: "wrap",
        }}>
          {[
            { value: "4-5★", label: "Réponse automatique", color: G.yellow },
            { value: "< 30s", label: "Délai de réponse IA", color: G.green },
            { value: "5 tons", label: "Suggestions par avis négatif", color: G.blue },
            { value: "24/7", label: "Surveillance active", color: G.red },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              flex: 1, minWidth: "160px",
              padding: "28px 24px",
              textAlign: "center",
              borderRight: i < 3 ? "1px solid #DADCE0" : "none",
            }}>
              <div style={{ fontSize: "28px", fontWeight: 700, color: stat.color, letterSpacing: "-0.5px" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "13px", color: "#5F6368", marginTop: "4px" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section style={{ padding: "80px 40px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{
            display: "inline-block", padding: "4px 14px",
            background: "#E6F4EA", borderRadius: "24px",
            fontSize: "12px", fontWeight: 600, color: G.green, marginBottom: "16px",
            textTransform: "uppercase", letterSpacing: "0.6px",
          }}>
            Comment ça fonctionne
          </div>
          <h2 style={{ margin: 0, fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 700, letterSpacing: "-0.8px", color: "#202124" }}>
            L&apos;IA qui parle le langage de{" "}
            <GoogleLogo size={32} />
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "20px" }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{
              background: "#fff",
              border: "1px solid #DADCE0",
              borderRadius: "12px",
              padding: "28px",
              boxShadow: SHADOW_SM,
              transition: "box-shadow 0.2s",
            }}>
              <div style={{
                width: "48px", height: "48px",
                background: f.bg,
                borderRadius: "12px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px", color: f.color, fontWeight: 700,
                marginBottom: "18px",
              }}>
                {f.icon}
              </div>
              <h3 style={{ margin: "0 0 10px", fontSize: "17px", fontWeight: 600, color: "#202124" }}>
                {f.title}
              </h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#5F6368", lineHeight: 1.65 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Protocol card */}
        <div style={{
          background: "#F8F9FA",
          border: "1px solid #DADCE0",
          borderRadius: "12px",
          padding: "28px 32px",
        }}>
          <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "220px" }}>
              <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: 600, color: "#202124" }}>
                Protocole psychologique par étoiles
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: "#5F6368", lineHeight: 1.6 }}>
                Chaque réponse cite le prénom du client et un détail de son avis. Le ton s&apos;adapte au score.
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { label: "5★ Ambassadeur", color: G.green, bg: "#E6F4EA" },
                { label: "4★ Fidélisation", color: G.blue, bg: "#E8F0FE" },
                { label: "3★ Récupération", color: "#F9AB00", bg: "#FEF7E0" },
                { label: "2★ Résolution", color: "#E37400", bg: "#FDE8D0" },
                { label: "1★ Crise", color: G.red, bg: "#FCE8E6" },
              ].map((b) => (
                <span key={b.label} style={{
                  padding: "5px 12px", borderRadius: "20px",
                  fontSize: "12px", fontWeight: 600,
                  color: b.color, background: b.bg,
                  whiteSpace: "nowrap",
                }}>
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SPIDER WEB ── */}
      <section style={{ background: "#F8F9FA", borderTop: "1px solid #DADCE0", padding: "80px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <div style={{
              display: "inline-block", padding: "4px 14px",
              background: "#E8F0FE", borderRadius: "24px",
              fontSize: "12px", fontWeight: 600, color: G.blue, marginBottom: "16px",
              textTransform: "uppercase", letterSpacing: "0.6px",
            }}>
              Écosystème complet
            </div>
            <h2 style={{ margin: "0 0 16px", fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 700, letterSpacing: "-0.8px", color: "#202124" }}>
              La toile <GoogleLogo size={32} /> Business
            </h2>
            <p style={{ margin: "0 auto", maxWidth: "460px", fontSize: "16px", color: "#5F6368", lineHeight: 1.6 }}>
              Votre fiche Google est le centre de gravité de votre visibilité locale. Chaque service Caela renforce un nœud de ce réseau.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center", flexWrap: "wrap" }}>
            <SpiderWeb />
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { color: G.green, icon: "⭐", label: "Avis & Réponses IA", desc: "ReviewPilot répond en temps réel. Auto 4-5★, suggestions pour 1-3★." },
                { color: G.blue, icon: "📍", label: "Référencement Local", desc: "Top 3 du Pack Google Maps sur votre zone de chalandise." },
                { color: G.red, icon: "📸", label: "Photos & Contenu", desc: "Visuel professionnel optimisé. Posts réguliers qui boostent la fiche." },
                { color: G.yellow, icon: "📊", label: "Stats & Performance", desc: "Vues, clics, appels, itinéraires. Rapport mensuel complet." },
                { color: G.green, icon: "🔔", label: "Monitoring & Alertes", desc: "Nouveaux avis, Q&A, changements concurrents. Alerte immédiate." },
                { color: G.blue, icon: "✨", label: "Création de Fiche", desc: "De zéro à 100% optimisé. Opérationnel en 48h." },
              ].map((item) => (
                <div key={item.label} style={{
                  display: "flex", gap: "12px", alignItems: "flex-start",
                  padding: "12px 14px",
                  background: "#fff",
                  border: "1px solid #DADCE0",
                  borderRadius: "10px",
                  boxShadow: SHADOW_SM,
                }}>
                  <div style={{
                    width: "36px", height: "36px", flexShrink: 0,
                    background: item.color + "15",
                    borderRadius: "8px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "16px",
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: item.color, marginBottom: "2px" }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: "12px", color: "#5F6368", lineHeight: 1.5 }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES CAELA ── */}
      <section id="services" style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{
              display: "inline-block", padding: "4px 14px",
              background: "#E6F4EA", borderRadius: "24px",
              fontSize: "12px", fontWeight: 600, color: G.green, marginBottom: "16px",
              textTransform: "uppercase", letterSpacing: "0.6px",
            }}>
              Caela Agency
            </div>
            <h2 style={{ margin: "0 0 12px", fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 700, letterSpacing: "-0.8px", color: "#202124" }}>
              On gère votre présence <GoogleLogo size={30} />
            </h2>
            <p style={{ margin: "0 auto", maxWidth: "460px", fontSize: "16px", color: "#5F6368", lineHeight: 1.6 }}>
              ReviewPilot automatise vos réponses. Caela s&apos;occupe du reste: création, optimisation, visibilité locale.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px" }}>
            {SERVICES.map((s) => (
              <div key={s.title} style={{
                background: "#fff",
                border: s.highlight ? `2px solid ${s.color}` : "1px solid #DADCE0",
                borderRadius: "12px",
                padding: "24px",
                boxShadow: s.highlight ? `0 4px 16px ${s.color}20` : SHADOW_SM,
                position: "relative",
                overflow: "hidden",
              }}>
                {s.highlight && (
                  <div style={{
                    position: "absolute", top: "14px", right: "14px",
                    padding: "2px 10px",
                    background: s.bg,
                    borderRadius: "20px",
                    fontSize: "10px", fontWeight: 700, color: s.color,
                  }}>
                    Recommandé
                  </div>
                )}
                <div style={{
                  width: "44px", height: "44px",
                  background: s.bg, borderRadius: "10px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px", marginBottom: "14px",
                }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: s.color, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "5px" }}>
                  {s.tag}
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 600, color: "#202124" }}>
                  {s.title}
                </h3>
                <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#5F6368", lineHeight: 1.6 }}>
                  {s.desc}
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "19px", fontWeight: 700, color: s.color }}>
                    {s.price}
                  </span>
                  <a href="mailto:contact@caela.fr" style={{
                    padding: "6px 14px",
                    background: s.bg,
                    borderRadius: "6px",
                    color: s.color, textDecoration: "none",
                    fontSize: "12px", fontWeight: 600,
                  }}>
                    Contacter →
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Audit CTA */}
          <div style={{
            marginTop: "20px",
            background: "linear-gradient(135deg, #E8F0FE 0%, #E6F4EA 100%)",
            border: "1px solid #DADCE0",
            borderRadius: "12px",
            padding: "28px 36px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: "20px",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <GDots size={8} />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#5F6368" }}>Offre découverte</span>
              </div>
              <h3 style={{ margin: "0 0 4px", fontSize: "19px", fontWeight: 700, color: "#202124" }}>
                Pack complet Google Business
              </h3>
              <p style={{ margin: 0, fontSize: "13px", color: "#5F6368" }}>
                ReviewPilot + Optimisation fiche + Suivi mensuel. Un seul interlocuteur. Résultats garantis sous 30 jours.
              </p>
            </div>
            <a href="mailto:contact@caela.fr" style={{
              padding: "12px 28px",
              background: G.blue, color: "#fff",
              textDecoration: "none", borderRadius: "6px",
              fontSize: "14px", fontWeight: 600,
              boxShadow: `0 2px 8px ${G.blue}40`,
              whiteSpace: "nowrap",
            }}>
              Demander un audit gratuit
            </a>
          </div>
        </div>
      </section>

      {/* ── WHY NOT DIY ── */}
      <section style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{
              display: "inline-block", padding: "4px 14px",
              background: "#FCE8E6", borderRadius: "24px",
              fontSize: "12px", fontWeight: 600, color: G.red, marginBottom: "16px",
              textTransform: "uppercase", letterSpacing: "0.6px",
            }}>
              "Je peux le faire moi-même"
            </div>
            <h2 style={{ margin: "0 0 12px", fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, letterSpacing: "-0.8px", color: "#202124" }}>
              Techniquement oui. Intelligemment non.
            </h2>
            <p style={{ margin: "0 auto", maxWidth: "500px", fontSize: "16px", color: "#5F6368", lineHeight: 1.6 }}>
              Répondre aux avis manuellement, c&apos;est gratuit. Jusqu&apos;à ce que tu calcules vraiment ce que ça coûte.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {DIY_ARGS.map((a) => (
              <div key={a.title} style={{
                background: "#fff", border: "1px solid #DADCE0",
                borderRadius: "12px", padding: "24px",
                boxShadow: SHADOW_SM,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <div style={{
                    width: "40px", height: "40px",
                    background: a.color + "15", borderRadius: "10px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "18px",
                  }}>{a.icon}</div>
                  <span style={{ fontSize: "19px", fontWeight: 700, color: a.color }}>{a.stat}</span>
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 600, color: "#202124" }}>{a.title}</h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#5F6368", lineHeight: 1.6 }}>{a.desc}</p>
              </div>
            ))}
          </div>

          {/* Manual vs Auto comparison */}
          <div style={{
            marginTop: "24px",
            background: "#F8F9FA", border: "1px solid #DADCE0",
            borderRadius: "12px", overflow: "hidden",
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
            }}>
              {/* Manual */}
              <div style={{ padding: "28px 32px", borderRight: "1px solid #DADCE0" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: G.red, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  ✗ Sans ReviewPilot
                </div>
                {[
                  "Tu réalises à J+3 qu'un avis 1★ est resté sans réponse",
                  "Tu écris la même réponse générique pour la 12ème fois",
                  "Tu réponds énervé à un avis injuste. Ça se voit.",
                  "Tu passes 3h/semaine sur les avis au lieu de gérer ton business",
                  "Ta note stagne. Les concurrents qui répondent vite te dépassent sur Maps",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "flex-start" }}>
                    <span style={{ color: G.red, fontWeight: 700, flexShrink: 0 }}>✗</span>
                    <span style={{ fontSize: "13px", color: "#5F6368" }}>{item}</span>
                  </div>
                ))}
              </div>
              {/* Auto */}
              <div style={{ padding: "28px 32px", background: "#fff" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: G.green, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  ✓ Avec ReviewPilot
                </div>
                {[
                  "Réponse en 30 secondes, 24h/24, même la nuit du réveillon",
                  "Chaque réponse cite le prénom et un détail de l'avis. Jamais générique.",
                  "Pour les avis négatifs : 5 tons calibrés. Tu choisis le meilleur.",
                  "Taux de réponse >95%. Google t'en récompense dans Maps.",
                  "Ta note monte. Tu dormes. L'IA travaille.",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "flex-start" }}>
                    <span style={{ color: G.green, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: "13px", color: "#5F6368" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPETITOR TABLE ── */}
      <section style={{ background: "#F8F9FA", borderTop: "1px solid #DADCE0", padding: "80px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{ margin: "0 0 12px", fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 700, letterSpacing: "-0.8px", color: "#202124" }}>
              Pourquoi ReviewPilot ?
            </h2>
            <p style={{ margin: 0, fontSize: "15px", color: "#5F6368" }}>
              Comparaison honnête avec les alternatives du marché.
            </p>
          </div>

          <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", overflow: "hidden", boxShadow: SHADOW_SM }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8F9FA" }}>
                  {["Solution", "Solo (1 lieu)", "Business (5 lieux)", "IA auto-réponse", "Interface FR", "Spéc. Google"].map((col) => (
                    <th key={col} style={{
                      padding: "12px 16px", textAlign: "left",
                      fontSize: "11px", fontWeight: 600, color: "#5F6368",
                      textTransform: "uppercase", letterSpacing: "0.6px",
                      borderBottom: "1px solid #DADCE0",
                    }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPETITORS.map((c, i) => (
                  <tr key={c.name} style={{
                    background: c.highlight ? "#E8F0FE" : "transparent",
                    borderBottom: i < COMPETITORS.length - 1 ? "1px solid #DADCE0" : "none",
                  }}>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: "14px", fontWeight: c.highlight ? 700 : 500, color: c.highlight ? G.blue : "#202124" }}>
                        {c.name}
                        {c.highlight && <span style={{ marginLeft: "6px", fontSize: "10px", background: G.blue, color: "#fff", padding: "2px 7px", borderRadius: "10px" }}>Vous</span>}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "14px", fontWeight: c.highlight ? 700 : 400, color: c.highlight ? G.green : "#202124" }}>{c.solo}</td>
                    <td style={{ padding: "14px 16px", fontSize: "14px", fontWeight: c.highlight ? 700 : 400, color: c.highlight ? G.green : "#202124" }}>{c.business}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: "16px" }}>{c.aiAuto ? "✅" : "❌"}</span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: "16px" }}>{c.fr ? "✅" : "❌"}</span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: "16px" }}>{c.gmb ? "✅" : "❌"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ textAlign: "center", fontSize: "12px", color: "#80868B", marginTop: "12px" }}>
            * Prix indicatifs, tarifs publics 2025-2026. Les concurrents ne proposent pas d&apos;IA auto-réponse à ce prix.
          </p>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ background: "#fff", borderTop: "1px solid #DADCE0", padding: "80px 40px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ margin: "0 0 12px", fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 700, letterSpacing: "-0.8px", color: "#202124" }}>
              Tarifs simples
            </h2>
            <p style={{ margin: "0 0 24px", fontSize: "16px", color: "#5F6368" }}>
              Sans engagement. Annulez quand vous voulez.
            </p>
            <div style={{
              display: "inline-flex",
              background: "#fff",
              border: "1px solid #DADCE0",
              borderRadius: "8px",
              padding: "4px",
              gap: "2px",
              boxShadow: SHADOW_SM,
            }}>
              {(["monthly", "annual"] as const).map((b) => (
                <button key={b} onClick={() => setBilling(b)} style={{
                  padding: "8px 20px", borderRadius: "6px",
                  border: "none", cursor: "pointer",
                  fontSize: "14px", fontWeight: 500,
                  transition: "all 0.15s",
                  background: billing === b ? G.blue : "transparent",
                  color: billing === b ? "#fff" : "#5F6368",
                }}>
                  {b === "monthly" ? "Mensuel" : (
                    <span>Annuel <span style={{ color: billing === b ? "#bef7d7" : G.green, fontSize: "12px", fontWeight: 700 }}>-20%</span></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", alignItems: "start" }}>
            {PLANS.map((plan) => {
              const price = billing === "annual" ? Math.round(parseInt(plan.price) * 0.8) : parseInt(plan.price);
              return (
                <div key={plan.name} style={{
                  background: "#fff",
                  border: plan.highlight ? `2px solid ${plan.color}` : "1px solid #DADCE0",
                  borderRadius: "12px",
                  padding: "28px",
                  boxShadow: plan.highlight ? `0 4px 16px ${plan.color}20` : SHADOW_SM,
                  position: "relative",
                  overflow: "hidden",
                }}>
                  {/* Color top bar */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: plan.color }} />

                  {plan.highlight && (
                    <div style={{
                      position: "absolute", top: "14px", right: "16px",
                      padding: "2px 10px",
                      background: plan.color + "15",
                      borderRadius: "20px",
                      fontSize: "10px", fontWeight: 700, color: plan.color,
                    }}>
                      POPULAIRE
                    </div>
                  )}

                  <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 700, color: plan.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {plan.name}
                  </p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "40px", fontWeight: 700, color: "#202124", letterSpacing: "-1px" }}>
                      {price}€
                    </span>
                    <span style={{ fontSize: "14px", color: "#5F6368" }}>/mois</span>
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <p style={{ margin: "0 0 4px", fontSize: "13px", color: "#5F6368" }}>{plan.desc}</p>
                    {billing === "annual" && (
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "3px 10px", background: "#E6F4EA",
                        borderRadius: "20px", fontSize: "12px", fontWeight: 700, color: G.green,
                      }}>
                        <span>🎁</span>
                        Économie: {parseInt(plan.price) * 12 - Math.round(parseInt(plan.price) * 0.8) * 12}€/an
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "24px" }}>
                    {plan.features.map((f) => (
                      <div key={f} style={{ display: "flex", gap: "9px", alignItems: "flex-start" }}>
                        <span style={{ color: plan.color, fontWeight: 700, fontSize: "13px", flexShrink: 0, marginTop: "1px" }}>✓</span>
                        <span style={{ fontSize: "13px", color: "#5F6368", lineHeight: 1.4 }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <a href="#login" style={{
                    display: "block", textAlign: "center",
                    padding: "11px",
                    background: plan.highlight ? plan.color : "#fff",
                    border: `1px solid ${plan.highlight ? plan.color : "#DADCE0"}`,
                    borderRadius: "6px",
                    color: plan.highlight ? "#fff" : plan.color,
                    textDecoration: "none", fontSize: "14px", fontWeight: 600,
                  }}>
                    {plan.cta}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── LOGIN ── */}
      <section id="login" style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: "420px", margin: "0 auto" }}>
          {/* Google-style login card */}
          <div style={{
            background: "#fff",
            border: "1px solid #DADCE0",
            borderRadius: "16px",
            padding: "44px 40px",
            boxShadow: SHADOW_MD,
            textAlign: "center",
          }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <GDots size={11} />
            </div>
            <h2 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: 700, color: "#202124" }}>
              Se connecter
            </h2>
            <p style={{ margin: "0 0 28px", color: "#5F6368", fontSize: "15px" }}>
              Accéder à votre dashboard ReviewPilot
            </p>

            <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#202124", marginBottom: "6px" }}>
                  Adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.fr"
                  required
                  style={{
                    width: "100%", padding: "12px 16px",
                    border: "1px solid #DADCE0",
                    borderRadius: "6px", fontSize: "15px",
                    color: "#202124", outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s",
                    background: "#fff",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = G.blue; e.target.style.boxShadow = `0 0 0 2px ${G.blue}20`; }}
                  onBlur={(e) => { e.target.style.borderColor = "#DADCE0"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#202124", marginBottom: "6px" }}>
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: "100%", padding: "12px 16px",
                    border: "1px solid #DADCE0",
                    borderRadius: "6px", fontSize: "15px",
                    color: "#202124", outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s",
                    background: "#fff",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = G.blue; e.target.style.boxShadow = `0 0 0 2px ${G.blue}20`; }}
                  onBlur={(e) => { e.target.style.borderColor = "#DADCE0"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              {error && (
                <div style={{
                  padding: "12px 16px",
                  background: "#FCE8E6",
                  border: `1px solid ${G.red}30`,
                  borderRadius: "8px", color: G.red,
                  fontSize: "14px", marginBottom: "16px",
                  display: "flex", gap: "8px", alignItems: "center",
                }}>
                  <span>⚠</span> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "13px",
                  background: loading ? `${G.blue}99` : G.blue,
                  border: "none", borderRadius: "6px",
                  color: "#fff", fontSize: "15px",
                  fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : `0 2px 8px ${G.blue}40`,
                  transition: "all 0.2s",
                }}
              >
                {loading ? "Connexion en cours..." : "Se connecter"}
              </button>
            </form>
          </div>
          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "#80868B" }}>
            ReviewPilot by Caela Agency · contact@caela.fr
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: "#F8F9FA",
        borderTop: "1px solid #DADCE0",
        padding: "24px 40px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: "12px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <GDots size={7} />
          <span style={{ fontSize: "13px", color: "#5F6368" }}>
            © 2026 ReviewPilot by Caela Agency
          </span>
        </div>
        <div style={{ display: "flex", gap: "24px" }}>
          {["Confidentialité", "CGU", "Support"].map((link) => (
            <a key={link} href="#" style={{ fontSize: "13px", color: "#5F6368", textDecoration: "none" }}>
              {link}
            </a>
          ))}
        </div>
      </footer>

    </div>
  );
}
