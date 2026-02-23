// src/components/QrScanner.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function friendlyCameraError(e) {
  const name = e?.name || "";
  const msg = String(e?.message || "");

  // Cas iOS / Safari très courant
  if (name === "NotAllowedError" || /Permission dismissed/i.test(msg)) {
    return isIOS()
      ? "Accès caméra refusé. Sur iPhone : Réglages > Safari > Appareil photo > Autoriser, puis recharge la page."
      : "Accès caméra refusé. Autorise la caméra dans ton navigateur puis réessaie.";
  }

  if (name === "NotFoundError") {
    return "Aucune caméra détectée sur cet appareil.";
  }

  if (name === "NotReadableError") {
    return "Caméra déjà utilisée par une autre application. Ferme-la puis réessaie.";
  }

  // HTTPS obligatoire pour getUserMedia (souvent le souci)
  if (
    /Only secure origins are allowed|https|secure origin/i.test(msg) ||
    (typeof window !== "undefined" && window.location?.protocol !== "https:")
  ) {
    return "La caméra nécessite HTTPS. Ouvre l’app via une URL https:// (pas http).";
  }

  return "Impossible d’ouvrir la caméra. Réessaie ou utilise le QR affiché sur l’écran.";
}

export default function QrScanner({ onResult, onClose }) {
  const regionId = useMemo(
    () => `qr_region_${Math.random().toString(36).slice(2)}`,
    []
  );
  const qrRef = useRef(null);

  const [err, setErr] = useState("");
  const [starting, setStarting] = useState(true);
  const [retryKey, setRetryKey] = useState(0);

  // Démarrage / redémarrage scanner
  useEffect(() => {
    let cancelled = false;

    async function start() {
      setErr("");
      setStarting(true);

      // Nettoyage au cas où (si on réessaie)
      try {
        if (qrRef.current) {
          await qrRef.current.stop().catch(() => {});
          await qrRef.current.clear().catch(() => {});
        }
      } catch {}

      const qr = new Html5Qrcode(regionId);
      qrRef.current = qr;

      try {
        // iOS aime bien environment, mais certains devices préfèrent user
        await qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 220 },
          (decodedText) => {
            if (!cancelled) onResult(decodedText);
          }
        );
      } catch (e) {
        if (!cancelled) setErr(friendlyCameraError(e));
      } finally {
        if (!cancelled) setStarting(false);
      }
    }

    start();

    return () => {
      cancelled = true;
      (async () => {
        try {
          if (qrRef.current) {
            await qrRef.current.stop().catch(() => {});
            await qrRef.current.clear().catch(() => {});
          }
        } catch {}
      })();
    };
  }, [regionId, onResult, retryKey]);

  const canRetry = !starting;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 9999,
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "min(520px, 96vw)",
          background: "#fff",
          borderRadius: 18,
          padding: 14,
          boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "space-between", gap: 10 }}
        >
          <div style={{ fontWeight: 900 }}>📷 Scanner le QR du groupe</div>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "rgba(0,0,0,0.08)",
              borderRadius: 999,
              padding: "6px 10px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            ✖ Fermer
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          {/* zone caméra */}
          <div
            id={regionId}
            style={{
              width: "100%",
              borderRadius: 14,
              overflow: "hidden",
              border: "1px solid rgba(0,0,0,0.10)",
              background: "rgba(0,0,0,0.03)",
              minHeight: 240,
            }}
          />
        </div>

        {/* infos / erreurs */}
        {starting ? (
          <div style={{ marginTop: 10, opacity: 0.75, fontWeight: 800 }}>
            Ouverture de la caméra…
          </div>
        ) : err ? (
          <div style={{ marginTop: 10 }}>
            <div style={{ color: "#c63b28", fontWeight: 900 }}>{err}</div>

            <div
              style={{
                marginTop: 10,
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => setRetryKey((k) => k + 1)}
                disabled={!canRetry}
                style={{
                  borderRadius: 999,
                  border: "1px solid rgba(0,0,0,0.12)",
                  background: "rgba(255,255,255,0.95)",
                  padding: "8px 12px",
                  fontWeight: 900,
                  cursor: canRetry ? "pointer" : "not-allowed",
                  opacity: canRetry ? 1 : 0.6,
                }}
              >
                🔄 Réessayer
              </button>

              {isIOS() ? (
                <button
                  type="button"
                  onClick={() => {
                    // iOS ne permet pas d’ouvrir directement Réglages depuis le web,
                    // mais on donne une aide claire (et on ferme pour qu'il puisse relancer ensuite).
                    alert(
                      "Sur iPhone : Réglages > Safari > Appareil photo > Autoriser, puis recharge la page."
                    );
                  }}
                  style={{
                    borderRadius: 999,
                    border: "1px solid rgba(0,0,0,0.12)",
                    background: "rgba(255,255,255,0.95)",
                    padding: "8px 12px",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  📱 Aide iPhone
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 10, opacity: 0.75, fontWeight: 800 }}>
            Astuce : sur iPhone, autorise l’accès à la caméra (Safari). Sinon
            ouvre l’app en HTTPS.
          </div>
        )}
      </div>
    </div>
  );
}
