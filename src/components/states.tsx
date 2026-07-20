import { useSettings } from '../providers/SettingsProvider';
import { Icon } from './Icon';

/** Shimmering placeholder shown while a brief loads. */
export function BriefSkeleton() {
  return (
    <div className="brief" aria-busy="true" aria-live="polite">
      <div className="gist skeleton">
        <div className="skeleton-line" style={{ width: '30%' }} />
        <div className="skeleton-line" style={{ width: '95%', marginTop: 10 }} />
        <div className="skeleton-line" style={{ width: '80%' }} />
      </div>
      <div className="items">
        {Array.from({ length: 4 }).map((_, i) => (
          // Wrapped in the card shell so skeletons match real cards.
          <div key={i} className="swipe">
            <div className="item">
              <div className="skeleton-pill" />
              <div className="skeleton-line" style={{ width: '75%', height: 17, marginTop: 12 }} />
              <div className="skeleton-line" style={{ width: '100%', marginTop: 12 }} />
              <div className="skeleton-line" style={{ width: '88%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArchiveSkeleton() {
  return (
    <div className="archive-list" aria-busy="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="archive-row archive-row--skeleton">
          <div style={{ flex: 1 }}>
            <div className="skeleton-line" style={{ width: 90, height: 13 }} />
            <div className="skeleton-line" style={{ width: '70%', height: 16, marginTop: 10 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="state">
      <div className="state__icon">
        <Icon name="sparkles" size={30} />
      </div>
      <h2 className="state__title">{title}</h2>
      <p className="state__body">{body}</p>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useSettings();
  return (
    <div className="state">
      <h2 className="state__title">{t.errorTitle}</h2>
      <p className="state__body">{t.errorBody}</p>
      <button type="button" className="btn" onClick={onRetry}>
        {t.retry}
      </button>
    </div>
  );
}
