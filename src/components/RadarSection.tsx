import type { RadarItem } from '../lib/types';
import { useSettings } from '../providers/SettingsProvider';
import { calendarTile } from '../lib/format';
import { SourceList } from './SourceList';

/**
 * "On the radar" — the brief's upcoming dated events (launches, deadlines,
 * hearings, keynotes). One card, one row per date, a calendar tile on the left.
 */
export function RadarSection({ radar }: { radar: RadarItem[] }) {
  const { lang, t } = useSettings();
  if (radar.length === 0) return null;

  return (
    <section className="radar" aria-label={t.radarTitle}>
      <div className="section-divider">
        <span>{t.radarTitle}</span>
      </div>
      <ol className="radar__list">
        {radar.map((entry) => {
          const tile = calendarTile(entry.date, lang);
          return (
            <li key={`${entry.date}-${entry.title.en}`} className="radar__row">
              <div className="radar__when" aria-hidden="true">
                <span className="radar__day">{tile.day}</span>
                <span className="radar__month">{tile.month}</span>
              </div>
              <div className="radar__body">
                <h4 className="radar__title">
                  {entry.title[lang]}
                  {entry.tentative && <span className="radar__tentative">{t.radarTentative}</span>}
                </h4>
                <p className="radar__note">{entry.note[lang]}</p>
                <SourceList sources={entry.sources} />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
