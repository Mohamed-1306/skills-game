import { useState } from "react";
import { signInWithGoogleSmart } from "./google";
import { signInEmail, signUpEmail, resetPassword } from "./email";

export default function AuthScreen({ auth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const input = {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.18)",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const btn = {
    border: "none",
    borderRadius: 999,
    padding: "12px 16px",
    fontWeight: 900,
    cursor: "pointer",
  };

  async function run(fn) {
    setErr("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      console.error(e);
      setErr(e?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <div style={{ width: "min(520px, 96vw)", background: "#fff", borderRadius: 18, padding: 16, border: "1px solid rgba(0,0,0,0.10)" }}>
        <h2 style={{ marginTop: 0 }}>Connexion</h2>

        <div style={{ display: "grid", gap: 10 }}>
          <input
            style={input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            style={input}
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              style={{ ...btn, background: "#0b5ed7", color: "#fff" }}
              disabled={busy}
              onClick={() => run(() => signInEmail(auth, email.trim(), password))}
            >
              ✅ Se connecter
            </button>

            <button
              style={{ ...btn, background: "rgba(0,0,0,0.08)", color: "#08304d" }}
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const mail = email.trim();
                  if (!mail) throw new Error("Entre un email.");
                  if (password.length < 6) throw new Error("Mot de passe : 6 caractères minimum.");
                  await signUpEmail(auth, mail, password);
                  throw new Error("✅ Compte créé. Vérifie ton email puis reconnecte-toi.");
                })
              }
            >
              ➕ Créer un compte
            </button>
          </div>

          <button
            style={{ ...btn, background: "rgba(0,0,0,0.08)", color: "#08304d" }}
            disabled={busy}
            onClick={() => run(() => resetPassword(auth, email.trim()))}
          >
            🔁 Mot de passe oublié
          </button>

          <hr style={{ margin: "8px 0", opacity: 0.3 }} />

          <button
            style={{ ...btn, background: "rgba(0,0,0,0.08)", color: "#08304d" }}
            disabled={busy}
            onClick={() => run(() => signInWithGoogleSmart(auth))}
          >
            🔐 Continuer avec Google
          </button>

          {err ? (
            <div style={{ marginTop: 6, padding: 10, borderRadius: 12, background: "#fdecea", fontWeight: 800 }}>
              {err}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
