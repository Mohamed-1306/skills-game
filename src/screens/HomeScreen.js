// src/screens/HomeScreen.js
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import Members from "../components/Members";

function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid rgba(0,0,0,0.10)",
        background: "#fff",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          border: "none",
          background: "rgba(11,94,215,0.06)",
          padding: "12px 14px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 950,
          color: "#08304d",
        }}
      >
        <span>{title}</span>
        <span style={{ opacity: 0.75 }}>{open ? "▴" : "▾"}</span>
      </button>

      {open ? (
        <div style={{ padding: 14, color: "#08304d", fontWeight: 750 }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

export default function HomeScreen({ me, members }) {
  const { t } = useTranslation();
  const membersCount = Array.isArray(members) ? members.length : 0;

  const cardStyle = {
    borderRadius: 22,
    padding: 18,
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 14px 34px rgba(0,0,0,0.10)",
  };

  const headerRow = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  };

  const titleStyle = {
    margin: 0,
    color: "#08304d",
    fontWeight: 950,
    fontSize: 22,
    letterSpacing: 0.2,
  };

  const badge = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 12px",
    borderRadius: 999,
    background: "rgba(11,94,215,0.10)",
    border: "1px solid rgba(11,94,215,0.18)",
    color: "#08304d",
    fontWeight: 950,
    whiteSpace: "nowrap",
  };

  const sub = {
    marginTop: 10,
    color: "rgba(8,48,77,0.82)",
    fontWeight: 850,
    fontSize: 13,
    lineHeight: 1.35,
  };

  const pill = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 12px",
    borderRadius: 999,
    fontWeight: 950,
    color: "#08304d",
    border: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(255,255,255,0.95)",
  };

  const myPts = me?.points || 0;
  const myStats = me?.stats || { success: 0, fail: 0, eco: 0 };

  return (
    <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
      <div style={cardStyle}>
        <div style={headerRow}>
          <h2 style={titleStyle}>🏠 {t('nav.home')}</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={pill}>🏆 {myPts} {t('stats.points')}</span>
            <span style={pill}>✅ {myStats.success || 0}</span>
            <span style={pill}>🌱 {myStats.eco || 0}</span>
          </div>
        </div>

        <div style={sub}>
          {t('home.goal')}
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          <Section title={"🎴 " + t('home.cards.title')} defaultOpen>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.45 }}>
              <li dangerouslySetInnerHTML={{ __html: t('home.cards.rule1') }} />
              <li dangerouslySetInnerHTML={{ __html: t('home.cards.rule2') }} />
              <li dangerouslySetInnerHTML={{ __html: t('home.cards.rule3') }} />
            </ul>
          </Section>

          <Section title={"📮 " + t('home.send.title')}>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.45 }}>
              <li dangerouslySetInnerHTML={{ __html: t('home.send.rule1') }} />
              <li dangerouslySetInnerHTML={{ __html: t('home.send.rule2') }} />
              <li dangerouslySetInnerHTML={{ __html: t('home.send.rule3') }} />
            </ul>
          </Section>

          <Section title={"✅ " + t('home.result.title')}>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.45 }}>
              <li>
                {t('home.result.validated')}
                <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                  <li dangerouslySetInnerHTML={{ __html: t('home.result.challenge') }} />
                  <li dangerouslySetInnerHTML={{ __html: t('home.result.goodConduct') }} />
                  <li dangerouslySetInnerHTML={{ __html: t('home.result.constraint') }} />
                </ul>
              </li>
              <li dangerouslySetInnerHTML={{ __html: t('home.result.failed') }} />
              <li dangerouslySetInnerHTML={{ __html: t('home.result.daily') }} />
            </ul>
          </Section>

          <Section title={"🏆 " + t('home.ranking.title')}>
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.45 }}>
              <li>
                {t('home.ranking.badgesDepend')}
                <ul style={{ marginTop: 6, paddingLeft: 18 }}>
                  <li>{t('home.ranking.gold')}</li>
                  <li>{t('home.ranking.silver')}</li>
                  <li>{t('home.ranking.bronze')}</li>
                  <li>{t('home.ranking.cardboard')}</li>
                </ul>
              </li>
              <li dangerouslySetInnerHTML={{ __html: t('home.ranking.multipleOr') }} />
              <li dangerouslySetInnerHTML={{ __html: t('home.ranking.greenBonus') }} />
            </ul>
          </Section>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={headerRow}>
          <h2 style={titleStyle}>👥 {t('members.title')}</h2>
          <div style={badge}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>⛷️</span>
            <span>{membersCount}</span>
          </div>
        </div>

        <div style={sub}>
          {t('home.membersSubtitle')}
        </div>

        <div style={{ marginTop: 14 }}>
          <Members members={members || []} me={me} />
        </div>
      </div>
    </div>
  );
}