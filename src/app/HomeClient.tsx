"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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

function GL({ size = 22 }: { size?: number }) {
  return (
    <span style={{ fontSize: size, fontWeight: 700, letterSpacing: "-0.5px", lineHeight: 1 }}>
      <span style={{ color: G.blue }}>G</span><span style={{ color: G.red }}>o</span>
      <span style={{ color: G.yellow }}>o</span><span style={{ color: G.blue }}>g</span>
      <span style={{ color: G.green }}>l</span><span style={{ color: G.red }}>e</span>
    </span>
  );
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span>{[1,2,3,4,5].map(i => (
      <span key={i} style={{ fontSize: size, color: i <= rating ? G.yellow : "#DADCE0" }}>★</span>
    ))}</span>
  );
}

function GMBCard() {
  return (
    <div style={{ background: "#fff", borderRadius: "12px", boxShadow: SHADOW_LG, overflow: "hidden", width: "320px", maxWidth: "100%", flexShrink: 0, border: "1px solid #DADCE0" }}>
      <div style={{ height: "130px", background: "linear-gradient(135deg, #E8F0FE, #D2E3FC 50%, #E6F4EA)", position: "relative", overflow: "hidden" }}>
        {[0,1,2,3,4].map(i => <div key={i} style={{ position: "absolute", left: 0, right: 0, top: `${i*28}px`, height: "1px", background: "rgba(26,115,232,0.08)" }} />)}
        {[0,1,2,3,4,5,6,7].map(i => <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: `${i*42}px`, width: "1px", background: "rgba(26,115,232,0.08)" }} />)}
        <div style={{ position: "absolute", top: "40px", left: 0, right: 0, height: "7px", background: "rgba(255,255,255,0.6)", borderRadius: "2px" }} />
        <div style={{ position: "absolute", top: "80px", left: 0, right: 0, height: "5px", background: "rgba(255,255,255,0.4)", borderRadius: "2px" }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "120px", width: "7px", background: "rgba(255,255,255,0.5)", borderRadius: "2px" }} />
        <div style={{ position: "absolute", top: "28px", left: "100px" }}>
          <div style={{ width: "26px", height: "26px", background: G.red, borderRadius: "50% 50% 50% 0", transform: "rotate(-45deg)", boxShadow: "0 2px 8px rgba(234,67,53,0.4)" }} />
          <div style={{ width: "8px", height: "8px", background: "#fff", borderRadius: "50%", position: "absolute", top: "9px", left: "9px" }} />
        </div>
        <div style={{ position: "absolute", bottom: "7px", right: "10px", fontSize: "9px", color: "rgba(32,33,36,0.4)" }}>Google Maps</div>
      </div>
      <div style={{ padding: "14px" }}>
        <h3 style={{ margin: "0 0 3px", fontSize: "17px", fontWeight: 700, color: "#202124" }}>Restaurant Le Cèdre</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "6px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600 }}>4.6</span>
          <Stars rating={5} size={13} />
          <span style={{ fontSize: "12px", color: G.blue }}>847 avis</span>
        </div>
        <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#5F6368" }}>Restaurant · Cuisine libanaise · Ouvert</p>
        <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
          {[{ icon: "📍", label: "Itinéraire" }, { icon: "🌐", label: "Site web" }, { icon: "📞", label: "Appeler" }].map(b => (
            <div key={b.label} style={{ flex: 1, padding: "6px 4px", background: "#E8F0FE", borderRadius: "7px", textAlign: "center", cursor: "pointer" }}>
              <div style={{ fontSize: "13px" }}>{b.icon}</div>
              <div style={{ fontSize: "10px", fontWeight: 500, color: G.blue }}>{b.label}</div>
            </div>
          ))}
        </div>
        <div style={{ height: "1px", background: "#DADCE0", margin: "0 0 10px" }} />
        <div style={{ fontSize: "11px", color: "#5F6368", marginBottom: "7px", fontWeight: 500 }}>Dernier avis</div>
        <div style={{ background: "#F8F9FA", borderRadius: "8px", padding: "9px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
            <span style={{ fontWeight: 600, fontSize: "12px", color: "#202124" }}>Marie T.</span>
            <Stars rating={5} size={10} />
          </div>
          <p style={{ margin: "0 0 7px", color: "#5F6368", lineHeight: 1.5, fontSize: "11px" }}>Excellent service, l&apos;équipe est aux petits soins !</p>
          <div style={{ background: "#E8F4EA", borderLeft: `3px solid ${G.green}`, borderRadius: "0 5px 5px 0", padding: "7px 9px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "3px" }}>
              <div style={{ width: "12px", height: "12px", background: G.green, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "7px", color: "#fff", fontWeight: 700 }}>✓</span>
              </div>
              <span style={{ fontSize: "9px", fontWeight: 700, color: G.green }}>Réponse IA · il y a 12 sec</span>
            </div>
            <p style={{ margin: 0, color: "#1E6B38", fontSize: "10px", lineHeight: 1.5 }}>
              Merci beaucoup Marie ! C&apos;est avec plaisir que nous vous accueillons...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mockup visuel de la plaque NFC (SVG maison — pas de vraie photo produit
// disponible pour l'instant). Sert à faire comprendre l'objet en un coup
// d'œil dans la section NFC, sans attendre un vrai shooting produit.
function NFCPlateVisual({ size = 220 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 220 136" style={{ display: "block", filter: "drop-shadow(0 8px 20px rgba(26,115,232,0.25))" }}>
      <defs>
        <linearGradient id="rpPlate" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2A2E33" />
          <stop offset="55%" stopColor="#1B1E22" />
          <stop offset="100%" stopColor="#0F1113" />
        </linearGradient>
        <linearGradient id="rpSheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="40%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="212" height="128" rx="16" fill="url(#rpPlate)" stroke="#3A3F45" strokeWidth="1.5" />
      <rect x="4" y="4" width="212" height="128" rx="16" fill="url(#rpSheen)" />
      {/* logo Caela */}
      <g transform="translate(20,20)">
        <circle cx="0" cy="0" r="4" fill={G.blue} />
        <circle cx="11" cy="0" r="4" fill={G.red} />
        <circle cx="22" cy="0" r="4" fill={G.yellow} />
        <circle cx="33" cy="0" r="4" fill={G.green} />
      </g>
      {/* ondes NFC */}
      <g transform="translate(178,30)" stroke="#fff" fill="none" strokeLinecap="round">
        <path d="M-6,10 a10,10 0 0 1 12,0" strokeWidth="2.4" opacity="0.9" />
        <path d="M-11,14 a17,17 0 0 1 22,0" strokeWidth="2.2" opacity="0.6" />
        <path d="M-16,18 a24,24 0 0 1 32,0" strokeWidth="2" opacity="0.35" />
        <circle cx="0" cy="14" r="2.2" fill="#fff" />
      </g>
      {/* texte */}
      <text x="20" y="70" fill="#fff" fontSize="15" fontWeight="700" fontFamily="system-ui, sans-serif">Restaurant Le Cèdre</text>
      <text x="20" y="88" fill="#9AA0A6" fontSize="10" fontFamily="system-ui, sans-serif">Tapez pour laisser un avis</text>
      {/* QR de secours, coin bas droit */}
      <g transform="translate(160,86)">
        <rect width="34" height="34" rx="4" fill="#fff" />
        {[0,1,2,3,4].map(r => (
          <g key={r}>
            {[0,1,2,3,4].map(c => (
              ((r + c) % 3 === 0 || (r === 0 && c === 0) || (r === 4 && c === 4)) && (
                <rect key={c} x={3 + c * 5.6} y={3 + r * 5.6} width="4.6" height="4.6" fill="#0F1113" />
              )
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}

function ROICalculator() {
  const [reviews, setReviews] = useState(50);
  const timeMin = reviews * 4;
  const timeH = (timeMin / 60).toFixed(1);
  const timeCost = Math.round(timeMin / 60 * 50);
  const plan = reviews <= 30 ? { name: "Starter", price: 29 } : reviews <= 100 ? { name: "Solo", price: 69 } : reviews <= 300 ? { name: "Pro", price: 149 } : { name: "Studio", price: 299 };
  const savings = timeCost - plan.price;
  const roi = Math.round((savings / plan.price) * 100);

  return (
    <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "16px", padding: "36px 40px", boxShadow: SHADOW_MD }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ display: "inline-block", padding: "4px 14px", background: "#E8F0FE", borderRadius: "24px", fontSize: "12px", fontWeight: 600, color: G.blue, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.6px" }}>
          Calculez vos économies
        </div>
        <h3 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "#202124" }}>
          Combien vous coûte vraiment la gestion des avis ?
        </h3>
      </div>

      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <label style={{ fontSize: "14px", fontWeight: 600, color: "#202124" }}>
            Nombre d&apos;avis par mois
          </label>
          <span style={{ fontSize: "22px", fontWeight: 700, color: G.blue }}>{reviews}</span>
        </div>
        <input
          type="range" min="5" max="500" step="5"
          value={reviews}
          onChange={(e) => setReviews(parseInt(e.target.value))}
          style={{ width: "100%", accentColor: G.blue, cursor: "pointer", height: "4px" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#80868B", marginTop: "4px" }}>
          <span>5 avis</span><span>500 avis</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Temps perdu / mois", value: `${timeH}h`, sub: `${reviews} avis × 4 min`, color: G.red, bg: "#FCE8E6" },
          { label: "Coût de ce temps", value: `${timeCost}€`, sub: "À 50€/heure gérant", color: "#F9AB00", bg: "#FEF7E0" },
          { label: "Plan recommandé", value: plan.name, sub: `${plan.price}€/mois`, color: G.blue, bg: "#E8F0FE" },
        ].map(item => (
          <div key={item.label} style={{ background: item.bg, borderRadius: "12px", padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: item.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>{item.label}</div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: "#202124", letterSpacing: "-0.5px" }}>{item.value}</div>
            <div style={{ fontSize: "11px", color: "#5F6368", marginTop: "3px" }}>{item.sub}</div>
          </div>
        ))}
      </div>

      <div style={{
        background: savings > 0 ? "#E6F4EA" : "#F8F9FA",
        borderRadius: "12px", padding: "16px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        border: `1px solid ${savings > 0 ? G.green + "40" : "#DADCE0"}`,
      }}>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: savings > 0 ? G.green : "#5F6368", marginBottom: "2px" }}>
            {savings > 0 ? `✓ Vous économisez ${savings}€/mois` : "Investissement rentable dès le 1er mois"}
          </div>
          <div style={{ fontSize: "12px", color: "#5F6368" }}>
            {savings > 0 ? `ROI immédiat : ${roi}% — vous récupérez votre mise en ${Math.round(30 / (savings / plan.price))} jours` : "Caela Réputation gère vos avis. Vous gérez votre business."}
          </div>
        </div>
        <a href="#pricing" style={{ padding: "10px 20px", background: G.blue, color: "#fff", textDecoration: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap" }}>
          Voir les offres →
        </a>
      </div>
    </div>
  );
}

function ReviewFlow() {
  const steps = [
    { icon: "⭐", color: G.red, label: "Avis 2★ détecté", sub: "Sync automatique toutes les heures", timing: "0 sec" },
    { icon: "🧠", color: G.blue, label: "IA génère 3 suggestions", sub: "Empathique, Direct, Solution, Détaillé, Pro", timing: "+8 sec" },
    { icon: "📧", color: G.yellow, label: "Email envoyé avec boutons", sub: "1 clic = réponse choisie, directement dans le mail", timing: "+10 sec" },
    { icon: "✅", color: G.green, label: "Publié sur Google", sub: "La réponse apparaît sous le nom du restaurant", timing: "+2 sec" },
  ];
  return (
    <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "16px", padding: "32px", boxShadow: SHADOW_SM }}>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 700, color: "#202124" }}>
          Un avis 2★ arrive. Voici ce qui se passe.
        </h3>
        <p style={{ margin: 0, fontSize: "13px", color: "#5F6368" }}>
          Votre rôle total : <strong>8 secondes.</strong> Taper sur un bouton dans votre email.
        </p>
      </div>
      <div style={{ display: "flex", gap: "0", alignItems: "stretch" }}>
        {steps.map((step, i) => (
          <div key={step.label} style={{ flex: 1, position: "relative" }}>
            {i < steps.length - 1 && (
              <div style={{ position: "absolute", top: "28px", right: "-1px", zIndex: 1, width: "20px", height: "2px", background: "#DADCE0" }} />
            )}
            <div style={{ padding: "16px 12px", textAlign: "center" }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: step.color + "15",
                border: `2px solid ${step.color}30`,
                margin: "0 auto 8px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px",
              }}>{step.icon}</div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: step.color, marginBottom: "4px", letterSpacing: "0.3px" }}>{step.timing}</div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#202124", marginBottom: "3px" }}>{step.label}</div>
              <div style={{ fontSize: "11px", color: "#5F6368", lineHeight: 1.4 }}>{step.sub}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "16px", padding: "12px 16px", background: "#E8F0FE", borderRadius: "8px", textAlign: "center" }}>
        <span style={{ fontSize: "13px", color: G.blue, fontWeight: 600 }}>
          Pas besoin de se connecter au dashboard. Tout se passe dans votre email. Sur téléphone ou ordinateur.
        </span>
      </div>
    </div>
  );
}

const PLANS = [
  {
    name: "Starter",
    price: "29",
    annual: "23",
    desc: "1 établissement",
    color: G.green,
    best: "Moins de 30 avis/mois — débutez sans risque",
    features: [
      "1 établissement connecté",
      "Surveillance des avis 24/7",
      "3 suggestions IA par avis négatif",
      "Notifications email instantanées",
      "Dashboard centralisé",
    ],
    missing: ["Auto-réponse automatique"],
    cta: "Essai gratuit 14 jours",
    highlight: false,
  },
  {
    name: "Solo",
    price: "69",
    annual: "55",
    desc: "1 établissement",
    color: G.blue,
    best: "Restaurant, commerce — le plus populaire",
    features: [
      "1 établissement connecté",
      "Auto-réponse 4-5★ en 30 secondes",
      "3 suggestions IA + email 1-clic",
      "Rapport hebdomadaire par email",
      "Rappels avis sans réponse",
    ],
    missing: [],
    cta: "Essai gratuit → Solo",
    highlight: true,
  },
  {
    name: "Pro",
    price: "149",
    annual: "119",
    desc: "5 établissements",
    color: "#7C3AED",
    best: "Chaîne locale, franchise 3-5 lieux",
    features: [
      "5 établissements connectés",
      "Tout Solo inclus",
      "Personnalisation du ton par lieu",
      "Multi-utilisateurs (3 accès)",
      "Support prioritaire",
    ],
    missing: [],
    cta: "Essai gratuit → Pro",
    highlight: false,
  },
];

const DIY_ARGS = [
  { color: G.red, bg: "#FCE8E6", icon: "⏱", stat: "3h perdues/semaine", title: "Ton temps vaut plus que ça", desc: "50 avis/mois = 3h à rédiger des réponses. À 50€/h de valeur gérant, c'est 150€ gaspillés. Caela Réputation Solo = 69€." },
  { color: G.blue, bg: "#E8F0FE", icon: "📍", stat: "+12% de vues Maps", title: "La vitesse impacte ton SEO Google", desc: "Google Maps favorise les fiches avec taux de réponse >90%. Répondre en 30 minutes = signal fort pour l'algorithme." },
  { color: G.yellow, bg: "#FEF7E0", icon: "🧠", stat: "45% reconvertis", title: "Les avis négatifs mal gérés coûtent cher", desc: "Une réponse professionnelle à un avis 1★ reconvertit 45% des clients insatisfaits. Une réponse à chaud brise la réputation." },
  { color: G.green, bg: "#E6F4EA", icon: "👀", stat: "89% lisent tes réponses", title: "Tes réponses convertissent avant l'appel", desc: "89% des consommateurs lisent les réponses du propriétaire avant de contacter. Une bonne réponse = client gagné." },
  { color: G.blue, bg: "#E8F0FE", icon: "🔁", stat: "0 avis oublié", title: "Tu vas finir par oublier", desc: "Pendant les rush, les vacances, les périodes chargées — les avis s'accumulent. L'IA ne rate jamais une seule entrée." },
  { color: G.red, bg: "#FCE8E6", icon: "📈", stat: "Scalable à l'infini", title: "Impossible à scaler manuellement", desc: "À 5+ établissements, gérer les avis devient un temps plein. Caela Réputation gère 30 fiches comme une seule." },
];

const COMPETITORS = [
  { name: "Caela Réputation 🇫🇷", solo: "29-69€", business: "149€", agency: "449€", aiAuto: true, fr: true, gmb: true, trial: true, highlight: true },
  { name: "getreviewpilot.ai 🇺🇸", solo: "$29-49", business: "$49", agency: "—", aiAuto: true, fr: false, gmb: true, trial: true, highlight: false },
  { name: "Partoo 🇫🇷", solo: "~150€", business: "~250€", agency: "Custom", aiAuto: false, fr: true, gmb: true, trial: false, highlight: false },
  { name: "Birdeye 🇺🇸", solo: "~290€", business: "~450€", agency: "Custom", aiAuto: true, fr: false, gmb: true, trial: false, highlight: false },
  { name: "Avis Vérifiés 🇫🇷", solo: "~79€", business: "~149€", agency: "Custom", aiAuto: false, fr: true, gmb: false, trial: false, highlight: false },
  { name: "Uberall 🇩🇪", solo: "~200€", business: "~400€", agency: "Custom", aiAuto: false, fr: false, gmb: true, trial: false, highlight: false },
];

// Bundle vidéos explicatif décidé le 2026-08-07, pour se différencier des
// concurrents sur la pédagogie. Scripts complets dans le PDF fourni à Ilies —
// tant que le tournage n'est pas fait, la section reste un teaser "bientôt",
// jamais présentée comme déjà disponible (règle : ne rien afficher qui n'existe pas).
const VIDEO_TOPICS = [
  { icon: "🎯", title: "Pourquoi vos réponses aux avis pèsent plus que vous ne pensez", duration: "1 min 30" },
  { icon: "⚙️", title: "Caela Réputation en 2 minutes : de l'avis à la réponse publiée", duration: "2 min" },
  { icon: "⚖️", title: "Le faire soi-même vs Caela Réputation : le vrai calcul", duration: "2 min 30" },
  { icon: "📶", title: "Les plaques NFC : comment ça marche, concrètement", duration: "1 min 45" },
  { icon: "🏪", title: "Créer et optimiser sa fiche Google Business Profile", duration: "2 min 15" },
  { icon: "🩹", title: "Un avis 1★ n'est pas une catastrophe : comment le désamorcer", duration: "2 min" },
  { icon: "🎁", title: "Le parrainage Caela expliqué en une vidéo", duration: "1 min" },
  { icon: "🔒", title: "RGPD, sécurité, CGU Google : on répond à vos questions", duration: "2 min 30" },
];

const TESTIMONIALS = [
  { name: "Karim B.", role: "Gérant — Restaurant Le Bosphore, Lyon", rating: 5, text: "J'avais 47 avis sans aucune réponse. En 2 semaines Caela Réputation a tout rattrapé. Ma note est passée de 4.1 à 4.6 et je reçois plus d'appels depuis." },
  { name: "Nathalie R.", role: "Propriétaire — Salon Nath'Beauté, Paris 15e", rating: 5, text: "Un client m'a mis 1 étoile injustement. Caela Réputation m'a proposé 3 réponses. J'ai cliqué sur la version empathique depuis mon téléphone. Le client a rappelé pour s'excuser." },
  { name: "Sofiane M.", role: "Directeur — Groupe 4 snacks, Marseille", rating: 5, text: "4 établissements, plus de 200 avis par mois. Avant je passais mes dimanches à répondre. Maintenant c'est automatique. Je gagne 3h par semaine minimum." },
];

// Fusion décidée le 2026-08-04 : les 4 prestations séparées (création,
// optimisation, suivi, gestion des avis) faisaient hésiter entre quatre
// cartes au lieu d'un choix clair. Deux paliers : un pack de lancement
// (one-shot) et un pack de croissance (abonnement géré).
//
// Revu le 2026-08-07 : la gestion des avis fait partie intégrante de
// l'optimisation mensuelle (Pack Croissance), pas un lot séparé — mais tous
// les clients ne veulent pas l'optimisation des posts chaque mois. D'où un
// 3e palier allégé, avis seuls, pour ceux qui veulent juste ce filet de
// sécurité sans l'abonnement complet. Pack Croissance passé à 149€/mois
// (au lieu de 199) pour rester au-dessus du Pack Avis sans écraser sa valeur.
const GMB_SERVICES = [
  { color: G.blue, bg: "#E8F0FE", icon: "✨", title: "Pack Lancement GMB", tag: "Création + Optimisation", price: "199€", oldPrice: "498€", desc: "Fiche créée de zéro (catégories, horaires, SEO local) puis optimisée à fond : audit, rewriting, photos, posts, Q&A. Boost de visibilité sur Google Maps dès les 30 premiers jours.", highlight: false },
  { color: G.yellow, bg: "#FEF7E0", icon: "📊", title: "Pack Croissance", tag: "Optimisation mensuelle + Gestion des avis", price: "149€/mois", oldPrice: "~350€/mois", desc: "L'offre complète : mise à jour des posts et photos chaque mois, veille concurrentielle, rapport de performance — ET la gestion des avis incluse (réponse manuelle aux avis complexes, stratégie de collecte, formation de votre équipe).", highlight: true },
  { color: G.green, bg: "#E6F4EA", icon: "💬", title: "Pack Avis seul", tag: "Gestion des avis, sans l'optimisation mensuelle", price: "89€/mois", desc: "Vous ne voulez pas l'optimisation mensuelle des posts ? Prenez juste la gestion des avis : réponse manuelle aux avis complexes, stratégie de collecte, formation de votre équipe. Rien d'autre.", highlight: false },
];

// Paliers revus le 2026-08-04 : dégressivité affichée explicitement
// (prix unitaire + économie vs. achat à l'unité), au lieu d'un simple prix.
const NFC_PACKS = [
  { name: "Plaque Solo", price: "19€", unit: "19€/plaque", qty: "1 plaque", color: G.blue, features: ["NFC + QR code de secours", "Design personnalisé (votre logo)", "Cible au choix : Google, Insta, TikTok…", "Résistant eau et chaleur"] },
  { name: "Pack Établissement", price: "69€", oldPrice: "95€", unit: "13,80€/plaque", qty: "5 plaques", color: G.green, features: ["5 plaques NFC + QR de secours", "Multi-réseaux : Google, Insta, TikTok, WhatsApp", "Setup inclus", "Livraison sous 7 jours"], highlight: true },
  { name: "Pack Réseau", price: "199€", oldPrice: "475€", unit: "7,96€/plaque", qty: "25 plaques", color: G.red, features: ["25 plaques NFC + QR de secours", "Design multi-établissements", "Cible modifiable à distance (roue ou lien direct)", "Configuration centralisée"], },
];

// Réalisations réelles de l'agence, vérifiées en ligne le 2026-08-07 (200 OK)
// avant publication — jamais de faux exemples sur une page qui vend le service.
const LANDING_EXAMPLES = [
  { name: "Caelenda", desc: "Réservation en ligne pour salons & instituts", url: "https://caelenda.fr", color: G.blue },
  { name: "Anhaya Studio", desc: "Plateforme événementielle & billetterie", url: "https://anhaya-studio.vercel.app", color: "#7C3AED" },
  { name: "Maison Ninour", desc: "E-commerce, univers éditorial soigné", url: "https://maison-ninour.vercel.app", color: G.green },
];

const NFC_REASSURANCE = [
  { icon: "🛡️", title: "Garantie remplacement", desc: "Plaque défectueuse ? On la remplace gratuitement." },
  { icon: "📱", title: "iOS + Android", desc: "Compatible iPhone et Android. QR de secours pour les vieux téléphones." },
  { icon: "🌐", title: "Multi-réseaux", desc: "Google, Instagram, TikTok, WhatsApp : vous choisissez la cible." },
  { icon: "🔄", title: "Cible pilotable", desc: "Plaque reliée à votre page Caela : changez la destination depuis le dashboard, sans racheter." },
  { icon: "🚚", title: "Livraison gratuite", desc: "Offerte dès 69€ d'achat (Pack Établissement et Pack Réseau)." },
];

// Chemin de retour après connexion (?next=/link-account?ticket=...), whitelisté
// aux chemins internes seulement (jamais une URL externe — anti open-redirect).
function safeNext(): string {
  if (typeof window === "undefined") return "/dashboard";
  const n = new URLSearchParams(window.location.search).get("next") || "";
  return n.startsWith("/") && !n.startsWith("//") ? n : "/dashboard";
}

const NAV_LINKS: [string, string][] = [
  ["#services", "Services GMB"],
  ["#nfc", "Plaques NFC"],
  ["#pricing", "Tarifs"],
  ["/audit", "Audit gratuit 🔍"],
];

export default function HomeClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [next, setNext] = useState("/dashboard");
  const [navVisible, setNavVisible] = useState(true);
  const [showEcoBanner, setShowEcoBanner] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Topbar : masquée au défilement vers le bas, réaffichée immédiatement
  // au premier pixel remonté. Toujours visible tout en haut de page.
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y <= 80) setNavVisible(true);
      else if (y > lastY) setNavVisible(false);
      else if (y < lastY) setNavVisible(true);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setNext(safeNext()); }, []);

  // Bannière écosystème (Gagnify/Rewards) : apparaît une fois qu'on a montré
  // de l'engagement (scroll profond), jamais dès l'arrivée sur la page.
  // Un dismiss est retenu 7 jours en localStorage pour ne pas harceler un
  // visiteur qui revient plusieurs fois dans la semaine.
  //
  // Bug corrigé le 08/08 : le listener de scroll restait actif après une
  // fermeture. Sur mobile, le moindre rebond de défilement (iOS "rubber
  // band") redéclenchait setShowEcoBanner(true) juste après le clic sur la
  // croix — la bannière revenait aussitôt, perçue comme un bandeau cookies
  // qui « insiste ». Un ref suit maintenant l'état fermé en temps réel et
  // le handler s'arrête net dès la fermeture, sans attendre un remount.
  const ecoDismissedRef = useRef(false);
  useEffect(() => {
    const DISMISS_KEY = "rp_eco_banner_dismissed_until";
    const dismissedUntil = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (Date.now() < dismissedUntil) { ecoDismissedRef.current = true; return; }
    const onScroll = () => {
      if (!ecoDismissedRef.current && window.scrollY > 900) setShowEcoBanner(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function dismissEcoBanner() {
    ecoDismissedRef.current = true;
    localStorage.setItem("rp_eco_banner_dismissed_until", String(Date.now() + 7 * 86400_000));
    setShowEcoBanner(false);
  }

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
        router.push(next);
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
    <div style={{ background: "#fff", color: "#202124", paddingBottom: showEcoBanner && isMobile ? "60px" : 0 }}>

      {/* ── TRUST STRIP ── */}
      <div style={{ background: G.blue, padding: "9px 40px", display: "flex", alignItems: "center", justifyContent: "center", gap: "28px", flexWrap: "wrap" }}>
        {[
          { icon: "🇫🇷", label: "Made in France" },
          { icon: "🔒", label: "RGPD conforme" },
          { icon: "✅", label: "API Google officielle" },
          { icon: "💬", label: "Support en français" },
          { icon: "⭐", label: "14 jours d'essai gratuit" },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ fontSize: "13px" }}>{item.icon}</span>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #DADCE0",
        padding: isMobile ? "0 16px" : "0 40px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between",
        transform: navVisible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.25s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flexShrink: 1 }}>
          <GDots size={9} />
          <span style={{ fontSize: isMobile ? "16px" : "20px", fontWeight: 700, color: "#202124", letterSpacing: "-0.3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Caela Réputation</span>
          {!isMobile && (
            <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", background: "#E8F0FE", color: G.blue, borderRadius: "12px" }}>by Caela</span>
          )}
        </div>

        {/* Desktop: liens + CTA */}
        {!isMobile && (
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            {NAV_LINKS.map(([href, label]) => (
              <a
                key={href} href={href}
                style={{ padding: "8px 14px", fontSize: "14px", fontWeight: 500, color: "#5F6368", textDecoration: "none", borderRadius: "24px", transition: "color 0.15s ease, background 0.15s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = G.blue; e.currentTarget.style.background = "#E8F0FE"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#5F6368"; e.currentTarget.style.background = "transparent"; }}
              >{label}</a>
            ))}
            <a href="#login" style={{ padding: "9px 16px", fontSize: "14px", fontWeight: 600, color: G.blue, textDecoration: "none", borderRadius: "6px", marginLeft: "8px" }}>
              Se connecter
            </a>
            <a href="/signup" style={{ padding: "9px 20px", fontSize: "14px", fontWeight: 600, background: G.blue, color: "#fff", textDecoration: "none", borderRadius: "6px" }}>
              Essai gratuit
            </a>
          </div>
        )}

        {/* Mobile: CTA compact toujours visible + burger */}
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <a href="/signup" style={{ padding: "8px 14px", fontSize: "13px", fontWeight: 600, background: G.blue, color: "#fff", textDecoration: "none", borderRadius: "6px", whiteSpace: "nowrap" }}>
              Essai gratuit
            </a>
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              style={{
                flexShrink: 0,
                width: "40px", height: "40px",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: "4px",
                background: menuOpen ? "#E8F0FE" : "transparent",
                border: "1px solid #DADCE0", borderRadius: "10px",
                cursor: "pointer", padding: 0,
              }}
            >
              <span style={{ display: "block", width: "16px", height: "2px", background: "#202124", borderRadius: "2px" }} />
              <span style={{ display: "block", width: "16px", height: "2px", background: "#202124", borderRadius: "2px" }} />
              <span style={{ display: "block", width: "16px", height: "2px", background: "#202124", borderRadius: "2px" }} />
            </button>
          </div>
        )}
      </nav>

      {/* CTA persistant : quand la nav se masque au défilement, "Se connecter"
          et "Essai gratuit" restent joignables via ce mini-groupe flottant —
          jamais de moment où le visiteur scrolle sans pouvoir agir. */}
      <div style={{
        position: "fixed", top: "12px", right: isMobile ? "12px" : "40px", zIndex: 101,
        display: "flex", alignItems: "center", gap: "6px",
        opacity: navVisible ? 0 : 1,
        pointerEvents: navVisible ? "none" : "auto",
        transition: "opacity 0.25s ease",
        background: "#fff", border: "1px solid #DADCE0", borderRadius: "24px",
        padding: "5px 5px 5px 14px", boxShadow: SHADOW_MD,
      }}>
        {!isMobile && (
          <a href="#login" style={{ padding: "6px 10px", fontSize: "13px", fontWeight: 600, color: G.blue, textDecoration: "none" }}>
            Se connecter
          </a>
        )}
        <a href="/signup" style={{ padding: "7px 16px", fontSize: "13px", fontWeight: 600, background: G.blue, color: "#fff", textDecoration: "none", borderRadius: "20px", whiteSpace: "nowrap" }}>
          Essai gratuit
        </a>
      </div>

      {/* Mobile: panneau déroulant */}
      {isMobile && menuOpen && (
        <div style={{
          position: "sticky", top: "64px", zIndex: 99,
          background: "#fff", borderBottom: "1px solid #DADCE0",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          padding: "10px 16px 14px",
          display: "flex", flexDirection: "column", gap: "2px",
        }}>
          {NAV_LINKS.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)} style={{
              padding: "13px 14px", borderRadius: "10px",
              fontSize: "15px", fontWeight: 500, color: "#202124",
              textDecoration: "none",
            }}>{label}</a>
          ))}
          <a href="#login" onClick={() => setMenuOpen(false)} style={{
            marginTop: "6px", padding: "13px 14px",
            border: "1px solid #DADCE0", borderRadius: "10px",
            fontSize: "15px", fontWeight: 600, color: G.blue,
            textDecoration: "none", textAlign: "center",
          }}>
            Se connecter
          </a>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{ background: "linear-gradient(180deg, #F8F9FA 0%, #fff 100%)", padding: "80px 40px 96px", maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", gap: "64px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", background: "#E8F0FE", borderRadius: "24px", marginBottom: "28px" }}>
            <GDots size={7} />
            <span style={{ fontSize: "13px", fontWeight: 600, color: G.blue }}>Spécialiste Google Business Profile</span>
          </div>
          <h1 style={{ margin: "0 0 20px", fontSize: "clamp(36px, 5vw, 58px)", fontWeight: 700, letterSpacing: "-1.5px", lineHeight: 1.1, color: "#202124" }}>
            Vos avis <GL size={44} /><br />
            répondus. <span style={{ color: G.green }}>Automatiquement.</span>
          </h1>
          <p style={{ margin: "0 0 36px", fontSize: "18px", lineHeight: 1.65, color: "#5F6368", maxWidth: "480px" }}>
            Caela Réputation détecte chaque avis, répond aux 4-5★ en 30 secondes, et vous envoie par email 3 suggestions pour les avis négatifs. <strong>Un clic pour publier.</strong>
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
            <a href="/signup" style={{ padding: "13px 28px", background: G.blue, color: "#fff", textDecoration: "none", borderRadius: "6px", fontSize: "15px", fontWeight: 600, boxShadow: `0 2px 8px ${G.blue}40` }}>
              Essai gratuit 14 jours
            </a>
            <a href="/audit" style={{ padding: "13px 28px", background: "#fff", border: "1px solid #DADCE0", color: "#202124", textDecoration: "none", borderRadius: "6px", fontSize: "15px", fontWeight: 600, boxShadow: SHADOW_SM, display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{ fontSize: "16px" }}>🔍</span> Audit gratuit de ta fiche
            </a>
          </div>
          <p style={{ margin: "0 0 24px", fontSize: "12px", color: "#80868B" }}>
            14 jours pour tester. Carte requise, rappel 3 jours avant le premier prélèvement. Résiliation en 2 clics.
          </p>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {[
              { icon: "🇫🇷", label: "100% français", color: G.blue },
              { icon: "⚡", label: "Réponse en 30s", color: G.green },
              { icon: "🔒", label: "RGPD · API officielle", color: G.red },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "14px" }}>{item.icon}</span>
                <span style={{ fontSize: "12px", color: "#5F6368", fontWeight: 500 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px", alignItems: "center" }}>
          <div style={{ width: "320px", maxWidth: "100%", boxSizing: "border-box", background: "#fff", border: "1px solid #DADCE0", borderRadius: "24px", padding: "10px 18px", display: "flex", alignItems: "center", gap: "10px", boxShadow: SHADOW_SM }}>
            <GDots size={7} />
            <span style={{ flex: 1, fontSize: "13px", color: "#5F6368" }}>restaurant le cèdre paris</span>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke={G.blue} strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
          <GMBCard />
        </div>
      </section>

      {/* ── METRICS ── */}
      <div style={{ background: "#F8F9FA", borderTop: "1px solid #DADCE0", borderBottom: "1px solid #DADCE0" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexWrap: "wrap" }}>
          {[
            { value: "4-5★", label: "Réponse automatique", color: G.yellow },
            { value: "< 30s", label: "Délai de réponse IA", color: G.green },
            { value: "3 tons", label: "Suggestions par avis négatif", color: G.blue },
            { value: "24/7", label: "Surveillance active", color: G.red },
          ].map((s, i) => (
            <div key={s.label} style={{ flex: 1, minWidth: "150px", padding: "26px 20px", textAlign: "center", borderRight: i < 3 ? "1px solid #DADCE0" : "none" }}>
              <div style={{ fontSize: "26px", fontWeight: 700, color: s.color, letterSpacing: "-0.5px" }}>{s.value}</div>
              <div style={{ fontSize: "12px", color: "#5F6368", marginTop: "3px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CALCULATOR ── */}
      <section id="calculator" style={{ padding: "80px 40px", maxWidth: "860px", margin: "0 auto" }}>
        <ROICalculator />
      </section>

      {/* ── FLOW 2★ ── */}
      <section style={{ background: "#F8F9FA", borderTop: "1px solid #DADCE0", padding: "80px 40px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, letterSpacing: "-0.8px", color: "#202124" }}>
              Comment ça fonctionne
            </h2>
            <p style={{ margin: 0, fontSize: "15px", color: "#5F6368" }}>
              Vous recevez la réponse dans votre email. 1 clic. Publié sur Google.
            </p>
          </div>
          <ReviewFlow />
        </div>
      </section>

      {/* ── WHY NOT DIY ── */}
      <section style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "44px" }}>
            <div style={{ display: "inline-block", padding: "4px 14px", background: "#FCE8E6", borderRadius: "24px", fontSize: "12px", fontWeight: 600, color: G.red, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.6px" }}>
              "Je peux le faire moi-même"
            </div>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, letterSpacing: "-0.8px", color: "#202124" }}>
              Techniquement oui. Intelligemment non.
            </h2>
            <p style={{ margin: "0 auto", maxWidth: "480px", fontSize: "15px", color: "#5F6368", lineHeight: 1.6 }}>
              Répondre manuellement c&apos;est gratuit. Jusqu&apos;à ce que tu calcules ce que ça coûte vraiment.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", marginBottom: "20px" }}>
            {DIY_ARGS.map(a => (
              <div key={a.title} style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", padding: "22px", boxShadow: SHADOW_SM }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <div style={{ width: "38px", height: "38px", background: a.bg, borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px" }}>{a.icon}</div>
                  <span style={{ fontSize: "18px", fontWeight: 700, color: a.color }}>{a.stat}</span>
                </div>
                <h3 style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 600, color: "#202124" }}>{a.title}</h3>
                <p style={{ margin: 0, fontSize: "13px", color: "#5F6368", lineHeight: 1.6 }}>{a.desc}</p>
              </div>
            ))}
          </div>

          {/* Comparison */}
          <div style={{ background: "#F8F9FA", border: "1px solid #DADCE0", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              <div style={{ padding: "24px 28px", borderRight: "1px solid #DADCE0" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: G.red, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>✗ Sans Caela Réputation</div>
                {["Tu réalises à J+3 qu'un avis 1★ attend une réponse", "Tu écris la même réponse générique pour la 12ème fois", "Tu réponds énervé. Ça se voit et ça coûte des clients", "3h/semaine perdues sur les avis au lieu de gérer", "Ta note stagne. Les concurrents qui répondent vite te dépassent"].map(item => (
                  <div key={item} style={{ display: "flex", gap: "8px", marginBottom: "9px" }}>
                    <span style={{ color: G.red, fontWeight: 700, flexShrink: 0 }}>✗</span>
                    <span style={{ fontSize: "13px", color: "#5F6368" }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "24px 28px", background: "#fff" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: G.green, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>✓ Avec Caela Réputation</div>
                {["Réponse en 30 secondes, 24h/24, même la nuit du réveillon", "Chaque réponse cite le prénom et un détail. Jamais générique.", "Pour les avis négatifs : 3 tons calibrés. Tu choisis en 1 clic.", "Taux de réponse >95%. Google t'en récompense sur Maps.", "Ta note monte. L'IA travaille. Tu dors."].map(item => (
                  <div key={item} style={{ display: "flex", gap: "8px", marginBottom: "9px" }}>
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
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 700, letterSpacing: "-0.8px", color: "#202124" }}>
              Pourquoi Caela Réputation ?
            </h2>
            <p style={{ margin: 0, fontSize: "14px", color: "#5F6368" }}>Comparaison honnête. Aucun concurrent français ne propose l&apos;IA auto-réponse à ce prix.</p>
          </div>
          <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", overflowX: "auto", boxShadow: SHADOW_SM }}>
            <table style={{ width: "100%", minWidth: "640px", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8F9FA" }}>
                  {["Solution", "Solo", "Multi-lieux", "IA auto", "FR", "Google", "Essai gratuit"].map(col => (
                    <th key={col} style={{ padding: "11px 14px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#5F6368", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #DADCE0" }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPETITORS.map((c, i) => (
                  <tr key={c.name} style={{ background: c.highlight ? "#E8F0FE" : "transparent", borderBottom: i < COMPETITORS.length - 1 ? "1px solid #DADCE0" : "none" }}>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontSize: "13px", fontWeight: c.highlight ? 700 : 500, color: c.highlight ? G.blue : "#202124" }}>
                        {c.name}
                        {c.highlight && <span style={{ marginLeft: "6px", fontSize: "10px", background: G.blue, color: "#fff", padding: "2px 6px", borderRadius: "10px" }}>Vous</span>}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: "13px", fontWeight: c.highlight ? 700 : 400, color: c.highlight ? G.green : "#202124" }}>{c.solo}</td>
                    <td style={{ padding: "12px 14px", fontSize: "13px", color: c.highlight ? G.green : "#202124", fontWeight: c.highlight ? 700 : 400 }}>{c.business}</td>
                    <td style={{ padding: "12px 14px" }}><span style={{ fontSize: "14px" }}>{c.aiAuto ? "✅" : "❌"}</span></td>
                    <td style={{ padding: "12px 14px" }}><span style={{ fontSize: "14px" }}>{c.fr ? "✅" : "❌"}</span></td>
                    <td style={{ padding: "12px 14px" }}><span style={{ fontSize: "14px" }}>{c.gmb ? "✅" : "❌"}</span></td>
                    <td style={{ padding: "12px 14px" }}><span style={{ fontSize: "14px" }}>{c.trial ? "✅" : "❌"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ textAlign: "center", fontSize: "11px", color: "#80868B", marginTop: "10px" }}>
            * Prix indicatifs publics 2025-2026.
          </p>

          {/* Why not the US tool */}
          <div style={{ marginTop: "20px", background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", padding: "24px 28px", boxShadow: SHADOW_SM }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "220px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: G.red, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                  🇺🇸 getreviewpilot.ai existe. Pourquoi choisir le français ?
                </div>
                <p style={{ margin: 0, fontSize: "13px", color: "#5F6368", lineHeight: 1.65 }}>
                  L&apos;outil américain utilise le même Claude AI et coûte $29/mois. Mais il est en anglais, sans support FR, sans conformité RGPD, sans compréhension des subtilités du marché local français. Quand un client parisien écrit &quot;c&apos;est pas top&quot;, l&apos;outil FR comprend le registre. L&apos;américain traduit mot à mot.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "200px" }}>
                {[
                  { label: "Réponses en français naturel", ok: true },
                  { label: "Support humain en français", ok: true },
                  { label: "RGPD — données en Europe", ok: true },
                  { label: "NFC plaques physiques", ok: true },
                  { label: "Services GMB inclus", ok: true },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ color: G.green, fontWeight: 700, fontSize: "13px" }}>{item.ok ? "✓" : "✗"}</span>
                    <span style={{ fontSize: "12px", color: "#5F6368" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VIDÉOS EXPLICATIVES (bientôt) ── */}
      <section style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <div style={{ display: "inline-block", padding: "4px 14px", background: "#E8F0FE", borderRadius: "24px", fontSize: "12px", fontWeight: 600, color: G.blue, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.6px" }}>
              🎬 Bientôt disponible
            </div>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, letterSpacing: "-0.8px", color: "#202124" }}>
              8 vidéos de quelques minutes pour tout comprendre
            </h2>
            <p style={{ margin: "0 auto", maxWidth: "540px", fontSize: "14px", color: "#5F6368", lineHeight: 1.6 }}>
              Un sujet, une réponse claire. De la gestion des avis aux plaques NFC, en passant par le comparatif honnête avec le faire-soi-même. En cours de tournage.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
            {VIDEO_TOPICS.map(v => (
              <div key={v.title} style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", padding: "18px", boxShadow: SHADOW_SM, position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "22px" }}>{v.icon}</span>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: G.blue, background: "#E8F0FE", padding: "2px 8px", borderRadius: "10px" }}>{v.duration}</span>
                </div>
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#202124", lineHeight: 1.45 }}>{v.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "44px" }}>
            <div style={{ display: "inline-block", padding: "4px 14px", background: "#FEF7E0", borderRadius: "24px", fontSize: "12px", fontWeight: 600, color: "#F9AB00", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.6px" }}>
              Exemples de réponses
            </div>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, letterSpacing: "-0.8px", color: "#202124" }}>
              Le type de réponses générées
            </h2>
            <p style={{ margin: 0, fontSize: "14px", color: "#5F6368" }}>Scénarios illustratifs. Caela Réputation est en lancement.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "14px", padding: "26px", boxShadow: SHADOW_SM }}>
                <div style={{ display: "flex", gap: "3px", marginBottom: "14px" }}>
                  {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: "14px", color: i <= t.rating ? G.yellow : "#DADCE0" }}>★</span>)}
                </div>
                <p style={{ margin: "0 0 18px", fontSize: "14px", color: "#202124", lineHeight: 1.7, fontStyle: "italic" }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: G.blue + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: G.blue }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#202124" }}>{t.name}</div>
                    <div style={{ fontSize: "11px", color: "#5F6368" }}>{t.role}</div>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <GDots size={6} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES CAELA ── */}
      <section id="services" style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "44px" }}>
            <div style={{ display: "inline-block", padding: "4px 14px", background: "#E6F4EA", borderRadius: "24px", fontSize: "12px", fontWeight: 600, color: G.green, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Caela Agency</div>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 700, letterSpacing: "-0.8px", color: "#202124" }}>
              On gère votre présence <GL size={30} />
            </h2>
            <p style={{ margin: "0 auto", maxWidth: "460px", fontSize: "15px", color: "#5F6368", lineHeight: 1.6 }}>
              Caela Réputation automatise vos réponses. Caela s&apos;occupe du reste: création, optimisation, visibilité.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px" }}>
            {GMB_SERVICES.map(s => (
              <div key={s.title} style={{ background: "#fff", border: s.highlight ? `2px solid ${s.color}` : "1px solid #DADCE0", borderRadius: "12px", padding: "24px", boxShadow: s.highlight ? `0 4px 16px ${s.color}20` : SHADOW_SM, position: "relative", overflow: "hidden" }}>
                {s.highlight && <div style={{ position: "absolute", top: "13px", right: "13px", padding: "2px 10px", background: s.bg, borderRadius: "20px", fontSize: "10px", fontWeight: 700, color: s.color }}>Recommandé</div>}
                <div style={{ width: "42px", height: "42px", background: s.bg, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "19px", marginBottom: "12px" }}>{s.icon}</div>
                <div style={{ fontSize: "10px", fontWeight: 600, color: s.color, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{s.tag}</div>
                <h3 style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 600, color: "#202124" }}>{s.title}</h3>
                <p style={{ margin: "0 0 14px", fontSize: "13px", color: "#5F6368", lineHeight: 1.6 }}>{s.desc}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "20px", fontWeight: 700, color: s.color }}>{s.price}</span>
                  {s.oldPrice && <span style={{ fontSize: "13px", color: "#80868B", textDecoration: "line-through" }}>{s.oldPrice}</span>}
                </div>
                <a href="mailto:contact@caela.fr" style={{ display: "block", textAlign: "center", padding: "10px", background: s.highlight ? s.color : s.bg, borderRadius: "6px", color: s.highlight ? "#fff" : s.color, textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>Contacter →</a>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "18px", background: "linear-gradient(135deg, #E8F0FE, #E6F4EA)", border: "1px solid #DADCE0", borderRadius: "12px", padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}><GDots size={8} /><span style={{ fontSize: "12px", fontWeight: 600, color: "#5F6368" }}>Client de l&apos;un de nos 3 packs GMB</span></div>
              <h3 style={{ margin: "0 0 3px", fontSize: "17px", fontWeight: 700, color: "#202124" }}>-20% sur vos plaques NFC</h3>
              <p style={{ margin: 0, fontSize: "12px", color: "#5F6368" }}>Tout client Pack Lancement, Pack Croissance ou Pack Avis bénéficie de -20% sur un pack de plaques NFC (voir plus bas). Code envoyé par email à la souscription.</p>
            </div>
            <a href="mailto:contact@caela.fr" style={{ padding: "11px 24px", background: G.blue, color: "#fff", textDecoration: "none", borderRadius: "6px", fontSize: "14px", fontWeight: 600, boxShadow: `0 2px 8px ${G.blue}40`, whiteSpace: "nowrap" }}>
              Demander un audit gratuit
            </a>
          </div>

          {/* Option complémentaire, discrète : proposition à valider avant de la
              pousser plus fort (visuel dédié, prix figé, checkout). */}
          <div style={{ marginTop: "12px", background: "#fff", border: "1px dashed #DADCE0", borderRadius: "12px", padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "22px" }}>🖥️</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#202124" }}>Option : landing page pour votre établissement</div>
                  <div style={{ fontSize: "12px", color: "#5F6368" }}>Une page qui centralise vos avis, vos infos pratiques et le lien vers votre fiche Google — utile pour vos réseaux et votre bio Instagram.</div>
                </div>
              </div>
              <a href="mailto:contact@caela.fr?subject=Option%20landing%20page" style={{ padding: "9px 18px", border: `1px solid ${G.blue}`, color: G.blue, textDecoration: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap" }}>
                En discuter →
              </a>
            </div>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#80868B", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Ce qu&apos;on a déjà livré</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
              {LANDING_EXAMPLES.map(ex => (
                <a key={ex.name} href={ex.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: "12px 14px", background: "#F8F9FA", border: "1px solid #DADCE0", borderRadius: "10px", textDecoration: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "3px" }}>
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: ex.color, flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#202124" }}>{ex.name}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#5F6368", marginBottom: "2px" }}>{ex.desc}</div>
                  <div style={{ fontSize: "11px", color: ex.color, fontWeight: 500 }}>Voir le site →</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── NFC PLATES ── */}
      <section id="nfc" style={{ background: "#F8F9FA", borderTop: "1px solid #DADCE0", padding: "80px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "44px" }}>
            <div style={{ display: "inline-block", padding: "4px 14px", background: "#E8F0FE", borderRadius: "24px", fontSize: "12px", fontWeight: 600, color: G.blue, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.6px" }}>
              Produit physique
            </div>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, letterSpacing: "-0.8px", color: "#202124" }}>
              Collectez 3× plus d&apos;avis avec nos plaques NFC
            </h2>
            <p style={{ margin: "0 auto", maxWidth: "500px", fontSize: "15px", color: "#5F6368", lineHeight: 1.6 }}>
              Posez la plaque sur votre comptoir. Votre client tape avec son téléphone. Il est directement sur votre fiche Google. Il laisse un avis en 30 secondes.
            </p>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "28px" }}>
              <NFCPlateVisual size={240} />
            </div>
          </div>

          {/* How it works */}
          <div style={{ display: "flex", gap: "0", marginBottom: "40px", background: "#fff", border: "1px solid #DADCE0", borderRadius: "14px", overflow: "hidden" }}>
            {[
              { step: "1", icon: "📱", title: "Le client tape la plaque", desc: "N'importe quel téléphone (iOS + Android). Pas d'app à installer.", color: G.blue },
              { step: "2", icon: "⭐", title: "Il arrive sur votre fiche", desc: "Directement sur la page Google Reviews de votre établissement.", color: G.yellow },
              { step: "3", icon: "✅", title: "Il laisse son avis", desc: "En 30 secondes. Caela Réputation prend le relais pour y répondre.", color: G.green },
            ].map((s, i) => (
              <div key={s.title} style={{ flex: 1, padding: "24px 20px", textAlign: "center", borderRight: i < 2 ? "1px solid #DADCE0" : "none" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: s.color + "15", margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{s.icon}</div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: s.color, marginBottom: "5px" }}>ÉTAPE {s.step}</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#202124", marginBottom: "4px" }}>{s.title}</div>
                <div style={{ fontSize: "12px", color: "#5F6368" }}>{s.desc}</div>
              </div>
            ))}
          </div>

          {/* Plaque seule vs plaque + moteur — réponse aux concurrents hardware (bostap & co) */}
          <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "14px", overflow: "hidden", marginBottom: "40px" }}>
            <div style={{ padding: "24px 28px 4px", textAlign: "center" }}>
              <h3 style={{ margin: "0 0 6px", fontSize: "clamp(18px, 2.4vw, 24px)", fontWeight: 700, color: "#202124", letterSpacing: "-0.5px" }}>
                Une plaque NFC coûte 20€. Ce qu&apos;on en fait ensuite, c&apos;est tout l&apos;enjeu.
              </h3>
              <p style={{ margin: "0 auto 4px", maxWidth: "560px", fontSize: "14px", color: "#5F6368", lineHeight: 1.6 }}>
                La plupart des plaques du marché envoient le client sur Google. Puis plus rien. Nous, la plaque n&apos;est que le point de départ.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              <div style={{ padding: "24px 28px", borderRight: "1px solid #DADCE0" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#80868B", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Une plaque NFC seule</div>
                {[
                  "Envoie le client sur votre fiche Google. C'est tout.",
                  "Le client scanne, part, et disparaît. Aucun contact récupéré.",
                  "Un avis négatif part directement en public. Aucun filtre.",
                  "Aucune réponse aux avis. Vous rédigez tout, à la main.",
                  "Zéro donnée : ni suivi des scans, ni note, ni tendance.",
                  "Rien à afficher sur votre site. Les avis restent sur Google.",
                ].map(item => (
                  <div key={item} style={{ display: "flex", gap: "8px", marginBottom: "9px" }}>
                    <span style={{ color: "#BDC1C6", fontWeight: 700, flexShrink: 0 }}>✗</span>
                    <span style={{ fontSize: "13px", color: "#5F6368", lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "24px 28px", background: "#F6FBF7" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: G.green, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>La plaque + le moteur Caela Réputation</div>
                {[
                  "Collecte les avis ET les exploite : l'IA répond en 30 secondes.",
                  "Roue de la fortune (propulsée par Gagnify) : le client laisse son email/SMS avant de jouer. Vous gardez le contact.",
                  "Les mécontents sont invités à vous écrire en privé d'abord.",
                  "Chaque avis négatif : 3 réponses prêtes, 1 clic pour publier.",
                  "Dashboard : note, volume, tendance, rapport hebdo par email.",
                  "Widget d'avis + étoiles dans Google (rich snippets) sur votre site.",
                ].map(item => (
                  <div key={item} style={{ display: "flex", gap: "8px", marginBottom: "9px" }}>
                    <span style={{ color: G.green, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: "13px", color: "#202124", lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* NFC Packs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
            {NFC_PACKS.map(p => (
              <div key={p.name} style={{ background: "#fff", border: p.highlight ? `2px solid ${p.color}` : "1px solid #DADCE0", borderRadius: "12px", padding: "24px", boxShadow: p.highlight ? `0 4px 16px ${p.color}20` : SHADOW_SM, position: "relative" }}>
                {p.highlight && <div style={{ position: "absolute", top: "13px", right: "13px", padding: "2px 10px", background: p.color + "15", borderRadius: "20px", fontSize: "10px", fontWeight: 700, color: p.color }}>Le plus populaire</div>}
                <div style={{ fontSize: "11px", fontWeight: 600, color: p.color, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{p.qty}</div>
                <h3 style={{ margin: "0 0 6px", fontSize: "17px", fontWeight: 700, color: "#202124" }}>{p.name}</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{ fontSize: "26px", fontWeight: 800, color: p.color }}>{p.price}</span>
                  {p.oldPrice && <span style={{ fontSize: "14px", color: "#80868B", textDecoration: "line-through" }}>{p.oldPrice}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "12px", color: "#5F6368" }}>{p.unit}</span>
                  {p.oldPrice && (
                    <span style={{ padding: "1px 7px", background: p.color + "15", borderRadius: "10px", fontSize: "10px", fontWeight: 700, color: p.color }}>
                      Économisez {parseInt(p.oldPrice) - parseInt(p.price)}€
                    </span>
                  )}
                </div>
                {p.features.map(f => (
                  <div key={f} style={{ display: "flex", gap: "8px", marginBottom: "7px" }}>
                    <span style={{ color: p.color, fontWeight: 700, fontSize: "12px" }}>✓</span>
                    <span style={{ fontSize: "13px", color: "#5F6368" }}>{f}</span>
                  </div>
                ))}
                <a href="mailto:contact@caela.fr" style={{ display: "block", textAlign: "center", marginTop: "18px", padding: "10px", background: p.highlight ? p.color : p.color + "15", border: `1px solid ${p.color}30`, borderRadius: "6px", color: p.highlight ? "#fff" : p.color, textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
                  Commander →
                </a>
              </div>
            ))}
          </div>

          {/* Bande de réassurance — aligne nos garanties sur les concurrents hardware.
              Une seule ligne qui défile horizontalement : 5 items en grid retombaient
              sur 2 rangées inégales (4 + 1), moins lisible qu'un scroll. */}
          <div style={{ marginTop: "16px", display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "6px", scrollbarWidth: "thin" }}>
            {NFC_REASSURANCE.map(r => (
              <div key={r.title} style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "10px", padding: "16px 18px", display: "flex", gap: "12px", alignItems: "flex-start", flexShrink: 0, width: "260px" }}>
                <span style={{ fontSize: "20px", flexShrink: 0 }}>{r.icon}</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#202124", marginBottom: "3px" }}>{r.title}</div>
                  <div style={{ fontSize: "12px", color: "#5F6368", lineHeight: 1.5 }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "12px", background: "#fff", border: "1px solid #DADCE0", borderRadius: "10px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "20px" }}>💡</span>
            <p style={{ margin: 0, fontSize: "13px", color: "#5F6368", lineHeight: 1.5 }}>
              <strong style={{ color: "#202124" }}>Combo gagnant:</strong> Plaque NFC (collecte les avis) + Caela Réputation (répond automatiquement). Plus d&apos;avis = meilleur référencement Google Maps = plus de clients.
              {" "}<strong style={{ color: G.green }}>-20% sur ce pack</strong> si vous êtes déjà client Pack Lancement ou Pack Croissance (voir ci-dessus).
            </p>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      {/* id="tarifs" en alias : ancre stable utilisée par les CTA "Voir les tarifs"
          du dashboard, en plus de #pricing déjà référencé ailleurs sur la page. */}
      <div id="tarifs" style={{ position: "relative", top: "-1px" }} />
      <section id="pricing" style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "44px" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 700, letterSpacing: "-0.8px", color: "#202124" }}>
              Tarifs simples. Dès 29€/mois.
            </h2>
            <p style={{ margin: "0 0 14px", fontSize: "15px", color: "#5F6368" }}>Sans engagement. Annulez quand vous voulez.</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "#E6F4EA", borderRadius: "20px", marginBottom: "18px" }}>
              <span style={{ fontSize: "16px" }}>✨</span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#1E7A3D" }}>14 jours d&apos;essai gratuit — votre première réponse IA à un avis négatif, offerte dès le premier jour</span>
            </div>
            <div style={{ display: "inline-flex", background: "#F8F9FA", border: "1px solid #DADCE0", borderRadius: "8px", padding: "3px", gap: "2px", boxShadow: SHADOW_SM }}>
              {(["monthly", "annual"] as const).map(b => (
                <button key={b} onClick={() => setBilling(b)} style={{ padding: "8px 18px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 500, background: billing === b ? G.blue : "transparent", color: billing === b ? "#fff" : "#5F6368", fontFamily: "inherit" }}>
                  {b === "monthly" ? "Mensuel" : <span>Annuel <span style={{ color: billing === b ? "#bef7d7" : G.green, fontSize: "11px", fontWeight: 700 }}>-20%</span></span>}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "14px", alignItems: "start" }}>
            {PLANS.map(plan => {
              const price = billing === "annual" ? Math.round(parseInt(plan.price) * 0.8) : parseInt(plan.price);
              const savings = parseInt(plan.price) * 12 - price * 12;
              return (
                <div style={{
                  background: "#fff",
                  border: plan.highlight ? `2px solid ${plan.color}` : "1px solid #DADCE0",
                  borderRadius: "14px",
                  padding: plan.highlight ? "30px 20px 24px" : "24px 20px",
                  boxShadow: plan.highlight ? `0 12px 28px ${plan.color}28` : SHADOW_SM,
                  position: "relative",
                  overflow: "hidden",
                  transform: plan.highlight ? "translateY(-10px)" : "none",
                  zIndex: plan.highlight ? 1 : 0,
                }} key={plan.name}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: plan.color }} />
                  {plan.highlight && <div style={{ position: "absolute", top: "12px", right: "14px", padding: "2px 8px", background: plan.color + "15", borderRadius: "20px", fontSize: "9px", fontWeight: 700, color: plan.color }}>POPULAIRE</div>}
                  <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: 700, color: plan.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>{plan.name}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "3px", marginBottom: "3px" }}>
                    <span style={{ fontSize: "34px", fontWeight: 700, color: "#202124", letterSpacing: "-1px" }}>{price}€</span>
                    <span style={{ fontSize: "12px", color: "#5F6368" }}>/mois</span>
                  </div>
                  <p style={{ margin: "0 0 4px", fontSize: "12px", color: "#5F6368" }}>{plan.desc}</p>
                  {billing === "annual" && <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", background: "#E6F4EA", borderRadius: "20px", fontSize: "11px", fontWeight: 700, color: G.green, marginBottom: "8px" }}>🎁 -{savings}€/an</div>}
                  <div style={{ fontSize: "11px", color: plan.color, marginBottom: "14px", fontWeight: 500 }}>{plan.best}</div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "18px" }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: "flex", gap: "7px" }}>
                        <span style={{ color: plan.color, fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: "12px", color: "#5F6368", lineHeight: 1.4 }}>{f}</span>
                      </div>
                    ))}
                    {plan.missing.map(f => (
                      <div key={f} style={{ display: "flex", gap: "7px" }}>
                        <span style={{ color: "#DADCE0", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>—</span>
                        <span style={{ fontSize: "12px", color: "#DADCE0", lineHeight: 1.4 }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <a href="/signup" style={{ display: "block", textAlign: "center", padding: "10px", background: plan.highlight ? plan.color : plan.color + "12", border: `1px solid ${plan.color}${plan.highlight ? "00" : "25"}`, borderRadius: "6px", color: plan.highlight ? "#fff" : plan.color, textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
                    {plan.cta}
                  </a>
                </div>
              );
            })}
          </div>

          {/* Mention légale de facturation (art. L221-5 Code conso) — anti dark pattern */}
          <div style={{ marginTop: "20px", maxWidth: "720px", margin: "20px auto 0", textAlign: "center" }}>
            <p style={{ fontSize: "12px", lineHeight: 1.6, color: "#80868B", margin: 0 }}>
              Essai gratuit de 14 jours, <strong>carte bancaire requise</strong>. À la fin de l&apos;essai,
              votre abonnement démarre automatiquement au tarif affiché, <strong>sauf résiliation avant la fin de l&apos;essai</strong>.
              Résiliable à tout moment en ligne en 2 clics. Un email de rappel vous est envoyé 3 jours avant le premier prélèvement.
              Voir les <a href="/cgv" style={{ color: G.blue, textDecoration: "none" }}>CGV</a>.
            </p>
          </div>

          {/* Agency discreet line */}
          <div style={{ marginTop: "12px", textAlign: "center" }}>
            <span style={{ fontSize: "13px", color: "#80868B" }}>
              Vous gérez 5+ établissements ?{" "}
              {/* Visait l'ancre #contact, qui n'existe sur aucune section de
                  cette page : le lien ne faisait rien, sans erreur ni 404. Un
                  prospect Plan Agence à 449 €/mois n'avait aucun moyen de nous
                  joindre depuis cette ligne. Même destination que le reste de
                  la page de tarifs. */}
              <a
                href="mailto:contact@caela.fr?subject=Plan%20Agence%20-%205%20etablissements%20ou%20plus"
                style={{ color: G.blue, textDecoration: "none", fontWeight: 600 }}
              >
                Plan Agence à partir de 449€/mois →
              </a>
            </span>
          </div>

          {/* Parrainage */}
          <div style={{ marginTop: "20px", padding: "14px 20px", background: "#FEF7E0", borderRadius: "10px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "16px" }}>🎁</span>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#7A5C00", marginBottom: "2px" }}>Parrainez, économisez à deux</div>
              <div style={{ fontSize: "12px", color: "#5F6368" }}>Chaque client a son code de parrainage personnel, accessible depuis son dashboard. <strong>1 mois offert</strong> pour vous, <strong>-15% sur son premier mois</strong> pour la personne que vous parrainez. <a href="/parrainage" style={{ color: "#7A5C00", fontWeight: 600, textDecoration: "underline" }}>En savoir plus →</a></div>
            </div>
          </div>

          {/* Safety note */}
          <div style={{ marginTop: "12px", padding: "14px 20px", background: "#E8F0FE", borderRadius: "10px", display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <span style={{ fontSize: "16px" }}>🔒</span>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: G.blue, marginBottom: "2px" }}>Zéro risque pour votre fiche Google</div>
              <div style={{ fontSize: "12px", color: "#5F6368" }}>Caela Réputation utilise exclusivement l&apos;API officielle Google My Business. Les réponses sont publiées sous le nom de votre établissement, pas sous le nôtre. Vos clients ne savent pas que vous utilisez un outil. Conforme aux CGU Google.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGIN ── */}
      <section id="login" style={{ padding: "80px 40px", background: "#F8F9FA", borderTop: "1px solid #DADCE0" }}>
        <div style={{ maxWidth: "400px", margin: "0 auto" }}>
          <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "16px", padding: "40px", boxShadow: SHADOW_MD, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "14px" }}><GDots size={11} /></div>
            <h2 style={{ margin: "0 0 5px", fontSize: "21px", fontWeight: 700, color: "#202124" }}>Se connecter</h2>
            <p style={{ margin: "0 0 26px", color: "#5F6368", fontSize: "14px" }}>Accéder à votre dashboard Caela Réputation</p>

            <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
              {[
                { label: "Adresse email", type: "email", value: email, setter: setEmail, placeholder: "vous@exemple.fr" },
                { label: "Mot de passe", type: "password", value: password, setter: setPassword, placeholder: "••••••••" },
              ].map(field => (
                <div key={field.label} style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#202124", marginBottom: "5px" }}>{field.label}</label>
                  <input
                    type={field.type} value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    placeholder={field.placeholder} required
                    style={{ width: "100%", padding: "11px 14px", border: "1px solid #DADCE0", borderRadius: "6px", fontSize: "14px", color: "#202124", outline: "none", boxSizing: "border-box", background: "#fff", fontFamily: "inherit" }}
                    onFocus={(e) => { e.target.style.borderColor = G.blue; e.target.style.boxShadow = `0 0 0 2px ${G.blue}20`; }}
                    onBlur={(e) => { e.target.style.borderColor = "#DADCE0"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              ))}

              {error && <div style={{ padding: "10px 14px", background: "#FCE8E6", borderRadius: "6px", color: G.red, fontSize: "13px", marginBottom: "14px" }}>⚠ {error}</div>}

              <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", background: loading ? `${G.blue}80` : G.blue, border: "none", borderRadius: "6px", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                {loading ? "Connexion..." : "Se connecter"}
              </button>
              <div style={{ textAlign: "center", marginTop: "12px" }}>
                <a href="/mot-de-passe-oublie" style={{ fontSize: "13px", color: G.blue, fontWeight: 600, textDecoration: "none" }}>Mot de passe oublié ?</a>
              </div>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "20px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "#DADCE0" }} />
              <span style={{ fontSize: "12px", color: "#80868B", fontWeight: 500 }}>Ou</span>
              <div style={{ flex: 1, height: "1px", background: "#DADCE0" }} />
            </div>

            <a
              href="https://caela-hub.vercel.app/api/sso/avis"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "11px", background: "#fff", border: "1px solid #DADCE0", borderRadius: "6px", color: "#202124", fontSize: "14px", fontWeight: 600, textDecoration: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#F8F9FA"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
            >
              <GDots size={7} />
              Se connecter avec Caela
            </a>

            <p style={{ textAlign: "center", marginTop: "18px", fontSize: "13px", color: "#5F6368" }}>
              Pas encore de compte ?{" "}
              <a href="/signup" style={{ color: G.blue, fontWeight: 600, textDecoration: "none" }}>Créer un compte</a>
            </p>
            <p style={{ textAlign: "center", marginTop: "10px", fontSize: "11px", color: "#80868B" }}>Caela Réputation by Caela Agency</p>
          </div>
        </div>
      </section>

      {/* ── ÉCOSYSTÈME CAELA ── */}
      <section id="ecosysteme" style={{ background: "#F8F9FA", borderTop: "1px solid #DADCE0", padding: "48px 40px" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 10px", fontSize: "16px", fontWeight: 700, color: "#202124" }}>
            Fait partie de l&apos;écosystème Caela
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#5F6368", lineHeight: 1.6 }}>
            Un compte, tous vos outils : Réservation (Caelenda) · Fidélité (Rewards) · Jeux &amp; roues de la fortune (<a href="https://gagnify.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: G.blue, textDecoration: "underline" }}>Gagnify</a>) · Campagnes (Pulse) · QR dynamique (CaelaQR).
            <br />
            Connexion unique entre tous les produits.
          </p>
        </div>
      </section>

      {/* ── BANNIÈRE ÉCOSYSTÈME (Gagnify / Rewards) ──
          Corrigé le 08/08 : la version carte (2 paragraphes + 2 boutons)
          recouvrait le tableau comparatif sur mobile — chevauchement de
          contenu, contraire à la règle "zéro superposition". Sur mobile,
          c'est maintenant une barre fine sur une ligne, qui laisse une
          réserve à droite pour ne jamais chevaucher la bulle ChatBot
          (bas-droite, ~56px). Sur desktop la carte reste, l'espace ne
          manque pas et rien ne se superpose. */}
      {showEcoBanner && (
        isMobile ? (
          <div className="rp-banner-enter" style={{
            position: "fixed", bottom: "10px", left: "10px", right: "78px",
            zIndex: 90, background: "#202124", borderRadius: "14px", padding: "10px 12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)", display: "flex", gap: "8px", alignItems: "center",
          }}>
            <span className="rp-bounce-icon" style={{ fontSize: "18px", flexShrink: 0 }}>🎡</span>
            <p style={{ margin: 0, flex: 1, fontSize: "11px", color: "#fff", lineHeight: 1.35 }}>
              Gagnify + Rewards inclus dans votre compte Caela
            </p>
            <a href="#ecosysteme" onClick={() => setShowEcoBanner(false)} style={{ padding: "6px 10px", background: G.blue, color: "#fff", textDecoration: "none", borderRadius: "16px", fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
                Voir →
            </a>
            <button
              onClick={dismissEcoBanner}
              aria-label="Fermer"
              style={{ flexShrink: 0, width: "20px", height: "20px", borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.1)", color: "#BDC1C6", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
            >×</button>
          </div>
        ) : (
          <div className="rp-banner-enter" style={{
            position: "fixed", bottom: "24px", left: "24px",
            zIndex: 90, maxWidth: "320px",
            background: "#202124", borderRadius: "16px", padding: "16px 18px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.35)", display: "flex", gap: "12px", alignItems: "flex-start",
          }}>
            <span className="rp-bounce-icon" style={{ fontSize: "26px", flexShrink: 0 }}>🎡</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 6px", fontSize: "13px", fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                Le saviez-vous ? Votre compte Caela débloque une roue de la fortune (Gagnify) et un programme de fidélité (Rewards).
              </p>
              <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#BDC1C6", lineHeight: 1.5 }}>
                De quoi transformer chaque avis collecté en client qui revient.
              </p>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <a href="#ecosysteme" onClick={() => setShowEcoBanner(false)} style={{ padding: "7px 14px", background: G.blue, color: "#fff", textDecoration: "none", borderRadius: "20px", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap" }}>
                  Découvrir →
                </a>
                <button onClick={dismissEcoBanner} style={{ background: "none", border: "none", color: "#80868B", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", padding: "6px" }}>
                  Plus tard
                </button>
              </div>
            </div>
            <button
              onClick={dismissEcoBanner}
              aria-label="Fermer"
              style={{ position: "absolute", top: "8px", right: "8px", width: "22px", height: "22px", borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.1)", color: "#BDC1C6", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
            >×</button>
          </div>
        )
      )}

      <ChatBot />

      {/* ── FOOTER ── */}
      <footer style={{ background: "#fff", borderTop: "1px solid #DADCE0", padding: "28px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <GDots size={7} />
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#202124" }}>Caela Réputation by Caela Agency</span>
            </div>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {[
                { label: "Confidentialité", href: "/politique-de-confidentialite" },
                { label: "Mentions légales", href: "/mentions-legales" },
                { label: "CGV / CGU", href: "/cgv" },
                { label: "Cookies", href: "/politique-de-cookies" },
                { label: "Support", href: "mailto:contact@caela.fr" },
              ].map(link => (
                <a
                  key={link.label} href={link.href}
                  style={{ fontSize: "13px", color: "#5F6368", textDecoration: "none", transition: "color 0.15s ease" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = G.blue; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#5F6368"; }}
                >{link.label}</a>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid #DADCE0", paddingTop: "14px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#80868B" }}>
              © 2026 Caela Agency · contact@caela.fr · Tous droits réservés
            </p>
            <p style={{ margin: 0, fontSize: "11px", color: "#80868B" }}>
              Caela Réputation est un outil indépendant, non affilié à Google LLC. &quot;Google&quot; et &quot;Google Business Profile&quot; sont des marques de Google LLC.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
