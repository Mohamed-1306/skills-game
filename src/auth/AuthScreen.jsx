import { useState } from "react";
import { useTranslation } from "react-i18next";
import { signInWithGoogleSmart } from "./google";
import { signInEmail, signUpEmail, resetPassword } from "./email";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function AuthScreen({ auth }) {
  const { t } = useTranslation();
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
    fontSize: 15,
  };

  const btn = {
    border: "none",
    borderRadius: 999,
    padding: "12px 16px",
    fontWeight: 900,
    cursor: "pointer",
    width: "100%",
    fontSize: 15,
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
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #2e77d0 0%, #1a5fb4 100%)",
      display: "grid",
      placeItems: "center",
      padding: 16,
    }}>
      <div style={{ width: "min(520px, 96vw)", display: "grid", gap: 16 }}>

        {/* Sélecteur de langue EN HAUT */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <LanguageSwitcher />
        </div>

        {/* Card login */}
        <div style={{
          background: "#fff",
          borderRadius: 18,
          padding: 24,
          border: "1px solid rgba(0,0,0,0.10)",
          boxShadow: "0 14px 34px rgba(0,0,0,0.15)",
        }}>

          {/* Titre app */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 26, fontWeight: 950, color: "#08304d", letterSpacing: 0.5 }}>
              ⛷️ SKILLS GAME
            </div>
          </div>

          <h2 style={{ marginTop: 0, color: "#08304d" }}>
            🔒 {t('auth.login')}
          </h2>
          <p style={{ marginTop: -8, marginBottom: 16, color: "rgba(8,48,77,0.65)", fontWeight: 700 }}>
            {t('auth.connectToContinue')}
          </p>

          <div style={{ display: "grid", gap: 10 }}>
            <input
              style={input}
              type="email"
              placeholder={t('auth.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <input
              style={input}
              type="password"
              placeholder={t('auth.passwordMin')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <button
              style={{ ...btn, background: "#0b5ed7", color: "#fff" }}
              disabled={busy}
              onClick={() => run(() => signInEmail(auth, email.trim(), password))}
            >
              🔒 {t('auth.login')}
            </button>

            <button
              style={{ ...btn, background: "rgba(0,0,0,0.06)", color: "#08304d" }}
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const mail = email.trim();
                  if (!mail) throw new Error(t('errors.enterPseudo'));
                  if (password.length < 6) throw new Error(t('auth.passwordMin'));
                  await signUpEmail(auth, mail, password);
                  throw new Error(t('auth.accountCreated'));
                })
              }
            >
              + {t('auth.createAccount')}
            </button>

            <button
              style={{ ...btn, background: "transparent", color: "rgba(8,48,77,0.5)", fontWeight: 700, fontSize: 13 }}
              disabled={busy}
              onClick={() => run(() => resetPassword(auth, email.trim()))}
            >
              🔁 {t('auth.forgotPassword')}
            </button>

            <hr style={{ margin: "4px 0", opacity: 0.2 }} />

            <button
              style={{ ...btn, background: "rgba(0,0,0,0.06)", color: "#08304d" }}
              disabled={busy}
              onClick={() => run(() => signInWithGoogleSmart(auth))}
            >
              🔐 {t('auth.continueWithGoogle')}
            </button>

            {err ? (
              <div style={{ marginTop: 6, padding: 10, borderRadius: 12, background: "#fdecea", fontWeight: 800 }}>
                {err}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}