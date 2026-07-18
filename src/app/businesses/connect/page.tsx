"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const G = { blue: "#1A73E8", red: "#EA4335", green: "#34A853" };
const SHADOW = "0 1px 3px rgba(60,64,67,0.12), 0 1px 2px rgba(60,64,67,0.06)";

type Loc = { path: string; title: string; address: string };

export default function GoogleConnectPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Loc[] | null>(null);
  const [error, setError] = useState("");
  const [linkingPath, setLinkingPath] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/google/locations")
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || "load");
        setLocations(Array.isArray(d.locations) ? d.locations : []);
      })
      .catch(() => setError("La session de connexion a expiré. Relancez la connexion Google."));
  }, []);

  async function link(loc: Loc) {
    setLinkingPath(loc.path);
    setError("");
    try {
      const r = await fetch("/api/google/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationPath: loc.path, title: loc.title }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || "Rattachement impossible");
      router.push("/dashboard?google=connected");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setLinkingPath(null);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#202124", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
        Choisissez votre établissement
      </h1>
      <p style={{ fontSize: 14, color: "#5F6368", margin: "0 0 24px", lineHeight: 1.6 }}>
        Votre compte Google gère plusieurs fiches. Sélectionnez celle à connecter.
      </p>

      {error && (
        <div style={{ padding: "12px 16px", background: "#FCE8E6", border: "1px solid #F5B5AE", borderRadius: 10, color: G.red, fontSize: 13, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {locations === null && !error && <p style={{ color: "#80868B" }}>Chargement de vos établissements…</p>}

      {locations && locations.length === 0 && (
        <div style={{ background: "#FFF3E0", border: "1px solid #FBBC04", borderRadius: 12, padding: "18px 20px", fontSize: 14, color: "#7A5900" }}>
          Aucun établissement trouvé sur ce compte Google.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {locations?.map((loc) => (
          <div
            key={loc.path}
            style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: 12, padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, boxShadow: SHADOW }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#202124" }}>{loc.title}</div>
              {loc.address && <div style={{ fontSize: 12, color: "#5F6368", marginTop: 3 }}>{loc.address}</div>}
            </div>
            <button
              onClick={() => link(loc)}
              disabled={linkingPath !== null}
              style={{
                padding: "10px 20px", background: linkingPath === loc.path ? `${G.green}` : G.blue,
                border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600,
                cursor: linkingPath !== null ? "not-allowed" : "pointer", opacity: linkingPath !== null && linkingPath !== loc.path ? 0.5 : 1,
                fontFamily: "inherit", whiteSpace: "nowrap",
              }}
            >
              {linkingPath === loc.path ? "Connexion…" : "Connecter"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
