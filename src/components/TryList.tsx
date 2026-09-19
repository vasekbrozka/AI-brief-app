import type { TipEntry } from '../lib/types';
import { useSettings } from '../providers/SettingsProvider';
import { useNav } from '../providers/NavProvider';
import { useTried } from '../providers/TriedProvider';
import { useRecentTips } from '../hooks/useTipsBacklog';
import { capitalizeFirst, formatShortDate, triedProgressLabel } from '../lib/format';
import { haptic } from '../lib/haptics';
import { Icon } from './Icon';

// How many untried tips the compact card on Today shows before "All tips".
const COMPACT_ROWS = 3;

/** One tip with its "tried" tick; `compact` drops the summary fallback and meta line. */
export function TryRow({ tip, compact = false }: { tip: TipEntry; compact?: boolean }) {
  const { lang, t } = useSettings();
  const { isTried, toggle } = useTried();
  const tried = isTried(tip.slug);
  const detail = tip.why?.[lang] ?? (compact ? null : tip.summary[lang]);
  const primary = tip.sources[0];

  return (
    <li className={`try__row${tried ? ' is-tried' : ''}`}>
      <button
        type="button"
        className={`try__check${tried ? ' is-on' : ''}`}
        aria-pressed={tried}
        aria-label={t.tryDone}
        onClick={() => {
          haptic();
          toggle(tip.slug);
        }}
      >
        {tried && <Icon name="check" size={13} />}
      </button>
      <div className="try__body">
        <span className="try__title">{tip.title[lang]}</span>
        {detail && <span className="try__detail">{detail}</span>}
        {!compact && (
          <span className="try__meta">
            {tip.used && capitalizeFirst(formatShortDate(tip.used, lang))}
            {primary && (
              <>
                {tip.used && ' · '}
                <a className="source-link" href={primary.url} target="_blank" rel="noopener noreferrer">
                  {primary.name}
                </a>
              </>
            )}
          </span>
        )}
      </div>
    </li>
  );
}

/**
 * "Try it yourself" on Today: the next few untried tips from recent briefs
 * with a tick box each, plus a link to the full checklist. Renders nothing
 * until the ledger has loaded, so the brief never jumps.
 */
export function TryList() {
  const { lang, t } = useSettings();
  const { openTips } = useNav();
  const { isTried } = useTried();
  const { status, tips } = useRecentTips();

  if (status !== 'ready' || tips.length === 0) return null;

  const untried = tips.filter((tip) => !isTried(tip.slug));
  const shown = untried.slice(0, COMPACT_ROWS);
  const triedCount = tips.length - untried.length;

  return (
    <section className="try" aria-label={t.tryTitle}>
      <div className="section-divider">
        <span>{t.tryTitle}</span>
      </div>
      <div className="panel try__panel">
        <p className="try__hint">{t.tryHint}</p>
        {shown.length === 0 ? (
          <p className="try__alldone">{t.tryAllDone}</p>
        ) : (
          <ul className="try__list">
            {shown.map((tip) => (
              <TryRow key={tip.slug} tip={tip} compact />
            ))}
          </ul>
        )}
        <div className="try__footer">
          <span className="try__progress">{triedProgressLabel(triedCount, tips.length, lang)}</span>
          <button type="button" className="link-btn try__all" onClick={openTips}>
            {t.tryAll} ({tips.length})
            <Icon name="chevronRight" size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
