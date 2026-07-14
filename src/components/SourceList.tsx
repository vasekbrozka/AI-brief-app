import type { Source } from '../lib/types';
import { useSettings } from '../providers/SettingsProvider';

export function SourceList({ sources }: { sources: Source[] }) {
  const { t } = useSettings();
  if (sources.length === 0) return null;

  return (
    <div className="sources">
      <span className="sources__label">{t.sourcesLabel}</span>
      <span className="sources__items">
        {sources.map((source) => (
          <a
            key={source.url}
            className="source-link"
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {source.name}
          </a>
        ))}
      </span>
    </div>
  );
}
