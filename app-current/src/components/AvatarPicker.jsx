// src/components/AvatarPicker.jsx
import { useState } from "react";

export default function AvatarPicker({ currentUrl, onPickAndUpload }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [preview, setPreview] = useState(null);

  function pickFile(f) {
    setErr("");
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
    return f;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <img
          src={
            preview || currentUrl || "https://via.placeholder.com/80?text=🎿"
          }
          alt="avatar"
          style={{
            width: 72,
            height: 72,
            borderRadius: 999,
            objectFit: "cover",
            border: "2px solid rgba(0,0,0,0.12)",
            boxShadow: "0 10px 22px rgba(0,0,0,0.18)",
            background: "#fff",
          }}
        />

        <label
          style={{
            display: "inline-block",
            padding: "10px 14px",
            borderRadius: 999,
            background: "rgba(11,94,215,0.12)",
            border: "1px solid rgba(11,94,215,0.25)",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          📷 Choisir une photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={async (e) => {
              const file = pickFile(e.target.files?.[0] || null);
              if (!file) return;

              setBusy(true);
              try {
                await onPickAndUpload(file);
                setPreview(null);
              } catch (e2) {
                setErr(e2?.message || String(e2));
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>
      </div>

      {busy && (
        <div style={{ fontWeight: 900, opacity: 0.75 }}>Upload en cours…</div>
      )}

      {err && (
        <div
          style={{
            padding: 10,
            borderRadius: 12,
            background: "#fdecea",
            fontWeight: 900,
          }}
        >
          {err}
        </div>
      )}

      <div style={{ opacity: 0.7, fontWeight: 700 }}>
        Astuce : sur iPhone, autorise l’accès à la caméra/photos.
      </div>
    </div>
  );
}
