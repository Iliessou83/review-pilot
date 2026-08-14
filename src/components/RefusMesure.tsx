"use client";

import { useEffect, useState } from "react";
import { accepterLaMesure, mesureRefusee, refuserLaMesure } from "@/lib/analytics/client";

/**
 * Bouton d'opposition à la mesure d'audience, à poser dans la page de
 * confidentialité. Obligatoire même sans bandeau : l'exemption de consentement
 * de la CNIL suppose que la personne puisse s'opposer facilement.
 */
export default function RefusMesure() {
  const [refuse, setRefuse] = useState(false);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    setRefuse(mesureRefusee());
    setPret(true);
  }, []);

  if (!pret) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
      <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6 }}>
        {refuse
          ? "La mesure d'audience est désactivée sur cet appareil. Aucune statistique de visite n'est enregistrée."
          : "Nous comptons les visites de façon anonyme pour améliorer le site. Aucune donnée n'est vendue ni partagée."}
      </p>
      <button
        onClick={() => {
          if (refuse) accepterLaMesure();
          else refuserLaMesure();
          setRefuse(!refuse);
        }}
        style={{
          padding: "9px 16px",
          borderRadius: 10,
          border: "1px solid currentColor",
          background: "transparent",
          color: "inherit",
          fontSize: 13.5,
          cursor: "pointer",
        }}
      >
        {refuse ? "Réactiver la mesure" : "Refuser la mesure d'audience"}
      </button>
    </div>
  );
}
