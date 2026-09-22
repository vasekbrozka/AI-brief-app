import { useState } from 'react';
import { Icon } from './Icon';
import { useSettings } from '../providers/SettingsProvider';
import { useGlossary } from '../providers/GlossaryProvider';
import { hashString } from '../lib/seed';

/**
 * One glossary entry a day — the same one on every device — with a button to
 * flip through more. A small reason to learn something after the reading.
 */
export function TermOfDay({ date }: { date: string }) {
  const { lang, t } = useSettings();
  const { glossary } = useGlossary();
  const [offset, setOffset] = useState(0);

  if (!glossary || glossary.terms.length === 0) return null;
  const terms = glossary.terms;
  const entry = terms[(hashString(date) + offset) % terms.length];

  return (
    <section className="termday" aria-label={t.termTitle}>
      <div className="section-divider">
        <span>{t.termTitle}</span>
      </div>
      <div className="panel termday__panel">
        <div className="termday__term">{entry.term[lang]}</div>
        <p className="termday__body">{entry.short[lang]}</p>
        <button
          type="button"
          className="morelink"
          aria-label={t.showAnotherTerm}
          onClick={() => setOffset((o) => o + 1)}
        >
          {t.termNext}
          <Icon name="chevronRight" size={14} />
        </button>
      </div>
    </section>
  );
}
