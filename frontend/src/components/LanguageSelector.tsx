import type { Language } from "../i18n/translations";
import { languages } from "../i18n/translations";

type LanguageSelectorProps = {
  language: Language;
  onLanguageChange: (language: Language) => void;
};

export function LanguageSelector({ language, onLanguageChange }: LanguageSelectorProps) {
  return (
    <div className="language-selector">
      <label htmlFor="language-select">🌐</label>
      <select
        id="language-select"
        value={language}
        onChange={(event) => onLanguageChange(event.target.value as Language)}
        title="Select Language"
      >
        {(Object.keys(languages) as Language[]).map((lang) => (
          <option key={lang} value={lang}>
            {languages[lang]}
          </option>
        ))}
      </select>
    </div>
  );
}

