import { useSettings } from '../providers/SettingsProvider';
import { Icon } from './Icon';

export function VerifiedBadge() {
  const { t } = useSettings();
  return (
    <span className="verified" title={t.verified}>
      <span className="verified__seal">
        <Icon name="check" className="verified__check" size={14} />
      </span>
      <span className="verified__label">{t.verified}</span>
    </span>
  );
}
