const G = { blue: "#1A73E8" };

function Bar({ width = "100%", height = "14px", radius = "4px" }: { width?: string; height?: string; radius?: string }) {
  return (
    <div
      className="rp-skeleton-bar"
      style={{ width, height, borderRadius: radius, background: "#EEEFF1" }}
    />
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #DADCE0", borderRadius: "12px",
      padding: "18px 24px", boxShadow: "0 1px 3px rgba(60,64,67,0.12), 0 1px 2px rgba(60,64,67,0.06)",
      display: "flex", flexDirection: "column", gap: "10px",
    }}>
      {children}
    </div>
  );
}

/**
 * Skeleton générique affiché par Next.js pendant le chargement d'une route
 * (via loading.tsx). Évite l'écran blanc figé le temps que le serveur récupère
 * les données — donne un retour visuel instantané à chaque navigation.
 */
export default function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div>
      <style>{`
        @keyframes rp-shimmer { 0% { background-position: -200px 0; } 100% { background-position: calc(200px + 100%) 0; } }
        .rp-skeleton-bar {
          background-image: linear-gradient(90deg, #EEEFF1 0px, #F6F7F8 40px, #EEEFF1 80px);
          background-size: 200px 100%;
          animation: rp-shimmer 1.2s ease-in-out infinite;
        }
      `}</style>

      <div style={{ marginBottom: "28px" }}>
        <Bar width="220px" height="24px" />
        <div style={{ height: "8px" }} />
        <Bar width="320px" height="14px" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {Array.from({ length: rows }).map((_, i) => (
          <Card key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Bar width="180px" height="16px" />
              <Bar width="80px" height="24px" radius="20px" />
            </div>
            <Bar width="90%" height="12px" />
            <Bar width="60%" height="12px" />
          </Card>
        ))}
      </div>
    </div>
  );
}
