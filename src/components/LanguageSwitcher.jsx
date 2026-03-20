import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher({ variant = 'select' }) {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const langs = [
    { code: 'fr', label: '🇫🇷 Français' },
    { code: 'en', label: '🇬🇧 English' },
    { code: 'it', label: '🇮🇹 Italiano' },
    { code: 'de', label: '🇩🇪 Deutsch' },
  ];

  // Boutons pills — pour l'écran de login (fond bleu)
  if (variant === 'pills') {
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {langs.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            style={{
              padding: '8px 14px',
              borderRadius: 999,
              border: i18n.language === lang.code
                ? '2px solid #fff'
                : '2px solid rgba(255,255,255,0.35)',
              background: i18n.language === lang.code
                ? 'rgba(255,255,255,0.95)'
                : 'rgba(255,255,255,0.15)',
              color: i18n.language === lang.code ? '#08304d' : '#fff',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {lang.label}
          </button>
        ))}
      </div>
    );
  }

  // Select déroulant — pour l'app connectée (header)
  return (
    <select
      value={i18n.language}
      onChange={(e) => changeLanguage(e.target.value)}
      style={{
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid rgba(0,0,0,0.2)',
        background: 'white',
        fontSize: '14px',
        cursor: 'pointer',
        fontWeight: '600',
      }}
    >
      {langs.map((lang) => (
        <option key={lang.code} value={lang.code}>{lang.label}</option>
      ))}
    </select>
  );
}