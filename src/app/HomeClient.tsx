"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { trackClic } from "@/lib/analytics/client";

// Chargé après l'hydratation initiale (pas de SSR) : le chatbot n'est jamais
// nécessaire au premier rendu, retirer son JS du bundle critique allège le
// chargement de la page pour tous les visiteurs qui ne l'ouvrent jamais.
const ChatBot = dynamic(() => import("@/components/ChatBot"), { ssr: false });

const G = { blue: "#2457C5", red: "#D6455D", yellow: "#E0A11A", green: "#16856B" };
const SHADOW_SM = "0 1px 3px rgba(60,64,67,0.12), 0 1px 2px rgba(60,64,67,0.06)";
const SHADOW_MD = "0 2px 6px rgba(60,64,67,0.15), 0 1px 4px rgba(60,64,67,0.1)";
const SHADOW_LG = "0 4px 12px rgba(60,64,67,0.18), 0 2px 6px rgba(60,64,67,0.1)";
const SHADOW_XL = "0 14px 32px rgba(60,64,67,0.22), 0 4px 10px rgba(60,64,67,0.12)";

function GDots({ size = 8 }: { size?: number }) {
  return (
    <div style={{ display: "flex", gap: `${Math.round(size * 0.4)}px`, alignItems: "center" }}>
      {["#2457C5", "#5478CF", "#7F9BDD"].map((c, i) => (
        <div key={i} style={{ width: size, height: size, borderRadius: "50%", background: c }} />
      ))}
    </div>
  );
}

// Anime le texte lettre par lettre en boucle (effet machine à écrire), pour
// attirer l'œil sur le badge "objection" avant la section qui la démonte.
function TypewriterText({ text }: { text: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let i = 0;
    let deleting = false;
    const id = setInterval(() => {
      if (!deleting) {
        i++;
        setCount(i);
        if (i >= text.length) {
          deleting = true;
          setTimeout(() => { deleting = true; }, 0);
          clearInterval(id);
          setTimeout(runDelete, 1800);
        }
      }
    }, 55);
    function runDelete() {
      const del = setInterval(() => {
        i--;
        setCount(i);
        if (i <= 0) {
          clearInterval(del);
          setTimeout(runType, 500);
        }
      }, 30);
    }
    function runType() {
      const typ = setInterval(() => {
        i++;
        setCount(i);
        if (i >= text.length) {
          clearInterval(typ);
          setTimeout(runDelete, 1800);
        }
      }, 55);
    }
    return () => clearInterval(id);
  }, [text]);
  return (
    <span>
      {text.slice(0, count)}
      <span style={{ borderRight: "2px solid currentColor", marginLeft: "1px", opacity: 0.6 }}>&nbsp;</span>
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

// Petit helper générique : fondu + léger glissement au moment où l'élément
// entre dans le viewport, rejoue à chaque entrée. Utilisé pour les blocs qui
// n'ont pas besoin d'une chorégraphie sur mesure (juste "ne pas apparaître
// figé d'un bloc").
function FadeInOnView({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(22px)",
      transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
    }}>
      {children}
    </div>
  );
}

function GMBCard() {
  const [hover, setHover] = useState(false);

  return (
    // Wrapper séparé pour le flottement idle (keyframes CSS) : une animation
    // CSS sur `transform` gagnerait toujours contre le transform inline du
    // hover s'ils étaient sur le même élément. Ici le flottement est sur ce
    // div, le lift au survol reste sur le <a> interne — aucun conflit.
    <div className={hover ? "" : "rp-float"}>
    <a
      href="#calculator"
      onClick={() => trackClic("bouton_fonctionnement_carte-hero")}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "block", textDecoration: "none", cursor: "pointer",
        background: "#fff", borderRadius: "12px",
        boxShadow: hover ? SHADOW_XL : SHADOW_LG,
        overflow: "hidden", width: "320px", maxWidth: "100%", flexShrink: 0,
        border: `1px solid ${hover ? G.blue + "60" : "#DADCE0"}`,
        transform: hover ? "translateY(-6px)" : "translateY(0)",
        transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
        position: "relative",
      }}
    >
      {/* Indice d'affordance : n'apparaît qu'au survol, pour ne pas polluer
          la maquette au repos tout en rendant le clic évident. */}
      <div style={{
        position: "absolute", top: "10px", right: "10px", zIndex: 2,
        padding: "5px 12px", background: "#202124", color: "#fff",
        fontSize: "11px", fontWeight: 600, borderRadius: "20px",
        opacity: hover ? 1 : 0,
        transform: hover ? "translateY(0)" : "translateY(-4px)",
        transition: "opacity 0.2s ease, transform 0.2s ease",
        pointerEvents: "none", whiteSpace: "nowrap",
      }}>
        Voir le fonctionnement →
      </div>
      <div style={{ height: "130px", background: "linear-gradient(135deg, #EEF3FF, #DCE5FA 50%, #EAF7F3)", position: "relative", overflow: "hidden" }}>
        {[0,1,2,3,4].map(i => <div key={i} style={{ position: "absolute", left: 0, right: 0, top: `${i*28}px`, height: "1px", background: "rgba(36,87,197,0.08)" }} />)}
        {[0,1,2,3,4,5,6,7].map(i => <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: `${i*42}px`, width: "1px", background: "rgba(36,87,197,0.08)" }} />)}
        <div style={{ position: "absolute", top: "40px", left: 0, right: 0, height: "7px", background: "rgba(255,255,255,0.6)", borderRadius: "2px" }} />
        <div style={{ position: "absolute", top: "80px", left: 0, right: 0, height: "5px", background: "rgba(255,255,255,0.4)", borderRadius: "2px" }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "120px", width: "7px", background: "rgba(255,255,255,0.5)", borderRadius: "2px" }} />
        <div style={{ position: "absolute", inset: "28px 24px", display: "flex", alignItems: "flex-end", gap: "8px" }}>
          {[38, 62, 48, 82, 72, 96].map((height, i) => <div key={i} style={{ flex: 1, height: `${height}%`, background: i === 5 ? G.green : G.blue, opacity: i === 5 ? 1 : 0.2 + i * 0.1, borderRadius: "6px 6px 2px 2px" }} />)}
        </div>
        <div style={{ position: "absolute", top: "9px", left: "12px", fontSize: "10px", fontWeight: 700, color: "#31507A" }}>DÉMONSTRATION DU TABLEAU CAELA</div>
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
          {[{ icon: "✓", label: "Suivis" }, { icon: "↗", label: "Tendance" }, { icon: "⏱", label: "Délai" }].map(b => (
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
              <div className="rp-live-dot" style={{ width: "12px", height: "12px", background: G.green, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "7px", color: "#fff", fontWeight: 700 }}>✓</span>
              </div>
              <span style={{ fontSize: "9px", fontWeight: 700, color: G.green }}>Exemple de réponse IA</span>
            </div>
            <p style={{ margin: 0, color: "#1E6B38", fontSize: "10px", lineHeight: 1.5 }}>
              Merci beaucoup Marie ! C&apos;est avec plaisir que nous vous accueillons...
            </p>
          </div>
        </div>
      </div>
    </a>
    </div>
  );
}

function ROICalculator() {
  const [reviews, setReviews] = useState(50);
  const timeMin = reviews * 4;
  const timeH = (timeMin / 60).toFixed(1);
  const timeCost = Math.round(timeMin / 60 * 50);
  const plan = reviews <= 30 ? { name: "Starter", price: 49 } : reviews <= 100 ? { name: "Solo", price: 69 } : reviews <= 300 ? { name: "Pro", price: 149 } : { name: "Studio", price: 299 };
  const savings = timeCost - plan.price;
  const roi = Math.round((savings / plan.price) * 100);

  return (
    <div className="rp-calculator-card" style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "16px", padding: "36px 40px", boxShadow: SHADOW_MD }}>
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

      <div className="rp-calculator-result" style={{
        background: savings > 0 ? "#E6F4EA" : "#F8F9FA",
        borderRadius: "12px", padding: "16px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        border: `1px solid ${savings > 0 ? G.green + "40" : "#DADCE0"}`,
      }}>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: savings > 0 ? G.green : "#5F6368", marginBottom: "2px" }}>
            {savings > 0 ? `Écart de coût estimé : ${savings}€/mois` : "Comparez le service selon votre situation"}
          </div>
          <div style={{ fontSize: "12px", color: "#5F6368" }}>
            {savings > 0 ? `Estimation fondée sur les hypothèses affichées · ratio théorique ${roi}%` : "Le coût réel dépend de votre volume et du temps consacré à chaque avis."}
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
    { icon: "⭐", color: G.red, label: "Avis 2⭐ détecté", sub: "Synchronisation automatique chaque heure", timing: "≤ 1 h" },
    { icon: "🧠", color: G.blue, label: "IA génère 3 suggestions", sub: "Trois tons adaptés au contexte de l'avis", timing: "Puis quelques sec." },
    { icon: "📧", color: G.yellow, label: "Email de validation envoyé", sub: "Choisissez une suggestion ou rédigez la vôtre", timing: "Après génération" },
    { icon: "✅", color: G.green, label: "Publié sur Google", sub: "Publication uniquement après votre confirmation", timing: "Après votre clic" },
  ];
  // Révèle les 4 étapes une à une dès que la carte entre dans le viewport,
  // et REJOUE l'animation à chaque nouvelle entrée (remontée puis retour,
  // par ex.) — inView suit l'intersection réelle au lieu de se figer après
  // un seul déclenchement.
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className="rp-review-flow-card" style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "16px", padding: "32px", boxShadow: SHADOW_SM }}>
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <h3 style={{ margin: "0 0 6px", fontSize: "19px", fontWeight: 700, color: "#202124" }}>
          Un avis 2⭐ arrive. Voici ce qui se passe.
        </h3>
        <p style={{ margin: 0, fontSize: "14px", color: "#5F6368" }}>
          Votre rôle : choisir une suggestion, la modifier ou écrire votre propre réponse, puis confirmer la publication.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "6px" }}>
        {steps.map((step, i) => (
          <div key={step.label} style={{
            position: "relative",
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(16px)",
            transition: `opacity 0.5s ease ${i * 0.15}s, transform 0.5s ease ${i * 0.15}s`,
          }}>
            {i < steps.length - 1 && (
              <div style={{ position: "absolute", top: "30px", right: "-4px", zIndex: 1, width: "8px", height: "2px", background: "#DADCE0" }} />
            )}
            <div style={{ padding: "16px 8px", textAlign: "center" }}>
              <div style={{
                width: "52px", height: "52px", borderRadius: "50%",
                background: step.color + "15",
                border: `2px solid ${step.color}30`,
                margin: "0 auto 10px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "22px",
              }}>{step.icon}</div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: step.color, marginBottom: "5px", letterSpacing: "0.3px" }}>{step.timing}</div>
              <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#202124", marginBottom: "4px" }}>{step.label}</div>
              <div style={{ fontSize: "12px", color: "#5F6368", lineHeight: 1.45 }}>{step.sub}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "16px", padding: "12px 16px", background: "#E8F0FE", borderRadius: "8px", textAlign: "center" }}>
        <span style={{ fontSize: "13.5px", color: G.blue, fontWeight: 600 }}>
          Pas besoin de se connecter au dashboard. Tout se passe dans votre email. Sur téléphone ou ordinateur.
        </span>
      </div>
    </div>
  );
}

// Remplace l'ancien duo "calculateur + flow" côte à côte (deux blocs denses
// écrasés l'un contre l'autre = surcharge visuelle). Un seul bloc visible à
// la fois, choisi par onglet ou par rotation automatique — comme une bannière
// qui défile, mais lisible et cliquable au lieu de juste tourner toute seule.
function CalculatorFlowBanner() {
  const [tab, setTab] = useState<"calc" | "flow">("calc");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    // Sur téléphone, une rotation automatique entre deux panneaux de hauteurs
    // différentes déplace brutalement tout le contenu sous le doigt. Les
    // onglets restent disponibles, mais le changement devient volontaire.
    if (window.matchMedia("(max-width: 768px)").matches) return;
    const id = setInterval(() => setTab((t) => (t === "calc" ? "flow" : "calc")), 7000);
    return () => clearInterval(id);
  }, [paused]);

  const TABS: { key: "calc" | "flow"; label: string }[] = [
    { key: "calc", label: "💰 Calculez vos économies" },
    { key: "flow", label: "⚡ Comment ça marche" },
  ];

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "28px", flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPaused(true); trackClic(`onglet_${t.key === "calc" ? "calculateur" : "comment-ca-marche"}_accueil`); }}
            style={{
              padding: "10px 22px", borderRadius: "24px", cursor: "pointer",
              fontSize: "14px", fontWeight: 600, whiteSpace: "nowrap",
              background: tab === t.key ? G.blue : "#fff",
              color: tab === t.key ? "#fff" : "#5F6368",
              border: tab === t.key ? "none" : "1px solid #DADCE0",
              boxShadow: tab === t.key ? `0 3px 10px ${G.blue}40` : SHADOW_SM,
              transition: "background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Grille à cellule unique : les deux blocs restent montés et empilés au
          même endroit (gridArea partagée), donc le conteneur se cale sur le
          plus haut des deux en permanence — la rotation ne fait plus sauter
          le contenu sous la section, contrairement à un montage/démontage.
          Largeur remontée à 1100px (au lieu de 620px, trop compressé — la
          grille des 4 étapes "Comment ça marche" renvoyait un 4e élément
          orphelin sur sa propre ligne faute de place). */}
      <div className="rp-calculator-panels" style={{ maxWidth: "1100px", margin: "0 auto", display: "grid" }}>
        <div className={`rp-calculator-panel ${tab === "calc" ? "rp-calculator-panel-active" : ""}`} style={{
          gridArea: "1 / 1",
          opacity: tab === "calc" ? 1 : 0,
          transform: tab === "calc" ? "translateY(0) scale(1)" : "translateY(10px) scale(0.98)",
          pointerEvents: tab === "calc" ? "auto" : "none",
          transition: "opacity 0.45s ease, transform 0.45s ease",
        }}>
          <ROICalculator />
        </div>
        <div className={`rp-calculator-panel ${tab === "flow" ? "rp-calculator-panel-active" : ""}`} style={{
          gridArea: "1 / 1",
          opacity: tab === "flow" ? 1 : 0,
          transform: tab === "flow" ? "translateY(0) scale(1)" : "translateY(10px) scale(0.98)",
          pointerEvents: tab === "flow" ? "auto" : "none",
          transition: "opacity 0.45s ease, transform 0.45s ease",
        }}>
          <ReviewFlow />
        </div>
      </div>
    </div>
  );
}

// Tableau "Sans / Avec" : chaque ligne de gauche se barre au scroll, la ligne
// "avec" correspondante s'allume juste après — visualise le lien entre le
// problème et sa solution au lieu de deux colonnes statiques.
const DIY_COMPARISON_ROWS = [
  { bad: "Tu réalises à J+3 qu'un avis 1⭐ attend une réponse", good: "Alerte et 3 suggestions après la prochaine synchronisation" },
  { bad: "Tu écris la même réponse générique pour la 12ème fois", good: "Chaque réponse cite le prénom et un détail. Jamais générique." },
  { bad: "Tu réponds énervé. Ça se voit et ça coûte des clients", good: "Pour les avis négatifs : 3 tons calibrés. Tu choisis en 1 clic." },
  { bad: "Le suivi des avis prend du temps chaque semaine", good: "Chaque réponse traitée par Caela est suivie et horodatée." },
  { bad: "Ta fiche manque de suivi et les avis restent sans réponse", good: "Les réponses montrent publiquement que tu prends les retours au sérieux." },
];

// Refonte complète (2026-08-29) : l'ancienne version pilotait tout via des
// transitions CSS déclenchées par IntersectionObserver, ce qui donnait un
// résultat incohérent selon le moment exact où la section entrait dans le
// viewport (parfois tout apparaissait déjà barré, sans animation visible —
// classique conflit React/CSS transition quand l'état change avant le
// premier paint). Ici, tout est piloté par une machine à états JS explicite
// (setTimeout enchaînés, annulables via runId) : ligne par ligne, on tape le
// problème, puis la solution en la surlignant, PUIS on barre le problème.
// Rejoue à chaque entrée dans le viewport, s'arrête net si on en ressort.
function DIYComparison() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [badChars, setBadChars] = useState<number[]>(() => DIY_COMPARISON_ROWS.map(() => 0));
  const [goodChars, setGoodChars] = useState<number[]>(() => DIY_COMPARISON_ROWS.map(() => 0));
  const [struck, setStruck] = useState<boolean[]>(() => DIY_COMPARISON_ROWS.map(() => false));
  const [highlighted, setHighlighted] = useState<boolean[]>(() => DIY_COMPARISON_ROWS.map(() => false));
  const runIdRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const myRun = ++runIdRef.current;
    if (!active) {
      setBadChars(DIY_COMPARISON_ROWS.map(() => 0));
      setGoodChars(DIY_COMPARISON_ROWS.map(() => 0));
      setStruck(DIY_COMPARISON_ROWS.map(() => false));
      setHighlighted(DIY_COMPARISON_ROWS.map(() => false));
      return;
    }
    const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
    const CHARS_PER_TICK = 2;
    const TYPE_SPEED = 18;

    (async () => {
      for (let i = 0; i < DIY_COMPARISON_ROWS.length; i++) {
        const { bad, good } = DIY_COMPARISON_ROWS[i];
        for (let c = CHARS_PER_TICK; c < bad.length; c += CHARS_PER_TICK) {
          if (runIdRef.current !== myRun) return;
          setBadChars((prev) => { const n = prev.slice(); n[i] = c; return n; });
          await sleep(TYPE_SPEED);
        }
        if (runIdRef.current !== myRun) return;
        setBadChars((prev) => { const n = prev.slice(); n[i] = bad.length; return n; });
        await sleep(280);

        if (runIdRef.current !== myRun) return;
        setHighlighted((prev) => { const n = prev.slice(); n[i] = true; return n; });
        for (let c = CHARS_PER_TICK; c < good.length; c += CHARS_PER_TICK) {
          if (runIdRef.current !== myRun) return;
          setGoodChars((prev) => { const n = prev.slice(); n[i] = c; return n; });
          await sleep(TYPE_SPEED);
        }
        if (runIdRef.current !== myRun) return;
        setGoodChars((prev) => { const n = prev.slice(); n[i] = good.length; return n; });
        await sleep(350);

        if (runIdRef.current !== myRun) return;
        setStruck((prev) => { const n = prev.slice(); n[i] = true; return n; });
        await sleep(500);
      }
    })();

    return () => { runIdRef.current++; };
  }, [active]);

  const rowStyle: React.CSSProperties = { display: "flex", gap: "9px", minHeight: "34px", alignItems: "flex-start", padding: "6px 0" };
  const textStyle: React.CSSProperties = { fontSize: "14px", lineHeight: 1.55, fontWeight: 500 };

  return (
    // Même habillage "carte" que la comparaison plaque NFC seule / plaque +
    // moteur (fond blanc, bordure arrondie) plutôt qu'un simple trait du haut
    // — pour la cohérence visuelle entre les deux comparaisons de la page.
    <div ref={ref} style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "14px", overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        <div style={{ padding: "24px 28px", borderRight: "1px solid #DADCE0" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: G.red, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>✗ Sans Caela Réputation</div>
          {DIY_COMPARISON_ROWS.map((row, i) => {
            const shown = badChars[i] ?? 0;
            const typing = shown > 0 && shown < row.bad.length;
            return (
              <div key={row.bad} style={rowStyle}>
                <span style={{ color: G.red, fontWeight: 700, flexShrink: 0, opacity: shown > 0 ? 1 : 0, transition: "opacity 0.15s ease" }}>✗</span>
                <span
                  className={struck[i] ? "rp-strike rp-strike-active" : "rp-strike"}
                  style={{ ...textStyle, color: "#5F6368" }}
                >
                  {row.bad.slice(0, shown)}
                  {typing && <span className="rp-type-cursor" />}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ padding: "24px 28px", background: "#F6FBF7" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: G.green, marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>✓ Avec Caela Réputation</div>
          {DIY_COMPARISON_ROWS.map((row, i) => {
            const shown = goodChars[i] ?? 0;
            const typing = shown > 0 && shown < row.good.length;
            return (
              <div key={row.good} style={rowStyle}>
                <span style={{ color: G.green, fontWeight: 700, flexShrink: 0, opacity: highlighted[i] ? 1 : 0, transition: "opacity 0.15s ease" }}>✓</span>
                <span
                  style={{
                    ...textStyle, color: "#1E4620",
                    background: highlighted[i] ? "#CFF2DA" : "transparent",
                    boxShadow: highlighted[i] ? "0 0 0 4px #CFF2DA" : "0 0 0 4px transparent",
                    transition: "background 0.3s ease, box-shadow 0.3s ease",
                    borderRadius: "4px",
                  }}
                >
                  {row.good.slice(0, shown)}
                  {typing && <span className="rp-type-cursor" />}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const PLANS = [
  {
    name: "Starter",
    price: "49",
    annual: "39",
    desc: "1 établissement",
    color: G.green,
    best: "Moins de 30 avis/mois — débutez sans risque",
    features: [
      "1 établissement connecté",
      "Jusqu'à 30 avis traités/mois",
      "Synchronisation automatique chaque heure",
      "3 suggestions IA par avis négatif",
      "Notification email après détection",
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
      "Jusqu'à 100 avis traités/mois",
      "Synchronisation automatique chaque heure",
      "Auto-réponse 4-5⭐ dès la détection",
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
      "Jusqu'à 300 avis traités/mois au total",
      "Tout Solo inclus",
      "Personnalisation du ton par lieu",
      "Support prioritaire",
    ],
    missing: [],
    cta: "Essai gratuit → Pro",
    highlight: false,
  },
  {
    name: "Studio",
    price: "299",
    annual: "239",
    desc: "5 établissements",
    color: "#9A4D12",
    best: "Fort volume — jusqu'à 1 000 avis/mois",
    features: [
      "5 établissements connectés",
      "Jusqu'à 1 000 avis traités/mois au total",
      "Tout Pro inclus",
      "Priorité de traitement",
      "Accompagnement volume",
    ],
    missing: [],
    cta: "Essai gratuit → Studio",
    highlight: false,
  },
];

const DIY_ARGS = [
  { color: G.red, bg: "#FFF0F2", icon: "⏱", stat: "Temps mesurable", title: "Ton temps vaut plus que ça", desc: "Caela suit le nombre de réponses prises en charge et estime le temps opérationnel économisé." },
  { color: G.blue, bg: "#EEF3FF", icon: "📍", stat: "Suivi officiel", title: "Mesure ce que Google fournit", desc: "Impressions, appels, clics site et itinéraires peuvent être suivis via l'API Performance, sans promettre un rang." },
  { color: G.yellow, bg: "#FFF7E8", icon: "🧠", stat: "Contrôle humain", title: "Les avis sensibles méritent une vraie attention", desc: "Les avis 1–3★ délégués sont relus par l'équipe Caela avant publication." },
  { color: G.green, bg: "#EDF8F4", icon: "👀", stat: "Réponses utiles", title: "Montre que chaque retour compte", desc: "Google indique qu'une réponse utile montre que l'entreprise accorde de l'importance à ses clients." },
  { color: G.blue, bg: "#E8F0FE", icon: "🔁", stat: "Suivi continu", title: "Tu vas finir par oublier", desc: "Rush, vacances, périodes chargées : les avis s'accumulent. Caela vérifie les nouveaux avis à chaque cycle de synchronisation." },
  { color: G.red, bg: "#FCE8E6", icon: "📈", stat: "Multi-établissements", title: "Centralise plusieurs fiches", desc: "À partir de plusieurs établissements, un tableau commun réduit les allers-retours entre les fiches." },
];

// Carrousel horizontal (au lieu d'une grille figée + carte séparée en dessous) :
// on fait défiler à la souris/tactile/flèches, la carte la plus proche du
// centre du rail grossit légèrement (effet coverflow) pour guider l'œil.
// La taille de chaque carte est fixée par sa distance (en nombre de cartes)
// au centre, jamais via getBoundingClientRect (son rect change lui-même une
// fois zoomé par transform: scale() → boucle qui fausse le calcul).
//
// Boucle infinie : le tableau de cartes est répété 3 fois (copie gauche,
// copie "réelle" du milieu, copie droite). L'utilisateur ne voit jamais les
// bords du DOM — dès que le scroll se stabilise sur une carte de la copie
// gauche ou droite, on saute silencieusement (sans transition) à la carte
// identique de la copie du milieu, ce qui est visuellement invisible
// puisque les trois copies sont pixel pour pixel les mêmes cartes.
const DIY_LOOP = [...DIY_ARGS, ...DIY_ARGS, ...DIY_ARGS];
const DIY_N = DIY_ARGS.length;

function DIYCardsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [centerIndex, setCenterIndex] = useState(DIY_N);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Trouve la carte dont le centre est le plus proche du centre visible du
  // rail, via offsetLeft/offsetWidth (propriétés de layout, jamais affectées
  // par le transform: scale() appliqué plus bas) — pas de boucle de mesure
  // post-transform.
  const getClosestIndex = () => {
    const track = trackRef.current;
    if (!track) return DIY_N;
    const viewportCenter = track.scrollLeft + track.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    Array.from(track.children).forEach((child, i) => {
      const el = child as HTMLElement;
      // Les offsets sont exprimés par rapport au premier ancêtre positionné.
      // On retire l'offset du rail (notamment -16 px sur mobile) pour obtenir
      // une coordonnée interne au scroll réellement comparable à scrollLeft.
      const center = el.offsetLeft - track.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(center - viewportCenter);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    return closest;
  };

  // Aligne le centre EXACT (au pixel près) de la carte `index` sur le centre
  // du rail — recalculé nous-mêmes plutôt que de faire confiance au
  // scroll-snap-align CSS natif, qui peut caler à quelques pixels du vrai
  // centre selon le navigateur (arrondi interne, gap, marges) et donnait une
  // carte visuellement décalée.
  const centerOnIndex = (index: number, smooth = true) => {
    const track = trackRef.current;
    const el = track?.children[index] as HTMLElement | undefined;
    if (!track || !el) return;
    const target = el.offsetLeft - track.offsetLeft + el.offsetWidth / 2 - track.clientWidth / 2;
    if (Math.abs(track.scrollLeft - target) < 1) return;
    track.scrollTo({ left: target, behavior: smooth ? "smooth" : "auto" });
  };

  // Une fois le scroll immobile, si on a dérivé vers la copie gauche ou
  // droite, on se replace instantanément sur la carte équivalente de la
  // copie du milieu — même carte à l'écran, juste un autre nœud du DOM.
  const settleAndMaybeLoop = () => {
    const track = trackRef.current;
    if (!track) return;
    const idx = getClosestIndex();
    setCenterIndex(idx);
    if (idx >= DIY_N && idx < 2 * DIY_N) {
      centerOnIndex(idx);
      return;
    }
    const target = idx % DIY_N;
    const middleIndex = DIY_N + target;
    const el = track.children[middleIndex] as HTMLElement | undefined;
    if (!el) return;
    track.scrollLeft = el.offsetLeft - track.offsetLeft + el.offsetWidth / 2 - track.clientWidth / 2;
    setCenterIndex(middleIndex);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    centerOnIndex(DIY_N, false);
    setCenterIndex(DIY_N);
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setCenterIndex(getClosestIndex()));
      clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(settleAndMaybeLoop, 120);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(settleTimer.current);
    };
  }, []);

  const scrollByCard = (dir: number) => {
    const track = trackRef.current;
    if (!track) return;

    // On repart de la position réellement visible (et non d'un state qui
    // peut avoir quelques millisecondes de retard lors de clics rapides).
    let current = getClosestIndex();
    let target = current + dir;

    // Même en martelant une flèche avant que le debounce de fin de scroll ne
    // s'exécute, on ne peut jamais atteindre un bord du DOM : on replace
    // d'abord la carte courante sur sa jumelle du bloc central, sans animation.
    if (target < 0 || target >= DIY_LOOP.length) {
      const logicalIndex = ((current % DIY_N) + DIY_N) % DIY_N;
      current = DIY_N + logicalIndex;
      const currentEl = track.children[current] as HTMLElement | undefined;
      if (!currentEl) return;
      track.scrollLeft = currentEl.offsetLeft - track.offsetLeft + currentEl.offsetWidth / 2 - track.clientWidth / 2;
      setCenterIndex(current);
      target = current + dir;
    }

    centerOnIndex(target);
  };

  return (
    <div style={{ position: "relative", marginBottom: "20px" }}>
      <div
        ref={trackRef}
        className="rp-no-scrollbar rp-diy-track"
        style={{
          display: "flex", gap: "16px", overflowX: "auto", scrollSnapType: "x mandatory",
          // Ne pas mettre scrollBehavior:"smooth" en CSS : il s'appliquerait
          // aussi au saut technique entre deux copies et rendrait la boucle
          // visible. Seuls les déplacements volontaires sont animés via
          // centerOnIndex(..., true).
          padding: "36px 10vw 28px",
          maskImage: "linear-gradient(to right, transparent 0, #000 8%, #000 92%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0, #000 8%, #000 92%, transparent 100%)",
        }}
      >
        {DIY_LOOP.map((a, i) => {
          const dist = Math.abs(i - centerIndex);
          const isActive = dist === 0;
          const scale = dist === 0 ? 1.14 : dist === 1 ? 0.94 : 0.86;
          const opacity = dist === 0 ? 1 : dist === 1 ? 0.75 : 0.55;
          return (
            <div
              key={`${a.title}-${i}`}
              className="rp-diy-card"
              style={{
                flex: "0 0 auto", width: "min(300px, calc(100vw - 80px))", scrollSnapAlign: "center",
                background: "#fff", border: `1px solid ${isActive ? a.color : "#DADCE0"}`, borderRadius: "14px", padding: "22px",
                boxShadow: isActive ? SHADOW_LG : SHADOW_SM,
                opacity,
                transform: `scale(${scale})`,
                transition: "transform 0.35s ease, opacity 0.35s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                zIndex: Math.round(scale * 100),
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <div style={{ width: "38px", height: "38px", background: a.bg, borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px" }}>{a.icon}</div>
                <span style={{ fontSize: "18px", fontWeight: 700, color: a.color }}>{a.stat}</span>
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: "14px", fontWeight: 600, color: "#202124" }}>{a.title}</h3>
              <p style={{ margin: 0, fontSize: "13px", color: "#5F6368", lineHeight: 1.6 }}>{a.desc}</p>
            </div>
          );
        })}
      </div>
      <button
        aria-label="Précédent"
        onClick={() => scrollByCard(-1)}
        style={{ position: "absolute", left: "-6px", top: "50%", transform: "translateY(-50%)", width: "36px", height: "36px", borderRadius: "50%", background: "#fff", border: "1px solid #DADCE0", boxShadow: SHADOW_MD, cursor: "pointer", fontSize: "16px", color: "#5F6368", display: "flex", alignItems: "center", justifyContent: "center" }}
      >‹</button>
      <button
        aria-label="Suivant"
        onClick={() => scrollByCard(1)}
        style={{ position: "absolute", right: "-6px", top: "50%", transform: "translateY(-50%)", width: "36px", height: "36px", borderRadius: "50%", background: "#fff", border: "1px solid #DADCE0", boxShadow: SHADOW_MD, cursor: "pointer", fontSize: "16px", color: "#5F6368", display: "flex", alignItems: "center", justifyContent: "center" }}
      >›</button>
    </div>
  );
}

const COMPETITORS = [
  { name: "Caela Réputation 🇫🇷", solo: "49-69€", business: "149€", agency: "449€", aiAuto: true, fr: true, gmb: true, trial: true, highlight: true },
  { name: "Partoo 🇫🇷", solo: "Sur devis", business: "Sur devis", agency: "Sur devis", aiAuto: true, fr: true, gmb: true, trial: false, highlight: false },
  { name: "Birdeye 🇺🇸", solo: "Sur devis", business: "Sur devis", agency: "Sur devis", aiAuto: true, fr: false, gmb: true, trial: false, highlight: false },
  { name: "Uberall 🇩🇪", solo: "Sur devis", business: "Sur devis", agency: "Sur devis", aiAuto: true, fr: false, gmb: true, trial: false, highlight: false },
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
  { icon: "🩹", title: "Un avis 1⭐ n'est pas une catastrophe : comment le désamorcer", duration: "2 min" },
  { icon: "🎁", title: "Le parrainage Caela expliqué en une vidéo", duration: "1 min" },
  { icon: "🔒", title: "RGPD, sécurité, CGU Google : on répond à vos questions", duration: "2 min 30" },
];

// Refait le 08/08 : l'ancienne version présentait ces textes comme des
// témoignages clients (nom, rôle, ville, 5 étoiles à propos de Caela
// Réputation) — trompeur pour un produit en lancement, et hors-sujet par
// rapport au titre de la section ("le type de réponses générées"). Remplacé
// par de vrais couples avis-reçu → réponse-IA, sans identité inventée.
const REPLY_EXAMPLES = [
  { rating: 1, business: "Restaurant", incoming: "Service très lent, on a attendu 40 minutes pour être servis un samedi soir.", reply: "Merci pour ce retour, et désolé pour l'attente. Le samedi soir est notre créneau le plus chargé, ce n'est pas une excuse mais on travaille dessus. On aimerait vraiment vous accueillir à nouveau dans de meilleures conditions." },
  { rating: 5, business: "Salon de coiffure", incoming: "Coupe parfaite, accueil chaleureux, je recommande à 100%.", reply: "Merci beaucoup pour ce retour, ça nous touche ! On a hâte de vous accueillir à nouveau pour votre prochaine coupe." },
  { rating: 2, business: "Garage", incoming: "Réparation qui a pris deux fois plus de temps que prévu, sans être prévenu.", reply: "Vous avez raison, on aurait dû vous tenir informé du délai. C'est un manquement de notre part et on va corriger ça pour la suite. N'hésitez pas à nous recontacter directement si besoin." },
];

type ReplyExample = (typeof REPLY_EXAMPLES)[number];

// Carte statique auparavant (avis + réponse déjà là au chargement) : on
// simule maintenant le déroulé réel (avis reçu → IA qui rédige → réponse
// publiée), décalé par carte pour que la rangée entière ait l'air de
// tourner en direct. Rejoue à chaque entrée dans le viewport.
function ReplyExampleCard({ ex, index }: { ex: ReplyExample; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "review" | "writing" | "done">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) { setPhase("idle"); return; }
      const t1 = setTimeout(() => setPhase("review"), 150 + index * 250);
      const t2 = setTimeout(() => setPhase("writing"), 650 + index * 250);
      const t3 = setTimeout(() => setPhase("done"), 1750 + index * 250);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, { threshold: 0.35 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [index]);

  const showReview = phase !== "idle";
  const showReply = phase === "writing" || phase === "done";
  const writing = phase === "writing";

  return (
    <div ref={ref} style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "14px", padding: "22px", boxShadow: SHADOW_SM, minHeight: "230px" }}>
      <div
        style={{
          opacity: showReview ? 1 : 0,
          transform: showReview ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#80868B", textTransform: "uppercase", letterSpacing: "0.5px" }}>{ex.business} · Avis Google</span>
          <div style={{ display: "flex", gap: "2px" }}>
            {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: "13px", color: i <= ex.rating ? G.yellow : "#DADCE0" }}>★</span>)}
          </div>
        </div>
        <p style={{ margin: "0 0 16px", fontSize: "14px", color: "#202124", lineHeight: 1.6, fontStyle: "italic" }}>
          &ldquo;{ex.incoming}&rdquo;
        </p>
      </div>

      {writing && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 14px", background: "#F8F9FA", borderRadius: "8px" }}>
          <span className="rp-live-dot" style={{ width: "8px", height: "8px", background: G.blue, borderRadius: "50%", flexShrink: 0 }} />
          <span style={{ fontSize: "12.5px", color: "#5F6368", fontStyle: "italic" }}>Caela rédige une réponse…</span>
        </div>
      )}

      <div
        style={{
          background: "#E8F4EA", borderLeft: `3px solid ${G.green}`, borderRadius: "0 8px 8px 0", padding: "12px 14px",
          opacity: showReply ? 1 : 0,
          maxHeight: showReply ? "260px" : "0px",
          overflow: "hidden",
          transform: showReply ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 0.4s ease, transform 0.4s ease, max-height 0.4s ease",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
          <div style={{ width: "14px", height: "14px", background: G.green, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: "8px", color: "#fff", fontWeight: 700 }}>✓</span>
          </div>
          <span style={{ fontSize: "10.5px", fontWeight: 700, color: G.green, textTransform: "uppercase", letterSpacing: "0.4px" }}>Réponse générée par l&apos;IA</span>
        </div>
        <p style={{ margin: 0, fontSize: "13px", color: "#1E6B38", lineHeight: 1.55 }}>{ex.reply}</p>
      </div>
    </div>
  );
}

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
// Pack Avis seul baissé à 49,90€/mois le 08/08 pour être une vraie porte
// d'entrée basse (avant : 89€, trop proche du Pack Croissance à 149€).
// Signalement d'avis faux/frauduleux : TOUJOURS à l'unité (19,90€), jamais
// inclus dans un pack — démarche à part (dossier + suivi Google), distincte
// de la gestion courante des avis. Corrigé le 2026-08-29 : la version
// précédente prétendait à tort que c'était inclus dans les 3 packs GMB.
const GMB_SERVICES = [
  {
    color: G.blue, bg: "#E8F0FE", icon: "✨", title: "Pack Lancement GMB", tag: "Création + Optimisation", price: "199€",
    desc: "Fiche créée de zéro puis travaillée sur les éléments maîtrisables : catégories, horaires, description, photos, posts et Q&A. Suivi des indicateurs disponibles, sans garantie de classement.",
    features: ["Audit + création complète de la fiche", "Catégories, horaires, SEO local", "Rédaction posts, photos, Q&A", "Paiement unique, aucun abonnement"],
    highlight: false,
  },
  {
    color: G.yellow, bg: "#FEF7E0", icon: "📊", title: "Pack Croissance", tag: "Optimisation mensuelle + Gestion des avis", price: "149€/mois", oldPrice: "199€/mois",
    desc: "L'offre complète : mise à jour des posts et photos chaque mois, veille concurrentielle, rapport de performance — ET la gestion des avis incluse (réponse manuelle, stratégie de collecte).",
    features: ["Posts + photos mis à jour chaque mois", "Veille concurrentielle", "Rapport de performance mensuel", "Réponse manuelle aux avis incluse", "Stratégie de collecte d'avis"],
    highlight: true,
  },
];

const FAKE_REVIEW_REMOVAL = {
  title: "Nous préparons le signalement de vos faux avis",
  desc: "19,90€ par dossier soumis. La décision appartient à Google ; si le retrait est refusé, la prestation est remboursée.",
};

// Paliers revus le 08/08 : 1, 3 et 5 plaques (au lieu de 1, 5, 25) — mieux
// alignés sur le besoin réel d'un commerce local (une seule enseigne, rarement
// plus de 5 points de contact physiques).
const NFC_PACKS = [
  { name: "Plaque Solo", price: "19€", unit: "19€/plaque", qty: "1 plaque", color: G.blue, features: ["NFC + QR code de secours", "Design personnalisé (votre logo)", "Cible au choix : Google, Insta, TikTok…", "Support acrylique"] },
  { name: "Pack Trio", price: "47€", oldPrice: "57€", unit: "15,67€/plaque", qty: "3 plaques", color: G.green, features: ["3 plaques NFC + QR de secours", "Multi-réseaux : Google, Insta, TikTok, WhatsApp", "Configuration incluse", "Délai confirmé avant paiement"], highlight: true },
  { name: "Pack Établissement", price: "69€", oldPrice: "95€", unit: "13,80€/plaque", qty: "5 plaques", color: G.red, features: ["5 plaques NFC + QR de secours", "Multi-réseaux : Google, Insta, TikTok, WhatsApp", "Configuration incluse", "Délai confirmé avant paiement"] },
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
  { icon: "🔧", title: "Configuration vérifiée", desc: "Le lien et la destination sont confirmés avec vous avant programmation." },
  { icon: "🚚", title: "Livraison suivie", desc: "Le mode d'expédition et le délai sont confirmés avant paiement." },
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
  ["#pricing", "Abonnement réponses IA"],
  ["/audit", "Audit · bientôt"],
  ["/blog", "Blog"],
];

// Visite guidée audio : Web Speech API (SpeechSynthesis), 100% gratuite,
// aucune clé API. Chaque étape défile jusqu'à sa section (scrollIntoView)
// puis attend la fin du défilement avant de parler — parler pendant le
// scroll donnerait l'impression que la voix est désynchronisée de l'écran.
// L'étape suivante démarre dans le onend de l'utterance précédente : c'est
// ce qui rythme l'ensemble sur la durée réelle de la voix, pas un minuteur
// fixe qui coupe la phrase ou laisse un blanc.
const TOUR_STEPS: { id: string; text: string }[] = [
  { id: "hero", text: "Bienvenue sur Caela Réputation. On automatise les réponses à vos avis Google avec l'intelligence artificielle, en trente secondes par avis." },
  { id: "calculator", text: "Répondre à la main, c'est gratuit, jusqu'à ce qu'on calcule le temps que ça vous coûte vraiment chaque mois." },
  { id: "services", text: "Si vous préférez qu'un humain s'occupe de tout, notre agence crée et optimise votre fiche Google, ou gère vos avis à votre place." },
  { id: "pricing", text: "L'abonnement qui répond à vos avis démarre à trente-neuf euros par mois en engagement annuel, avec quatorze jours d'essai gratuit." },
  { id: "nfc", text: "Et pour collecter plus d'avis facilement, découvrez nos plaques N F C : le client approche son téléphone, laisse un avis en trois secondes." },
];

function GuidedTourButton() {
  const [playing, setPlaying] = useState(false);
  const cancelledRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      clearTimeout(timerRef.current);
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  function speakStep(i: number) {
    if (cancelledRef.current || i >= TOUR_STEPS.length) {
      setPlaying(false);
      return;
    }
    const step = TOUR_STEPS[i];
    document.getElementById(step.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    timerRef.current = setTimeout(() => {
      if (cancelledRef.current) return;
      const utter = new SpeechSynthesisUtterance(step.text);
      utter.lang = "fr-FR";
      utter.rate = 1;
      utter.onend = () => speakStep(i + 1);
      utter.onerror = () => setPlaying(false);
      window.speechSynthesis.speak(utter);
    }, 700);
  }

  function start() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    trackClic("bouton_visite-guidee_hero");
    cancelledRef.current = false;
    setPlaying(true);
    speakStep(0);
  }

  function stop() {
    cancelledRef.current = true;
    clearTimeout(timerRef.current);
    window.speechSynthesis.cancel();
    setPlaying(false);
  }

  return (
    <button
      onClick={playing ? stop : start}
      style={{
        display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px",
        background: playing ? "#FCE8E6" : "#E6F4EA", border: "none", borderRadius: "24px",
        fontSize: "13px", fontWeight: 600, color: playing ? G.red : "#1E7A3D",
        cursor: "pointer", fontFamily: "inherit",
      }}
    >
      {playing ? "⏹ Arrêter" : "🔊 Visite guidée (2 min)"}
    </button>
  );
}

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
  const [loginWidgetOpen, setLoginWidgetOpen] = useState(false);
  const [widgetMode, setWidgetMode] = useState<"signup" | "login">("signup");

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Topbar : masquée au défilement vers le bas, réaffichée immédiatement
  // au premier pixel remonté. Toujours visible tout en haut de page.
  // Seuil de 4px pour ignorer le bruit du trackpad/momentum scroll (sans lui,
  // un micro-jitter pouvait alterner show/hide en boucle et donner
  // l'impression que la remontée "ne marchait pas bien").
  useEffect(() => {
    let lastY = window.scrollY;
    const THRESHOLD = 4;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      if (y <= 80) setNavVisible(true);
      else if (delta > THRESHOLD) setNavVisible(false);
      else if (delta < -THRESHOLD) setNavVisible(true);
      if (Math.abs(delta) > THRESHOLD) lastY = y;
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
    <div className="rp-home" style={{ background: "#fff", color: "#202124", paddingBottom: isMobile ? "58px" : "64px" }}>

      {/* ── TRUST STRIP ── */}
      <div className="rp-trust-strip" style={{ background: G.blue, marginTop: "64px", padding: "9px 40px", display: "flex", alignItems: "center", justifyContent: "center", gap: "28px", flexWrap: "wrap" }}>
        {[
          { icon: "🇫🇷", label: "Made in France" },
          { icon: "🔒", label: "Protection des données" },
          { icon: "✅", label: "Connexion OAuth Google" },
          { icon: "💬", label: "Support en français" },
          { icon: "⭐", label: "14 jours d'essai gratuit" },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span style={{ fontSize: "13px" }}>{item.icon}</span>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* ── NAV ──
          position:fixed (pas sticky) : sticky + transform casse le collage
          dans certains navigateurs (le transform interfère avec le calcul
          de la position sticky), ce qui pouvait empêcher la barre de
          revenir correctement à la remontée. Fixed est fiable à 100%. */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "#fff", borderBottom: "1px solid #DADCE0",
        padding: isMobile ? "0 16px" : "0 40px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between",
        transform: navVisible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.25s ease",
      }}>
        <div
          onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); trackClic("logo_accueil_nav"); }}
          style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0, flexShrink: 1, cursor: "pointer" }}
        >
          <GDots size={9} />
          <span className="rp-brand-name" style={{ fontSize: isMobile ? "16px" : "20px", fontWeight: 700, color: "#202124", letterSpacing: "-0.3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Caela Réputation</span>
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
            <a href="#login" onClick={(e) => { e.preventDefault(); setWidgetMode("login"); setLoginWidgetOpen(true); }} style={{ padding: "9px 16px", fontSize: "14px", fontWeight: 600, color: G.blue, textDecoration: "none", borderRadius: "6px", marginLeft: "8px", cursor: "pointer" }}>
              Se connecter
            </a>
            <a href="/signup?plan=solo" onClick={() => trackClic("bouton_essai-gratuit_nav")} style={{ padding: "9px 20px", fontSize: "14px", fontWeight: 600, background: G.blue, color: "#fff", textDecoration: "none", borderRadius: "6px" }}>
              Essai gratuit
            </a>
          </div>
        )}

        {/* Mobile: CTA compact toujours visible + burger */}
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <a className="rp-mobile-nav-cta" href="/signup?plan=solo" onClick={() => trackClic("bouton_essai-gratuit_nav-mobile")} style={{ padding: "8px 12px", fontSize: "13px", fontWeight: 600, background: G.blue, color: "#fff", textDecoration: "none", borderRadius: "6px", whiteSpace: "nowrap" }}>
              Essai 14 j
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
      {/* La nav étant fixed (hors flux), ce spacer réserve sa hauteur pour
          que le contenu ne saute pas sous elle. */}
      {/* La marge haute de la barre de réassurance réserve déjà la hauteur de
          la navigation fixe. Aucun second espace n'est nécessaire. */}

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
          <a href="#login" onClick={(e) => { e.preventDefault(); setWidgetMode("login"); setLoginWidgetOpen(true); }} style={{ padding: "6px 10px", fontSize: "13px", fontWeight: 600, color: G.blue, textDecoration: "none", cursor: "pointer" }}>
            Se connecter
          </a>
        )}
        <a href="/signup?plan=solo" onClick={() => trackClic("bouton_essai-gratuit_flottant")} style={{ padding: "7px 16px", fontSize: "13px", fontWeight: 600, background: G.blue, color: "#fff", textDecoration: "none", borderRadius: "20px", whiteSpace: "nowrap" }}>
          Essai gratuit
        </a>
      </div>

      {/* Mobile: panneau déroulant */}
      {isMobile && menuOpen && (
        <div style={{
          position: "fixed", top: "64px", left: 0, right: 0, zIndex: 99,
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
          <a href="#login" onClick={(e) => { e.preventDefault(); setMenuOpen(false); setWidgetMode("login"); setLoginWidgetOpen(true); }} style={{
            marginTop: "6px", padding: "13px 14px",
            border: "1px solid #DADCE0", borderRadius: "10px",
            fontSize: "15px", fontWeight: 600, color: G.blue,
            textDecoration: "none", textAlign: "center",
          }}>
            Se connecter
          </a>
        </div>
      )}

      {/* ── HERO ──
          Restructurée le 08/08 : le dégradé occupe maintenant TOUTE la largeur
          de l'écran (fini les bandes blanches sur grand écran), et le contenu
          vit dans un conteneur intérieur à largeur raisonnable — avant, la
          colonne de texte avait flex:1 dans une section à 1680px, elle
          s'étirait donc bien au-delà de son contenu réel et laissait un grand
          vide avant l'illustration. */}
      <section id="hero" style={{ background: "linear-gradient(180deg, #F8F9FA 0%, #fff 100%)", padding: "80px 40px 96px" }}>
      <div style={{ maxWidth: "1700px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "88px", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 560px", maxWidth: "780px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px", flexWrap: "wrap" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", background: "#E8F0FE", borderRadius: "24px" }}>
              <GDots size={7} />
              <span style={{ fontSize: "13px", fontWeight: 600, color: G.blue }}>Gestion indépendante de Business Profile</span>
            </div>
            <GuidedTourButton />
          </div>
          <h1 style={{ margin: "0 0 20px", fontSize: "clamp(34px, 4.8vw, 66px)", fontWeight: 700, letterSpacing: "-1.6px", lineHeight: 1.12, color: "#202124" }}>
            Vos avis Google pris en charge.<br />
            <span style={{ color: G.green }}>Selon votre choix.</span>
          </h1>
          <p style={{ margin: "0 0 36px", fontSize: "20px", lineHeight: 1.6, color: "#5F6368", maxWidth: "660px" }}>
            Vos nouveaux avis sont vérifiés <strong>chaque heure</strong>. Vous choisissez : garder la main, déléguer les <span style={{ color: G.yellow, fontWeight: 700 }}>4–5★</span>, ou confier tous les avis à Caela avec contrôle humain sur les avis sensibles.<br />
            <strong>Le mandat est désactivé par défaut et révocable à tout moment.</strong>
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
            <a href="/signup?plan=solo" onClick={() => trackClic("bouton_essai-gratuit_hero")} className="rp-cta-hover" style={{ padding: "13px 28px", background: G.blue, color: "#fff", textDecoration: "none", borderRadius: "6px", fontSize: "15px", fontWeight: 600, boxShadow: `0 2px 8px ${G.blue}40` }}>
              Essai gratuit 14 jours
            </a>
            <a href="#calculator" className="rp-cta-hover" style={{ padding: "13px 28px", background: "#fff", border: "1px solid #DADCE0", color: "#202124", textDecoration: "none", borderRadius: "6px", fontSize: "15px", fontWeight: 600, boxShadow: SHADOW_SM, display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{ fontSize: "16px" }}>▶</span> Voir comment ça fonctionne
            </a>
          </div>
          <p style={{ margin: "0 0 24px", fontSize: "12px", color: "#80868B" }}>
            14 jours pour tester. Carte requise, rappel 3 jours avant le premier prélèvement. Résiliation en 2 clics.
          </p>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {[
              { icon: "🇫🇷", label: "100% français", color: G.blue },
              { icon: "⚡", label: "Synchronisation horaire", color: G.green },
              { icon: "🔒", label: "OAuth · API officielle", color: G.red },
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
      </div>
      </section>

      {/* ── METRICS ── */}
      <div style={{ background: "#F8F9FA", borderTop: "1px solid #DADCE0", borderBottom: "1px solid #DADCE0" }}>
        <div style={{ maxWidth: "1700px", margin: "0 auto", display: "flex", flexWrap: "wrap" }}>
          {[
            { value: "4-5★", label: "Réponse automatique", color: G.yellow },
            { value: "1 h", label: "Cadence de synchronisation visée", color: G.green },
            { value: "3 tons", label: "Suggestions par avis négatif", color: G.blue },
            { value: "Chaque heure", label: "Filet de sécurité planifié", color: G.red },
          ].map((s, i) => (
            <div key={s.label} style={{ flex: 1, minWidth: "150px", padding: "26px 20px", textAlign: "center", borderRight: i < 3 ? "1px solid #DADCE0" : "none" }}>
              <div style={{ fontSize: "26px", fontWeight: 700, color: s.color, letterSpacing: "-0.5px" }}>{s.value}</div>
              <div style={{ fontSize: "12px", color: "#5F6368", marginTop: "3px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CALCULATEUR / COMMENT ÇA MARCHE (fusion 2026-08-08, refonte 2026-08-28 :
          un seul bloc à la fois au lieu de deux cartes serrées côte à côte) ── */}
      <section id="calculator" style={{ background: "#F8F9FA", borderTop: "1px solid #DADCE0", padding: "80px 40px" }}>
        <CalculatorFlowBanner />
      </section>

      {/* ── WHY NOT DIY ── */}
      <section style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: "1700px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "44px" }}>
            <div style={{ display: "inline-block", padding: "4px 14px", background: "#FCE8E6", borderRadius: "24px", fontSize: "12px", fontWeight: 600, color: G.red, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.6px", minHeight: "1.4em" }}>
              <TypewriterText text={'"Je peux le faire moi-même"'} />
            </div>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, letterSpacing: "-0.8px", color: "#202124" }}>
              Techniquement oui. Intelligemment non.
            </h2>
            <p style={{ margin: "0 auto", maxWidth: isMobile ? "300px" : "620px", fontSize: isMobile ? "13px" : "15px", color: "#5F6368", lineHeight: 1.6, whiteSpace: isMobile ? "normal" : "nowrap" }}>
              Répondre manuellement c&apos;est gratuit. Jusqu&apos;à ce que tu calcules ce que ça coûte vraiment.
            </p>
          </div>

          <DIYCardsCarousel />

          <DIYComparison />
        </div>
      </section>

      {/* ── COMPETITOR TABLE ── */}
      <section style={{ background: "#F8F9FA", borderTop: "1px solid #DADCE0", padding: "80px 40px" }}>
        <div style={{ maxWidth: "1700px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 700, letterSpacing: "-0.8px", color: "#202124" }}>
              Pourquoi Caela Réputation ?
            </h2>
            <p style={{ margin: 0, fontSize: "14px", color: "#5F6368" }}>Panel fonctionnel vérifié le 8 septembre 2026. Les concurrents sans tarif public sont indiqués « sur devis ».</p>
          </div>

          {/* Accordéon fermé par défaut : le comparatif détaillé (5 concurrents,
              prix, tableau) est de l'info dense utile pour un visiteur déjà en
              phase de comparaison, pas pour tout le monde au premier scroll —
              évite d'empiler tarifs + comparatif + packs GMB + NFC d'affilée. */}
          <details className="rp-accordion">
            <summary style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              padding: "14px 22px", background: "#fff", border: `1px solid ${G.blue}40`, borderRadius: "10px",
              fontSize: "14px", fontWeight: 700, color: G.blue, boxShadow: SHADOW_SM,
              maxWidth: "440px", margin: "0 auto",
            }}>
              📊 Voir le comparatif détaillé
              <span className="rp-chevron" style={{ fontSize: "12px" }}>▾</span>
            </summary>

          <div style={{ marginTop: "20px" }}>
          <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", overflowX: "auto", boxShadow: SHADOW_SM }}>
            <table style={{ width: "100%", minWidth: "640px", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8F9FA" }}>
                  {["Solution", "Solo", "Multi-lieux", "Agence", "IA auto", "FR", "Google", "Essai gratuit"].map(col => (
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
                    <td style={{ padding: "12px 14px", fontSize: "13px", color: c.highlight ? G.green : "#202124", fontWeight: c.highlight ? 700 : 400 }}>{c.agency}{c.agency === "Custom" && <span style={{ display: "block", fontSize: "10px", color: "#80868B", fontWeight: 400 }}>sur devis</span>}</td>
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
            Sources consultées le 8 septembre 2026 : pages produit et tarifs officielles de Partoo, Birdeye et Uberall. Les fonctionnalités et tarifs peuvent évoluer.
          </p>

          {/* Why not the US tool — largeurs bornées des deux côtés (au lieu
              d'un flex:1 qui étirait le paragraphe sur toute la largeur
              restante et créait un grand vide avant la checklist). */}
          <div style={{ marginTop: "20px", maxWidth: "1100px", margin: "20px auto 0", background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px", padding: "24px 28px", boxShadow: SHADOW_SM }}>
            <div style={{ display: "flex", gap: "40px", alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 380px", maxWidth: "560px" }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: G.red, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>
                  🇺🇸 getreviewpilot.ai existe. Pourquoi choisir le français ?
                </div>
                <p style={{ margin: 0, fontSize: "15px", color: "#5F6368", lineHeight: 1.7 }}>
                  Même Claude AI, $29/mois — mais anglais, sans RGPD ni support FR. &quot;C&apos;est pas top&quot; ? Traduit mot à mot, pas compris.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: "0 0 auto", minWidth: "220px" }}>
                {[
                  { label: "Réponses en français naturel", ok: true },
                  { label: "Support humain en français", ok: true },
                  { label: "RGPD — données en Europe", ok: true },
                  { label: "NFC plaques physiques", ok: true },
                  { label: "Services GMB inclus", ok: true },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ color: G.green, fontWeight: 700, fontSize: "15px" }}>{item.ok ? "✓" : "✗"}</span>
                    <span style={{ fontSize: "14px", color: "#5F6368" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
          </details>
        </div>
      </section>

      {/* ── VIDÉOS EXPLICATIVES (bientôt) ── */}
      <section style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: "1700px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <div style={{ display: "inline-block", padding: "4px 14px", background: "#E8F0FE", borderRadius: "24px", fontSize: "12px", fontWeight: 600, color: G.blue, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.6px" }}>
              🎬 Bientôt disponible
            </div>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, letterSpacing: "-0.8px", color: "#202124" }}>
              8 vidéos de quelques minutes pour tout comprendre
            </h2>
            <p style={{ margin: "0 auto", maxWidth: "560px", fontSize: "15px", color: "#5F6368", lineHeight: 1.6 }}>
              Un sujet, une réponse claire. De la gestion des avis aux plaques NFC, en passant par le comparatif honnête avec le faire-soi-même. En cours de tournage.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px" }}>
            {VIDEO_TOPICS.map((v, i) => (
              <div
                key={v.title}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = SHADOW_LG; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = SHADOW_SM; }}
                style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "14px", overflow: "hidden", boxShadow: SHADOW_SM, transition: "transform 0.22s ease, box-shadow 0.22s ease" }}
              >
                {/* Vignette vidéo mockup : dégradé de marque + numéro + bouton
                    play, pour se lire comme une vraie miniature en attendant
                    le tournage — pas juste une icône dans une carte plate. */}
                <div style={{
                  height: "120px", position: "relative", overflow: "hidden",
                  background: `linear-gradient(135deg, ${[G.blue, G.green, G.yellow, G.red][i % 4]}25, ${[G.blue, G.green, G.yellow, G.red][(i + 1) % 4]}15)`,
                }}>
                  <span style={{ position: "absolute", top: "10px", left: "12px", fontSize: "11px", fontWeight: 700, color: "#5F6368", background: "rgba(255,255,255,0.85)", padding: "3px 8px", borderRadius: "10px" }}>#{i + 1}</span>
                  <span style={{ position: "absolute", bottom: "10px", right: "12px", fontSize: "11px", fontWeight: 700, color: "#fff", background: "rgba(32,33,36,0.7)", padding: "3px 8px", borderRadius: "10px" }}>{v.duration}</span>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "46px", height: "46px", borderRadius: "50%", background: "rgba(255,255,255,0.92)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: SHADOW_MD, fontSize: "22px" }}>
                    {v.icon}
                  </div>
                </div>
                <p style={{ margin: 0, padding: "16px 18px", fontSize: "14.5px", fontWeight: 600, color: "#202124", lineHeight: 1.5 }}>{v.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXEMPLES DE RÉPONSES ── */}
      <section style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: "1700px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "44px" }}>
            <div style={{ display: "inline-block", padding: "4px 14px", background: "#FEF7E0", borderRadius: "24px", fontSize: "12px", fontWeight: 600, color: "#F9AB00", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.6px" }}>
              Exemples de réponses
            </div>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(24px, 3.5vw, 36px)", fontWeight: 700, letterSpacing: "-0.8px", color: "#202124" }}>
              L&apos;avis reçu, la réponse générée
            </h2>
            <p style={{ margin: 0, fontSize: "15px", color: "#5F6368" }}>Exemples illustratifs du ton de l&apos;IA. Caela Réputation est en lancement — aucun de ces avis n&apos;est réel.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: "20px" }}>
            {REPLY_EXAMPLES.map((ex, i) => <ReplyExampleCard key={ex.incoming} ex={ex} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── SERVICES CAELA ── */}
      <section id="services" style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: "1700px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "44px" }}>
            <div style={{ display: "inline-block", padding: "4px 14px", background: "#E6F4EA", borderRadius: "24px", fontSize: "12px", fontWeight: 600, color: G.green, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.6px" }}>Service humain Caela Agency — pas un abonnement IA</div>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 700, letterSpacing: "-0.8px", color: "#202124" }}>
              On gère votre présence Google Business Profile
            </h2>
            <p style={{ margin: "0 auto", maxWidth: "500px", fontSize: "15px", color: "#5F6368", lineHeight: 1.6 }}>
              L&apos;abonnement Caela Réputation ci-dessous automatise vos réponses. Ici, c&apos;est différent : une vraie personne s&apos;occupe pour vous de créer, optimiser et faire vivre votre fiche Google.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "16px" }}>
            {GMB_SERVICES.map(s => (
              <div key={s.title} style={{ background: "#fff", border: s.highlight ? `2px solid ${s.color}` : "1px solid #DADCE0", borderRadius: "12px", padding: "24px", boxShadow: s.highlight ? `0 4px 16px ${s.color}20` : SHADOW_SM, position: "relative", overflow: "hidden" }}>
                {s.highlight && <div style={{ position: "absolute", top: "13px", right: "13px", padding: "2px 10px", background: s.bg, borderRadius: "20px", fontSize: "10px", fontWeight: 700, color: s.color }}>Recommandé</div>}
                <div style={{ width: "42px", height: "42px", background: s.bg, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "19px", marginBottom: "12px" }}>{s.icon}</div>
                <div style={{ fontSize: "10px", fontWeight: 600, color: s.color, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>{s.tag}</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 8px", background: "#F1F3F4", borderRadius: "10px", fontSize: "10px", fontWeight: 600, color: "#5F6368", marginBottom: "8px" }}>👤 Traité par un humain, pas par l&apos;IA</div>
                <h3 style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 600, color: "#202124" }}>{s.title}</h3>
                <p style={{ margin: "0 0 14px", fontSize: "13px", color: "#5F6368", lineHeight: 1.6 }}>{s.desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "7px", marginBottom: "16px" }}>
                  {s.features.map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "7px" }}>
                      <span style={{ color: s.color, fontWeight: 700, fontSize: "12px", lineHeight: 1.5 }}>✓</span>
                      <span style={{ fontSize: "12.5px", color: "#3C4043", lineHeight: 1.5 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "20px", fontWeight: 700, color: s.color }}>{s.price}</span>
                  {s.oldPrice && <span style={{ fontSize: "13px", color: "#80868B", textDecoration: "line-through" }}>{s.oldPrice}</span>}
                </div>
                <a href="mailto:contact@caela.fr" style={{ display: "block", textAlign: "center", padding: "10px", background: s.highlight ? s.color : s.bg, borderRadius: "6px", color: s.highlight ? "#fff" : s.color, textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>Contacter →</a>
                {s.title === "Pack Croissance" && (
                  <a href="#pricing" style={{ display: "block", textAlign: "center", marginTop: "8px", padding: "9px", border: `1px solid ${G.blue}40`, background: "#E8F0FE", borderRadius: "6px", fontSize: "12px", color: G.blue, textDecoration: "none", fontWeight: 700 }}>
                    🤖 Voir l&apos;IA à 39€/mois →
                  </a>
                )}
              </div>
            ))}
          </div>
          {/* Retrait des faux avis + réduction plaques NFC : deux bannières
              autrefois empilées pleine largeur, ce qui laissait un grand vide
              central une fois la section élargie (justify-content:space-between
              sur 1700px). Fusionnées en une grille 2 colonnes = une seule
              rangée, plus de vide mort. CTA NFC corrigé : "audit gratuit"
              n'a aucun sens sur une offre plaques (l'audit, c'est pour la
              fiche GMB) — remplacé par un lien direct vers la section NFC. */}
          <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(360px, 100%), 1fr))", gap: "12px" }}>
            <div style={{ background: "#FCE8E6", border: `1px solid ${G.red}30`, borderRadius: "12px", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "22px" }}>🚫</span>
                <div>
                  <h3 style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: 700, color: "#202124" }}>{FAKE_REVIEW_REMOVAL.title}</h3>
                  <p style={{ margin: 0, fontSize: "12px", color: "#5F6368" }}>{FAKE_REVIEW_REMOVAL.desc}</p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <a href="/signaler-avis" style={{ padding: "9px 16px", background: G.red, color: "#fff", textDecoration: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 700, whiteSpace: "nowrap" }}>Signaler un avis →</a>
                <a href="/blog/faire-retirer-faux-avis-google" style={{ color: G.red, fontWeight: 600, fontSize: "12px", textDecoration: "underline" }}>ⓘ Comment ça marche</a>
              </div>
            </div>

            <div style={{ background: "linear-gradient(135deg, #E8F0FE, #E6F4EA)", border: "1px solid #DADCE0", borderRadius: "12px", padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "22px" }}>🏷️</span>
                <div>
                  <h3 style={{ margin: "0 0 2px", fontSize: "14px", fontWeight: 700, color: "#202124" }}>Vos avis Google, en vitrine physique</h3>
                  <p style={{ margin: 0, fontSize: "12px", color: "#5F6368" }}>Une plaque NFC raccourcit le parcours : le client approche son téléphone et ouvre le lien d&apos;avis, sans application Caela.</p>
                </div>
              </div>
              <a href="#nfc" style={{ padding: "8px 14px", background: G.blue, color: "#fff", textDecoration: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
                Voir les plaques →
              </a>
            </div>
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

      {/* ── PONT SERVICES <-> PRICING ──
          Les deux sections sont adjacentes depuis le réordonnancement du
          29/08 : au lieu de compter sur un lien discret par carte (raté,
          trop gris pour être vu), une bannière pleine largeur, impossible à
          manquer, explique que les deux offres sont complémentaires — pas
          deux façons concurrentes de payer pour la même chose. */}
      <div className="rp-section-bridge" style={{ padding: "0 40px" }}>
        <a href="#pricing" style={{
          display: "block", maxWidth: "1700px", margin: "0 auto", textDecoration: "none",
          background: "linear-gradient(90deg, #E6F4EA, #E8F0FE)", border: "1px solid #DADCE0",
          borderRadius: "14px", padding: "20px 28px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", flexWrap: "wrap", textAlign: "center" }}>
            <span style={{ fontSize: "22px" }}>🤝</span>
            <span style={{ fontSize: "14.5px", fontWeight: 700, color: "#202124" }}>
              Les services ci-dessus (humains) et l&apos;abonnement ci-dessous (IA) sont complémentaires, pas concurrents — la plupart des clients n&apos;ont besoin que de l&apos;un des deux.
            </span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: G.blue, whiteSpace: "nowrap" }}>Voir l&apos;abonnement IA ↓</span>
          </div>
        </a>
      </div>

      {/* ── PRICING ── */}
      {/* id="tarifs" en alias : ancre stable utilisée par les CTA "Voir les tarifs"
          du dashboard, en plus de #pricing déjà référencé ailleurs sur la page. */}
      <div id="tarifs" style={{ position: "relative", top: "-1px" }} />
      <section id="pricing" style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: "1700px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "44px" }}>
            <h2 style={{ margin: "0 0 10px", fontSize: "clamp(24px, 3.5vw, 38px)", fontWeight: 700, letterSpacing: "-0.8px", color: "#202124" }}>
              L&apos;abonnement qui répond à vos avis. Dès 39€/mois.
            </h2>
            <p style={{ margin: "0 0 18px", fontSize: "15px", color: "#5F6368" }}>Sans engagement. Annulez quand vous voulez.</p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 16px", background: "#E6F4EA", borderRadius: "20px", maxWidth: "440px" }}>
                <span style={{ fontSize: "16px", flexShrink: 0 }}>✨</span>
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
          </div>

          {/* maxWidth resserré à 900px (au lieu des 1700 du reste de la page) :
              3 cartes de tarifs sur toute la largeur laissaient un vide énorme
              entre elles, ce n'est pas un tableau à faire respirer comme le
              reste de la home. */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "14px", alignItems: "start", maxWidth: "900px", margin: "0 auto" }}>
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
                  {plan.highlight && <div style={{ position: "absolute", top: "12px", right: "14px", padding: "3px 9px", background: plan.color + "15", borderRadius: "20px", fontSize: "10.5px", fontWeight: 700, color: plan.color }}>POPULAIRE</div>}
                  <p style={{ margin: "0 0 3px", fontSize: "13px", fontWeight: 700, color: plan.color, textTransform: "uppercase", letterSpacing: "0.5px" }}>{plan.name}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "4px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "40px", fontWeight: 700, color: "#202124", letterSpacing: "-1px" }}>{price}€</span>
                    <span style={{ fontSize: "14px", color: "#5F6368" }}>/mois</span>
                    {billing === "annual" && (
                      <span style={{ fontSize: "16px", color: "#80868B", textDecoration: "line-through", marginLeft: "4px" }}>{plan.price}€</span>
                    )}
                  </div>
                  <p style={{ margin: "0 0 5px", fontSize: "13.5px", color: "#5F6368" }}>{plan.desc}</p>
                  {billing === "annual" && <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 9px", background: "#E6F4EA", borderRadius: "20px", fontSize: "12.5px", fontWeight: 700, color: G.green, marginBottom: "9px" }}>🎁 -{savings}€/an</div>}
                  <div style={{ fontSize: "13px", color: plan.color, marginBottom: "16px", fontWeight: 500 }}>{plan.best}</div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "9px", marginBottom: "20px" }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: "flex", gap: "8px" }}>
                        <span style={{ color: plan.color, fontWeight: 700, fontSize: "13.5px", flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: "14px", color: "#5F6368", lineHeight: 1.45 }}>{f}</span>
                      </div>
                    ))}
                    {plan.missing.map(f => (
                      <div key={f} style={{ display: "flex", gap: "8px" }}>
                        <span style={{ color: "#DADCE0", fontWeight: 700, fontSize: "13.5px", flexShrink: 0 }}>—</span>
                        <span style={{ fontSize: "14px", color: "#DADCE0", lineHeight: 1.45 }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  <a href={`/signup?plan=${plan.name.toLowerCase()}&billing=${billing}`} onClick={() => trackClic(`bouton_essai-gratuit_pricing-${plan.name.toLowerCase()}`)} style={{ display: "block", textAlign: "center", padding: "12px", background: plan.highlight ? plan.color : plan.color + "12", border: `1px solid ${plan.color}${plan.highlight ? "00" : "25"}`, borderRadius: "8px", color: plan.highlight ? "#fff" : plan.color, textDecoration: "none", fontSize: "14.5px", fontWeight: 700 }}>
                    {plan.cta}
                  </a>
                </div>
              );
            })}
          </div>

          {/* Mention légale de facturation (art. L221-5 Code conso) — anti dark pattern.
              Condensée le 08/08 pour tenir en 2 lignes tout en gardant les mentions
              obligatoires : durée, CB requise, prix au tarif affiché sauf résiliation,
              résiliation en 2 clics, rappel avant prélèvement. */}
          <div style={{ marginTop: "20px", maxWidth: "620px", margin: "20px auto 0", textAlign: "center" }}>
            <p style={{ fontSize: "12px", lineHeight: 1.7, color: "#80868B", margin: 0 }}>
              Essai gratuit 14 jours, <strong>carte bancaire requise</strong> — au tarif affiché à la fin de l&apos;essai <strong>sauf résiliation avant son terme</strong>.
              <br />
              Résiliable en 2 clics, rappel email 3 jours avant le 1er prélèvement. Voir les <a href="/cgv" style={{ color: G.blue, textDecoration: "none" }}>CGV</a>.
              <br />
              Les avis 1–3 ★ restent soumis à validation humaine. Leur prise en charge par l&apos;équipe Caela est une prestation distincte, activée sur contrat. Les fonctions Google sont ouvertes uniquement après les autorisations de plateforme requises.
            </p>
          </div>

          {/* Agency discreet line */}
          <div style={{ marginTop: "12px", textAlign: "center" }}>
            <span style={{ fontSize: "13px", color: "#80868B" }}>
              Plus de 5 établissements ou plus de 1 000 avis/mois ?{" "}
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

          {/* Parrainage + Zéro risque : bornées à 900px comme les cartes de
              tarifs juste au-dessus (au lieu de pleine largeur 1700px, qui
              laissait un grand vide coloré à droite du texte) et mises côte
              à côte plutôt qu'empilées. */}
          <div style={{ marginTop: "20px", maxWidth: "940px", margin: "20px auto 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(340px, 100%), 1fr))", gap: "12px" }}>
            <div style={{ padding: "18px 22px", background: "#FEF7E0", borderRadius: "10px", display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={{ fontSize: "17px" }}>🎁</span>
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#7A5C00", marginBottom: "4px" }}>Parrainez, économisez à deux</div>
                <div style={{ fontSize: "13px", color: "#5F6368", lineHeight: 1.55 }}><strong>1 mois offert</strong> pour vous, <strong>-15%</strong> pour la personne parrainée — code personnel dans ton dashboard. <a href="/parrainage" style={{ color: "#7A5C00", fontWeight: 600, textDecoration: "underline" }}>En savoir plus →</a></div>
              </div>
            </div>

            <div style={{ padding: "18px 22px", background: "#E8F0FE", borderRadius: "10px", display: "flex", gap: "10px", alignItems: "center" }}>
              <span style={{ fontSize: "17px" }}>🔒</span>
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 600, color: G.blue, marginBottom: "4px" }}>Vous gardez le contrôle de votre fiche</div>
                <div style={{ fontSize: "13px", color: "#5F6368", lineHeight: 1.55 }}>Connexion OAuth et API Business Profile officielles. Vous choisissez le périmètre délégué et pouvez retirer l&apos;accès à tout moment.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ancre discrète pour les liens "Se connecter" qui pointaient sur
          #login (scroll-behavior smooth global) — le widget lui-même est en
          position fixed plus bas et s'ouvre via setLoginWidgetOpen. */}
      <div id="login" />

      {/* ── NFC PLATES ── */}
      <section id="nfc" style={{ background: "#F8F9FA", borderTop: "1px solid #DADCE0", padding: "80px 40px" }}>
        <div style={{ maxWidth: "1700px", margin: "0 auto" }}>
          {/* Intro en 2 colonnes (texte + étapes à gauche, vraie photo produit
              à droite) au lieu d'un bloc centré empilé avec l'image en dessous
              — même logique que le hero, pour que la section respire au lieu
              d'accumuler des cartes séparées les unes sous les autres. */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "64px", flexWrap: "wrap", marginBottom: "36px" }}>
            <div style={{ flex: "1 1 440px", maxWidth: "600px" }}>
              <div style={{ display: "inline-block", padding: "4px 14px", background: "#E8F0FE", borderRadius: "24px", fontSize: "12px", fontWeight: 600, color: G.blue, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.6px" }}>
                Produit physique
              </div>
              <h2 style={{ margin: "0 0 12px", fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 700, letterSpacing: "-0.8px", color: "#202124", lineHeight: 1.2 }}>
                Facilitez la collecte d&apos;avis avec nos plaques NFC
              </h2>
              <p style={{ margin: "0 0 28px", fontSize: "15px", color: "#5F6368", lineHeight: 1.65 }}>
                Posez la plaque sur votre comptoir. Le téléphone ouvre le lien d&apos;avis configuré ; le client reste libre de publier un avis positif ou négatif.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  { step: "1", icon: "📱", title: "Le client approche son téléphone", desc: "Aucune application Caela à installer ; un QR de secours reste disponible.", color: G.blue },
                  { step: "2", icon: "⭐", title: "Le lien d'avis s'ouvre", desc: "La plaque utilise le lien configuré pour l'établissement.", color: G.yellow },
                  { step: "3", icon: "✅", title: "Il partage librement son expérience", desc: "Aucun filtrage selon la satisfaction ou la note choisie.", color: G.green },
                ].map((s) => (
                  <div key={s.title} style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    <div style={{ width: "38px", height: "38px", flexShrink: 0, borderRadius: "50%", background: s.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px" }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize: "10.5px", fontWeight: 700, color: s.color, letterSpacing: "0.4px", marginBottom: "2px" }}>ÉTAPE {s.step}</div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#202124", marginBottom: "2px" }}>{s.title}</div>
                      <div style={{ fontSize: "12.5px", color: "#5F6368", lineHeight: 1.5 }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rp-float" style={{ flex: "0 0 auto" }}>
              <Image
                src="/nfc/plaque-produit-caela.png"
                alt="Plaque NFC Caela Réputation — posez votre téléphone pour laisser un avis Google"
                width={340}
                height={340}
                style={{ borderRadius: "20px", boxShadow: SHADOW_XL, display: "block" }}
              />
            </div>
          </div>

          {/* Plaque seule vs plaque + moteur — réponse aux concurrents hardware (bostap & co) */}
          <FadeInOnView>
          <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "14px", overflow: "hidden", marginBottom: "28px" }}>
            <div style={{ padding: "24px 28px 22px", textAlign: "center" }}>
              <h3 style={{ margin: "0 0 8px", fontSize: "clamp(18px, 2.4vw, 24px)", fontWeight: 700, color: "#202124", letterSpacing: "-0.5px" }}>
                Une plaque NFC coûte 20€. Ce qu&apos;on en fait ensuite, c&apos;est tout l&apos;enjeu.
              </h3>
              <p style={{ margin: "0 auto", maxWidth: "560px", fontSize: "14px", color: "#5F6368", lineHeight: 1.6 }}>
                La plupart des plaques du marché envoient le client sur Google. Puis plus rien. Nous, la plaque n&apos;est que le point de départ.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              <div style={{ padding: "24px 28px", borderRight: "1px solid #DADCE0" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#80868B", marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Une plaque NFC seule</div>
                {[
                  "Envoie le client sur votre fiche Google. C'est tout.",
                  "Le client scanne, part, et disparaît. Aucun contact récupéré.",
                  "Tous les clients peuvent publier librement un avis positif ou négatif.",
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
                  "Après consentement et activation, Caela applique le mode de réponse choisi dès la détection.",
                  "Roue de la fortune (propulsée par Gagnify) : le client laisse son email/SMS avant de jouer. Vous gardez le contact.",
                  "Tous les clients accèdent au même lien d'avis, sans filtrage selon leur satisfaction.",
                  "Chaque avis négatif : suggestions au commerçant ou prise en charge humaine par Caela, selon son choix.",
                  "Dashboard : note, volume, tendance, rapport hebdo par email.",
                  "Widget d'avis sur votre site, sous réserve des droits d'affichage de la plateforme source.",
                ].map(item => (
                  <div key={item} style={{ display: "flex", gap: "8px", marginBottom: "9px" }}>
                    <span style={{ color: G.green, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: "13px", color: "#202124", lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </FadeInOnView>

        </div>

        {/* NFC Packs — sort volontairement du conteneur maxWidth:1100 pour
            défiler d'un bord d'écran à l'autre (demandé le 08/08), cartes
            agrandies. Défilement manuel (pas de marquee auto : ce sont des
            offres à lire et cliquer, pas de la réassurance passive). */}
        <div className="rp-nfc-packs-scroll" style={{ overflowX: "auto", paddingBottom: "10px" }}>
          <div className="rp-nfc-packs-track" style={{ display: "flex", gap: "20px", padding: "0 40px", width: "max-content", margin: "0 auto" }}>
            {NFC_PACKS.map(p => (
              <div className="rp-nfc-pack-card" key={p.name} style={{ width: "340px", flexShrink: 0, background: "#fff", border: p.highlight ? `2px solid ${p.color}` : "1px solid #DADCE0", borderRadius: "14px", padding: "30px", boxShadow: p.highlight ? `0 4px 16px ${p.color}20` : SHADOW_SM, position: "relative" }}>
                {p.highlight && <div style={{ position: "absolute", top: "16px", right: "16px", padding: "3px 12px", background: p.color + "15", borderRadius: "20px", fontSize: "11px", fontWeight: 700, color: p.color }}>Le plus populaire</div>}
                <div style={{ fontSize: "12px", fontWeight: 600, color: p.color, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "5px" }}>{p.qty}</div>
                <h3 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: 700, color: "#202124" }}>{p.name}</h3>
                <div style={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
                  <span style={{ fontSize: "32px", fontWeight: 800, color: p.color }}>{p.price}</span>
                  {p.oldPrice && <span style={{ fontSize: "16px", color: "#80868B", textDecoration: "line-through" }}>{p.oldPrice}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                  <span style={{ fontSize: "13px", color: "#5F6368" }}>{p.unit}</span>
                  {p.oldPrice && (
                    <span style={{ padding: "2px 8px", background: p.color + "15", borderRadius: "10px", fontSize: "11px", fontWeight: 700, color: p.color }}>
                      Économisez {parseInt(p.oldPrice) - parseInt(p.price)}€
                    </span>
                  )}
                </div>
                {p.features.map(f => (
                  <div key={f} style={{ display: "flex", gap: "9px", marginBottom: "9px" }}>
                    <span style={{ color: p.color, fontWeight: 700, fontSize: "13px" }}>✓</span>
                    <span style={{ fontSize: "14px", color: "#5F6368" }}>{f}</span>
                  </div>
                ))}
                <a href="mailto:contact@caela.fr" style={{ display: "block", textAlign: "center", marginTop: "20px", padding: "12px", background: p.highlight ? p.color : p.color + "15", border: `1px solid ${p.color}30`, borderRadius: "8px", color: p.highlight ? "#fff" : p.color, textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>
                  Commander →
                </a>
              </div>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: "1700px", margin: "0 auto" }}>
          {/* Bande de réassurance — défile automatiquement (marquee), en boucle,
              pause au survol/tap pour rester lisible. Contenu dupliqué x2 pour
              une boucle sans à-coup (translateX(-50%) = exactement un set). */}
          <div className="rp-marquee-mask" style={{ marginTop: "16px", overflow: "hidden", paddingBottom: "6px" }}>
            <div className="rp-marquee-track" style={{ display: "flex", gap: "12px", width: "max-content" }}>
              {[...NFC_REASSURANCE, ...NFC_REASSURANCE].map((r, i) => (
                <div key={r.title + i} style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: "10px", padding: "16px 18px", display: "flex", gap: "12px", alignItems: "flex-start", flexShrink: 0, width: "260px" }}>
                  <span style={{ fontSize: "20px", flexShrink: 0 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#202124", marginBottom: "3px" }}>{r.title}</div>
                    <div style={{ fontSize: "12px", color: "#5F6368", lineHeight: 1.5 }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "12px", background: "#fff", border: "1px solid #DADCE0", borderRadius: "10px", padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <span style={{ fontSize: "20px" }}>💡</span>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#5F6368", lineHeight: 1.5 }}>
                <strong style={{ color: "#202124" }}>Le parcours complet :</strong> la plaque facilite une demande neutre d&apos;avis et Caela prend en charge le suivi. Google indique que le volume et la note peuvent contribuer à la notoriété locale, sans garantir une position.
              </p>
              <p style={{ margin: 0, fontSize: "13px", color: G.green, fontWeight: 700, lineHeight: 1.5 }}>
                -20% sur ce pack si vous êtes déjà client Pack Lancement ou Pack Croissance (voir ci-dessus).
              </p>
            </div>
          </div>
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
      {showEcoBanner && !isMobile && (
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
      )}

      {/* ── WIDGET S'INSCRIRE / SE CONNECTER ──
          Remplace le 08/08 l'ancienne section "Se connecter" statique et
          permanente au milieu de la page. Maintenant : un onglet qui dépasse
          en bas d'écran avec un CTA intriguant, qui s'ouvre au survol
          (desktop) ou au clic (tactile). L'inscription est mise en avant ;
          la connexion reste accessible via un lien secondaire, sans jamais
          être le mode par défaut.
          Centré sur desktop. Sur mobile, décalé à gauche avec la même
          réserve que la bannière écosystème (right:78) pour ne jamais
          chevaucher la bulle ChatBot (bas-droite) — un widget centré pleine
          largeur passerait pile dessus. */}
      <div
        onMouseEnter={() => !isMobile && setLoginWidgetOpen(true)}
        onMouseLeave={() => !isMobile && setLoginWidgetOpen(false)}
        style={{
          position: "fixed",
          // Décalé au-dessus de la bannière écosystème mobile quand elle est
          // affichée (toutes deux fixed en bas, sinon superposition garantie
          // sur petit écran).
          bottom: 0,
          ...(isMobile
            ? { left: "10px", right: "78px", transform: `translateY(${loginWidgetOpen ? "0" : "calc(100% - 58px)"})` }
            : { left: "50%", width: "360px", maxWidth: "94vw", transform: `translateX(-50%) translateY(${loginWidgetOpen ? "0" : "calc(100% - 58px)"})` }),
          transition: "bottom 0.25s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1)",
          zIndex: 92,
        }}
      >
        <div className={loginWidgetOpen ? "" : "rp-widget-nudge"} style={{ background: "#fff", border: "1px solid #DADCE0", borderTopLeftRadius: "18px", borderTopRightRadius: "18px", boxShadow: "0 -10px 32px rgba(36,87,197,0.22)", overflow: "hidden" }}>
          {/* Poignée toujours visible, même repliée — dégradé bleu de marque
              + halo pulsé (au lieu d'un gris plat) pour être visible sans
              avoir à la chercher, et plus grande pour se lire de loin. */}
          <button
            onClick={() => setLoginWidgetOpen(o => !o)}
            className={loginWidgetOpen ? "" : "rp-chat-pulse"}
            style={{
              width: "100%", padding: "16px 18px", background: "linear-gradient(135deg, #2457C5, #183F93)", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontFamily: "inherit",
            }}
          >
            <span className="rp-bounce-icon" style={{ fontSize: "19px", flexShrink: 0 }}>🚀</span>
            <span style={{ fontSize: isMobile ? "13.5px" : "15px", fontWeight: 700, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {widgetMode === "login" ? "Se connecter" : "Essai gratuit en 2 minutes"}
            </span>
          </button>

          <div style={{ padding: "22px 24px 24px" }}>
            {widgetMode === "signup" ? (
              <>
                <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: "#202124" }}>2 minutes pour tester, sans y penser ensuite.</p>
                <p style={{ margin: "0 0 16px", fontSize: "12.5px", color: "#5F6368", lineHeight: 1.5 }}>
                  Synchronisation chaque heure. Réponse automatique aux avis 4-5★, validation humaine pour les avis 1-3★.
                </p>
                <a href="/signup?plan=solo" onClick={() => trackClic("bouton_essai-gratuit_widget-flottant")} style={{ display: "block", textAlign: "center", padding: "13px", background: G.blue, color: "#fff", textDecoration: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 700, boxShadow: `0 2px 10px ${G.blue}40`, marginBottom: "14px" }}>
                  Créer un compte gratuit →
                </a>
                <p style={{ textAlign: "center", margin: 0, fontSize: "12.5px", color: "#80868B" }}>
                  Déjà client ?{" "}
                  <button onClick={() => setWidgetMode("login")} style={{ background: "none", border: "none", padding: 0, color: G.blue, fontWeight: 600, fontSize: "12.5px", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
                    Se connecter
                  </button>
                </p>
              </>
            ) : (
              <>
                <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
                  {[
                    { label: "Adresse email", type: "email", value: email, setter: setEmail, placeholder: "vous@exemple.fr" },
                    { label: "Mot de passe", type: "password", value: password, setter: setPassword, placeholder: "••••••••" },
                  ].map(field => (
                    <div key={field.label} style={{ marginBottom: "10px" }}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#202124", marginBottom: "4px" }}>{field.label}</label>
                      <input
                        type={field.type} value={field.value}
                        onChange={(e) => field.setter(e.target.value)}
                        placeholder={field.placeholder} required
                        style={{ width: "100%", padding: "10px 12px", border: "1px solid #DADCE0", borderRadius: "6px", fontSize: "13px", color: "#202124", outline: "none", boxSizing: "border-box", background: "#fff", fontFamily: "inherit" }}
                        onFocus={(e) => { e.target.style.borderColor = G.blue; e.target.style.boxShadow = `0 0 0 2px ${G.blue}20`; }}
                        onBlur={(e) => { e.target.style.borderColor = "#DADCE0"; e.target.style.boxShadow = "none"; }}
                      />
                    </div>
                  ))}
                  {error && <div style={{ padding: "8px 12px", background: "#FCE8E6", borderRadius: "6px", color: G.red, fontSize: "12px", marginBottom: "10px" }}>⚠ {error}</div>}
                  <button type="submit" disabled={loading} style={{ width: "100%", padding: "11px", background: loading ? `${G.blue}80` : G.blue, border: "none", borderRadius: "6px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                    {loading ? "Connexion..." : "Se connecter"}
                  </button>
                </form>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                  <a href="/mot-de-passe-oublie" style={{ fontSize: "12px", color: G.blue, fontWeight: 600, textDecoration: "none" }}>Mot de passe oublié ?</a>
                  <button onClick={() => setWidgetMode("signup")} style={{ background: "none", border: "none", padding: 0, color: "#5F6368", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline" }}>
                    Pas de compte ?
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "14px 0" }}>
                  <div style={{ flex: 1, height: "1px", background: "#DADCE0" }} />
                  <span style={{ fontSize: "11px", color: "#80868B", fontWeight: 500 }}>Ou</span>
                  <div style={{ flex: 1, height: "1px", background: "#DADCE0" }} />
                </div>
                <a
                  href="https://caela-hub.vercel.app/api/sso/avis"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "10px", background: "#fff", border: "1px solid #DADCE0", borderRadius: "6px", color: "#202124", fontSize: "13px", fontWeight: 600, textDecoration: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                >
                  <GDots size={7} />
                  Se connecter avec Caela
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      <ChatBot />

      {/* ── ÉCOSYSTÈME CAELA ── */}
      <section id="ecosysteme" style={{ background: "#F8F9FA", borderTop: "1px solid #DADCE0", padding: "56px 40px" }}>
        <div style={{ maxWidth: "820px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 12px", fontSize: "22px", fontWeight: 700, color: "#202124" }}>
            Fait partie de l&apos;écosystème Caela
          </h2>
          <p style={{ margin: 0, fontSize: "15.5px", color: "#5F6368", lineHeight: 1.7 }}>
            Un compte, tous vos outils : Réservation (<a href="https://caelenda.fr" target="_blank" rel="noopener noreferrer" style={{ color: G.blue, textDecoration: "underline" }}>Caelenda</a>) · Fidélité (<a href="https://caela-rewards.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: G.blue, textDecoration: "underline" }}>Rewards</a>) · Jeux &amp; roues de la fortune (<a href="https://gagnify.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: G.blue, textDecoration: "underline" }}>Gagnify</a>) · Campagnes (<a href="https://caela-pulse.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: G.blue, textDecoration: "underline" }}>Pulse</a>) · QR dynamique (<a href="https://caela-qr.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: G.blue, textDecoration: "underline" }}>CaelaQR</a>).
            <br />
            Connexion unique entre tous les produits.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="rp-footer" style={{ background: "#fff", borderTop: "1px solid #DADCE0", padding: "28px 40px" }}>
        <div style={{ maxWidth: "1700px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <GDots size={7} />
              <span style={{ fontSize: "14px", fontWeight: 600, color: "#202124" }}>Caela Réputation by Caela Agency</span>
            </div>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              {[
                { label: "Blog", href: "/blog" },
                { label: "Confidentialité", href: "/politique-de-confidentialite" },
                { label: "Mentions légales", href: "/mentions-legales" },
                { label: "CGV / CGU", href: "/cgv" },
                { label: "Cookies", href: "/politique-de-cookies" },
                { label: "Travailler avec un tiers Google", href: "https://support.google.com/business/answer/7163406?hl=fr" },
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
          {/* Ordre inversé : la mention "non affilié à Google" est importante
              et doit rester lisible dans TOUS les états de scroll — le widget
              ChatBot est en position fixed bottom-right, il couvrait cette
              phrase en permanence quand elle était du même côté. */}
          <div style={{ borderTop: "1px solid #DADCE0", paddingTop: "14px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#80868B" }}>
              Caela Réputation est un outil indépendant, non affilié à Google LLC. &quot;Google&quot; et &quot;Google Business Profile&quot; sont des marques de Google LLC.
            </p>
            <p style={{ margin: 0, fontSize: "11px", color: "#80868B" }}>
              © 2026 Caela Agency · <a href="mailto:contact@caela.fr" style={{ color: "#80868B", textDecoration: "underline" }}>contact@caela.fr</a> · Tous droits réservés
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
