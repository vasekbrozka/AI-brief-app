import { useSettings } from '../providers/SettingsProvider';
import { Icon } from './Icon';

/** Icon-only "verified" seal. Meaning is carried by the tooltip / aria-label. */
export function VerifiedBadge() {
  const { t } = useSettings();
  return (
    <span className="verified" role="img" aria-label={t.verified} title={t.verified}>
      <span className="verified__seal">
        <Icon name="check" className="verified__check" size={14} />
      </span>
    </span>
  );
}
