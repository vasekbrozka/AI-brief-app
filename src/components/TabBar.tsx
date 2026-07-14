import { useSettings } from '../providers/SettingsProvider';
import { Icon, type IconName } from './Icon';

export type Tab = 'today' | 'archive' | 'settings';

export function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const { t } = useSettings();

  const tabs: { id: Tab; icon: IconName; label: string }[] = [
    { id: 'today', icon: 'cup', label: t.tabToday },
    { id: 'archive', icon: 'stack', label: t.tabArchive },
    { id: 'settings', icon: 'sliders', label: t.tabSettings },
  ];

  return (
    <nav className="tabbar" aria-label={t.appName}>
      <div className="tabbar__inner">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`tabbar__item${isActive ? ' is-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onChange(tab.id)}
            >
              <Icon name={tab.icon} className="tabbar__icon" size={26} />
              <span className="tabbar__label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
