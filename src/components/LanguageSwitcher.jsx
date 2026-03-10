import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

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
        fontWeight: '600'
      }}
    >
      <option value="fr">🇫🇷 Français</option>
      <option value="en">🇬🇧 English</option>
      <option value="it">🇮🇹 Italiano</option>
      <option value="de">🇩🇪 Deutsch</option>
    </select>
  );
}
