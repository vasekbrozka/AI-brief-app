import type { Lang } from '../lib/types';
import { useSettings } from '../providers/SettingsProvider';

const LANGS: Lang[] = ['cs', 'en'];

/** Compact CS/EN switch that lives in the nav bar. */
export function LangToggle() {
  const { lang, setLang, t } = useSettings();
  return (
    <div className="langtoggle" role="group" aria-label={t.sectionLanguage}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          className={`langtoggle__btn${lang === l ? ' is-active' : ''}`}
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
