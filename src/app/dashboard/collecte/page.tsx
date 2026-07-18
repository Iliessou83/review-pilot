"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

const G = { blue: "#1A73E8", red: "#EA4335", yellow: "#FBBC04", green: "#34A853" };
const SHADOW = "0 1px 3px rgba(60,64,67,0.12), 0 1px 2px rgba(60,64,67,0.06)";

type Business = { id: number; name: string };
type Contact = {
  id: number; phone: string; name: string | null; source: string;
  optedOut: boolean; lastRequestedAt: string | null; lastStatus: string | null;
};

const STATUS_LABEL: Record<string, { text: string; color: string; bg: string }> = {
  queued: { text: "En file", color: "#7A5900", bg: "#FEF7E0" },
  sent: { text: "Envoyé", color: G.blue, bg: "#E8F0FE" },
  clicked: { text: "A cliqué ✓", color: G.green, bg: "#E6F4EA" },
  failed: { text: "Échec", color: G.red, bg: "#FCE8E6" },
};

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ background: "#fff", border: "1px solid #DADCE0", borderRadius: 12, boxShadow: SHADOW, ...style }}>{children}</div>;
}

export default function CollectePage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [smsOk, setSmsOk] = useState(true);
  const [hasLink, setHasLink] = useState(true);
  const [loadingBiz, setLoadingBiz] = useState(true);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    fetch("/api/businesses")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Business[]) => {
        const list = Array.isArray(d) ? d : [];
        setBusinesses(list);
        if (list.length) setSelected(list[0].id);
      })
      .catch(() => setBusinesses([]))
      .finally(() => setLoadingBiz(false));
  }, []);

  const load = useCallback(async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/contacts?businessId=${selected}`);
      const d = await r.json();
      setContacts(Array.isArray(d.contacts) ? d.contacts : []);
      setSmsOk(Boolean(d.smsConfigured));
      setHasLink(Boolean(d.hasReviewLink));
      setChecked(new Set());
    } catch {
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [selected]);

  useEffect(() => { load(); }, [load]);

  async function importWheel() {
    if (!selected) return;
    setBusy("import"); setMsg(null);
    try {
      const r = await fetch("/api/contacts/import", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: selected }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Import impossible");
      setMsg({ ok: true, text: `${d.imported} numéro(s) importé(s) depuis la Roue (${d.skipped} ignoré(s) / doublons).` });
      load();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Erreur" });
    } finally { setBusy(""); }
  }

  async function addContact() {
    if (!selected || !newPhone.trim()) { setMsg({ ok: false, text: "Entrez un numéro." }); return; }
    setBusy("add"); setMsg(null);
    try {
      const r = await fetch("/api/contacts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: selected, phone: newPhone, name: newName }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Ajout impossible");
      setNewName(""); setNewPhone("");
      load();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Erreur" });
    } finally { setBusy(""); }
  }

  async function removeContact(id: number) {
    if (!confirm("Supprimer ce contact ?")) return;
    await fetch(`/api/contacts?id=${id}`, { method: "DELETE" });
    load();
  }

  async function send() {
    if (!selected || checked.size === 0) return;
    setBusy("send"); setMsg(null);
    try {
      const r = await fetch("/api/collecte/send", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: selected, contactIds: [...checked], channel: "sms" }),
      });
      const d = await r.json();
      if (!r.ok) {
        const map: Record<string, string> = {
          sms_not_configured: "L'envoi de SMS n'est pas encore activé (fournisseur à configurer).",
          no_review_link: "Ajoutez d'abord votre lien d'avis Google dans les Paramètres.",
          whatsapp_soon: "WhatsApp arrive bientôt. Utilisez le SMS pour l'instant.",
        };
        throw new Error(map[d.error] || d.error || "Envoi impossible");
      }
      setMsg({ ok: true, text: `${d.sent} SMS envoyé(s)${d.failed ? `, ${d.failed} échec(s)` : ""}${d.skippedOptedOut ? `, ${d.skippedOptedOut} désinscrit(s) ignoré(s)` : ""}.` });
      load();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Erreur" });
    } finally { setBusy(""); }
  }

  function toggle(id: number) {
    setChecked((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleAll() {
    const selectable = contacts.filter((c) => !c.optedOut).map((c) => c.id);
    setChecked((s) => s.size === selectable.length ? new Set() : new Set(selectable));
  }

  const clicked = contacts.filter((c) => c.lastStatus === "clicked").length;
  const sentCount = contacts.filter((c) => c.lastStatus === "sent" || c.lastStatus === "clicked").length;

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "#202124", letterSpacing: "-0.5px" }}>
            Collecte d&apos;avis
          </h1>
          <p style={{ margin: 0, color: "#5F6368", fontSize: 14 }}>
            Relancez vos clients par SMS pour récolter des avis. Un lien direct, un clic, un avis.
          </p>
        </div>
        <Link href="/dashboard" style={{ padding: "8px 16px", background: "#fff", border: "1px solid #DADCE0", borderRadius: 8, textDecoration: "none", fontSize: 13, color: "#5F6368", boxShadow: SHADOW }}>
          ← Dashboard
        </Link>
      </div>

      {loadingBiz && <p style={{ color: "#80868B" }}>Chargement…</p>}

      {!loadingBiz && businesses.length === 0 && (
        <Card style={{ padding: "48px 24px", textAlign: "center" }}>
          <p style={{ margin: "0 0 8px", fontSize: 40 }}>📇</p>
          <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: "#202124" }}>Aucun établissement</p>
          <Link href="/businesses" style={{ color: G.blue, fontSize: 13 }}>Ajouter un établissement →</Link>
        </Card>
      )}

      {!loadingBiz && businesses.length > 0 && (
        <>
          {/* Sélecteur + import + stats */}
          <Card style={{ padding: "16px 20px", marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 220px" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#5F6368", marginBottom: 6 }}>Établissement</label>
              <select value={selected ?? ""} onChange={(e) => setSelected(Number(e.target.value))}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #DADCE0", borderRadius: 8, fontSize: 14, background: "#fff", fontFamily: "inherit" }}>
                {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <button onClick={importWheel} disabled={busy === "import"}
              style={{ padding: "11px 18px", background: "#E8F0FE", border: "none", borderRadius: 8, color: G.blue, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              {busy === "import" ? "Import…" : "🎡 Importer les numéros de la Roue"}
            </button>
          </Card>

          {/* Alertes config */}
          {!hasLink && (
            <Card style={{ padding: "12px 16px", marginBottom: 12, background: "#FEF7E0", border: "1px solid #FBBC04", color: "#7A5900", fontSize: 13 }}>
              ⚠ Ajoutez votre <strong>lien d&apos;avis Google</strong> dans les <Link href="/dashboard/settings" style={{ color: "#7A5900", fontWeight: 700 }}>Paramètres</Link> pour pouvoir envoyer les demandes.
            </Card>
          )}
          {!smsOk && (
            <Card style={{ padding: "12px 16px", marginBottom: 12, background: "#FCE8E6", border: "1px solid #F5B5AE", color: G.red, fontSize: 13 }}>
              ⚠ L&apos;envoi de SMS n&apos;est pas encore activé (fournisseur à configurer). Vous pouvez déjà constituer vos contacts.
            </Card>
          )}

          {msg && (
            <Card style={{ padding: "12px 16px", marginBottom: 12, background: msg.ok ? "#E6F4EA" : "#FCE8E6", border: `1px solid ${msg.ok ? "#B7DFC2" : "#F5B5AE"}`, color: msg.ok ? "#1E7B34" : G.red, fontSize: 13 }}>
              {msg.ok ? "✓ " : "⚠ "}{msg.text}
            </Card>
          )}

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 16 }}>
            {[
              { label: "Contacts", value: contacts.length, color: G.blue },
              { label: "Demandes envoyées", value: sentCount, color: G.yellow },
              { label: "Ont cliqué", value: clicked, color: G.green },
            ].map((s) => (
              <Card key={s.label} style={{ padding: "14px 18px" }}>
                <p style={{ margin: "0 0 4px", fontSize: 11, color: "#5F6368", textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 500 }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: s.color, letterSpacing: "-0.6px" }}>{s.value}</p>
              </Card>
            ))}
          </div>

          {/* Ajout manuel */}
          <Card style={{ padding: "16px 20px", marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 160px" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#5F6368", marginBottom: 6 }}>Prénom (optionnel)</label>
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Marie"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #DADCE0", borderRadius: 8, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
            <div style={{ flex: "1 1 160px" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#5F6368", marginBottom: 6 }}>Numéro de mobile</label>
              <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="06 12 34 56 78"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #DADCE0", borderRadius: 8, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
            <button onClick={addContact} disabled={busy === "add"}
              style={{ padding: "11px 18px", background: G.blue, border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              {busy === "add" ? "…" : "+ Ajouter"}
            </button>
          </Card>

          {/* Barre d'action */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#5F6368" }}>{checked.size} sélectionné(s)</span>
            <button onClick={send} disabled={busy === "send" || checked.size === 0 || !smsOk || !hasLink}
              style={{
                padding: "11px 22px", borderRadius: 8, border: "none", fontSize: 14, fontWeight: 700, fontFamily: "inherit",
                background: (checked.size === 0 || !smsOk || !hasLink) ? "#DADCE0" : G.green,
                color: (checked.size === 0 || !smsOk || !hasLink) ? "#80868B" : "#fff",
                cursor: (busy === "send" || checked.size === 0 || !smsOk || !hasLink) ? "not-allowed" : "pointer",
              }}>
              {busy === "send" ? "Envoi…" : `📩 Envoyer la demande d'avis (SMS)`}
            </button>
          </div>

          {/* Table contacts */}
          <Card style={{ overflow: "hidden" }}>
            {loading ? (
              <p style={{ padding: "32px", textAlign: "center", color: "#80868B", margin: 0 }}>Chargement…</p>
            ) : contacts.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <p style={{ margin: "0 0 8px", fontSize: 34 }}>📇</p>
                <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 600, color: "#202124" }}>Aucun contact</p>
                <p style={{ margin: 0, fontSize: 13, color: "#5F6368" }}>Importez les numéros de la Roue ou ajoutez-en un à la main.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", minWidth: 560, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#F8F9FA" }}>
                      <th style={{ padding: "10px 16px", textAlign: "left", width: 40 }}>
                        <input type="checkbox" checked={checked.size > 0 && checked.size === contacts.filter(c => !c.optedOut).length} onChange={toggleAll} />
                      </th>
                      {["Contact", "Numéro", "Source", "Dernière demande", ""].map((c) => (
                        <th key={c} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#5F6368", textTransform: "uppercase", letterSpacing: 0.6, borderBottom: "1px solid #DADCE0" }}>{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((c) => (
                      <tr key={c.id} style={{ borderBottom: "1px solid #F8F9FA", opacity: c.optedOut ? 0.5 : 1 }}>
                        <td style={{ padding: "12px 16px" }}>
                          <input type="checkbox" disabled={c.optedOut} checked={checked.has(c.id)} onChange={() => toggle(c.id)} />
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 14, color: "#202124" }}>{c.name || "—"}{c.optedOut && <span style={{ marginLeft: 6, fontSize: 11, color: G.red }}>(STOP)</span>}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#5F6368", whiteSpace: "nowrap" }}>{c.phone}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#80868B" }}>{c.source === "wheel" ? "Roue" : c.source === "import" ? "Import" : "Manuel"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          {c.lastStatus ? (
                            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, ...(STATUS_LABEL[c.lastStatus] ? { color: STATUS_LABEL[c.lastStatus].color, background: STATUS_LABEL[c.lastStatus].bg } : {}) }}>
                              {STATUS_LABEL[c.lastStatus]?.text || c.lastStatus}
                            </span>
                          ) : <span style={{ fontSize: 12, color: "#BDC1C6" }}>—</span>}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          <button onClick={() => removeContact(c.id)} style={{ background: "none", border: "none", color: "#BDC1C6", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>Suppr.</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
