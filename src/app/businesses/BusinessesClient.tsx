"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Business } from "@/db/schema";

type BusinessWithStats = Business & { reviewCount: number };

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "12px",
          fontWeight: 500,
          color: "rgba(248,248,255,0.5)",
          marginBottom: "6px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          width: "100%",
          padding: "10px 14px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: "7px",
          color: "#f8f8ff",
          fontSize: "14px",
          outline: "none",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#6c47ff";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(255,255,255,0.09)";
        }}
      />
    </div>
  );
}

export default function BusinessesClient({
  businesses,
}: {
  businesses: BusinessWithStats[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    platform: "google" as "google" | "trustpilot",
    platformId: "",
    platformToken: "",
    ownerEmail: "",
    autoReply5Star: true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setShowForm(false);
        setForm({
          name: "",
          platform: "google",
          platformId: "",
          platformToken: "",
          ownerEmail: "",
          autoReply5Star: true,
        });
        router.refresh();
      } else {
        const data = await res.json() as { error: string };
        setError(data.error);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSync(id: number) {
    setSyncingId(id);
    try {
      await fetch(`/api/reviews/sync?businessId=${id}`, { method: "POST" });
      router.refresh();
    } finally {
      setSyncingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this business and all its reviews?")) return;
    await fetch(`/api/businesses?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "28px",
        }}
      >
        <div>
          <h1
            style={{
              margin: "0 0 6px",
              fontSize: "26px",
              fontWeight: 700,
              color: "#f8f8ff",
              letterSpacing: "-0.5px",
            }}
          >
            Businesses
          </h1>
          <p
            style={{
              margin: 0,
              color: "rgba(248,248,255,0.45)",
              fontSize: "14px",
            }}
          >
            {businesses.length} business{businesses.length !== 1 ? "es" : ""}{" "}
            connected
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "10px 20px",
            background: showForm
              ? "rgba(255,255,255,0.06)"
              : "linear-gradient(135deg, #6c47ff, #9d7dff)",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {showForm ? "Cancel" : "+ Add Business"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div
          style={{
            background: "#111118",
            border: "1px solid rgba(108,71,255,0.3)",
            borderRadius: "12px",
            padding: "28px",
            marginBottom: "28px",
          }}
        >
          <h3
            style={{
              margin: "0 0 24px",
              fontSize: "16px",
              fontWeight: 600,
              color: "#f8f8ff",
            }}
          >
            New Business
          </h3>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <InputField
                label="Business Name"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                placeholder="Le Jardin Bio"
                required
              />

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "rgba(248,248,255,0.5)",
                    marginBottom: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Platform
                </label>
                <select
                  value={form.platform}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      platform: e.target.value as "google" | "trustpilot",
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: "7px",
                    color: "#f8f8ff",
                    fontSize: "14px",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="google" style={{ background: "#111118" }}>
                    Google Business Profile
                  </option>
                  <option
                    value="trustpilot"
                    style={{ background: "#111118" }}
                  >
                    Trustpilot
                  </option>
                </select>
              </div>

              <InputField
                label={
                  form.platform === "google"
                    ? "Google Place ID / Account Name"
                    : "Trustpilot Business Unit ID"
                }
                value={form.platformId}
                onChange={(v) => setForm({ ...form, platformId: v })}
                placeholder={
                  form.platform === "google"
                    ? "accounts/123/locations/456"
                    : "507f1f77bcf86cd799439011"
                }
                required
              />

              <InputField
                label={
                  form.platform === "google"
                    ? "OAuth Bearer Token"
                    : "API Key"
                }
                value={form.platformToken}
                onChange={(v) => setForm({ ...form, platformToken: v })}
                placeholder="Token / API Key"
                type="password"
                required
              />

              <InputField
                label="Owner Email (for notifications)"
                value={form.ownerEmail}
                onChange={(v) => setForm({ ...form, ownerEmail: v })}
                placeholder="owner@business.com"
                type="email"
                required
              />

              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    paddingBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "22px",
                      background: form.autoReply5Star
                        ? "#6c47ff"
                        : "rgba(255,255,255,0.1)",
                      borderRadius: "11px",
                      position: "relative",
                      transition: "background 0.2s",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      setForm({
                        ...form,
                        autoReply5Star: !form.autoReply5Star,
                      })
                    }
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: form.autoReply5Star ? "20px" : "2px",
                        width: "18px",
                        height: "18px",
                        background: "#fff",
                        borderRadius: "50%",
                        transition: "left 0.2s",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "rgba(248,248,255,0.7)",
                    }}
                  >
                    Auto-réponse 4-5 étoiles (IA)
                  </span>
                </label>
              </div>
            </div>

            {error && (
              <p
                style={{
                  color: "#f87171",
                  fontSize: "13px",
                  margin: "0 0 16px",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 24px",
                background: "linear-gradient(135deg, #6c47ff, #9d7dff)",
                border: "none",
                borderRadius: "7px",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Adding..." : "Add Business"}
            </button>
          </form>
        </div>
      )}

      {/* Businesses list */}
      {businesses.length === 0 ? (
        <div
          style={{
            background: "#111118",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "12px",
            padding: "64px 24px",
            textAlign: "center",
            color: "rgba(248,248,255,0.3)",
          }}
        >
          <p style={{ margin: "0 0 8px", fontSize: "40px" }}>🏢</p>
          <p style={{ margin: 0, fontSize: "15px" }}>
            No businesses yet. Add your first one to start monitoring reviews.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {businesses.map((biz) => (
            <div
              key={biz.id}
              style={{
                background: "#111118",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "12px",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{ fontSize: "16px", fontWeight: 600, color: "#f8f8ff" }}
                  >
                    {biz.name}
                  </span>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.4px",
                      background:
                        biz.platform === "google"
                          ? "rgba(66,133,244,0.15)"
                          : "rgba(0,179,91,0.15)",
                      color:
                        biz.platform === "google" ? "#5b9df5" : "#22c55e",
                      border:
                        biz.platform === "google"
                          ? "1px solid rgba(66,133,244,0.3)"
                          : "1px solid rgba(0,179,91,0.3)",
                    }}
                  >
                    {biz.platform}
                  </span>
                  {biz.autoReply5Star && (
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: 600,
                        background: "rgba(108,71,255,0.15)",
                        color: "#9d7dff",
                        border: "1px solid rgba(108,71,255,0.3)",
                      }}
                    >
                      Auto-réponse 4-5★ ON
                    </span>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    fontSize: "12px",
                    color: "rgba(248,248,255,0.4)",
                  }}
                >
                  <span>{biz.reviewCount} reviews</span>
                  <span>{biz.ownerEmail}</span>
                  <span
                    style={{
                      maxWidth: "200px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ID: {biz.platformId}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleSync(biz.id)}
                  disabled={syncingId === biz.id}
                  style={{
                    padding: "8px 16px",
                    background: "rgba(108,71,255,0.15)",
                    border: "1px solid rgba(108,71,255,0.3)",
                    borderRadius: "7px",
                    color: "#9d7dff",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: syncingId === biz.id ? "not-allowed" : "pointer",
                    opacity: syncingId === biz.id ? 0.6 : 1,
                  }}
                >
                  {syncingId === biz.id ? "Syncing..." : "Sync Reviews"}
                </button>
                <button
                  onClick={() => handleDelete(biz.id)}
                  style={{
                    padding: "8px 12px",
                    background: "transparent",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: "7px",
                    color: "rgba(248,248,255,0.3)",
                    fontSize: "13px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "rgba(239,68,68,0.5)";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "#f87171";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "rgba(239,68,68,0.2)";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "rgba(248,248,255,0.3)";
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
