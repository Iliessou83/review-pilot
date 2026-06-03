export default function QuickReplySuccessPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        fontFamily: "'Google Sans', system-ui, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "440px",
          width: "100%",
          textAlign: "center",
          background: "#fff",
          border: "1px solid #DADCE0",
          borderRadius: "16px",
          padding: "48px 32px",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "#E6F4EA",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <span style={{ fontSize: "36px", color: "#34A853", fontWeight: 700 }}>
            ✓
          </span>
        </div>

        <h1
          style={{
            margin: "0 0 12px",
            fontSize: "24px",
            fontWeight: 700,
            color: "#202124",
          }}
        >
          Réponse publiée ✓
        </h1>

        <p
          style={{
            margin: "0 0 32px",
            fontSize: "15px",
            color: "#5F6368",
            lineHeight: 1.6,
          }}
        >
          Votre réponse a été envoyée sur Google. Le client la verra dans
          quelques minutes.
        </p>

        <a
          href="/dashboard"
          style={{
            display: "inline-block",
            padding: "12px 28px",
            background: "#1A73E8",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Voir le dashboard
        </a>

        <p style={{ margin: "28px 0 0", fontSize: "10px", color: "#80868B" }}>
          ReviewPilot est un outil indépendant, non affilié à Google LLC.
        </p>
      </div>
    </div>
  );
}
