import { useSettings } from '../providers/SettingsProvider';
import { Icon, type IconName } from './Icon';

export type Tab = 'today' | 'todo' | 'archive' | 'settings';

export function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const { t, todoEnabled } = useSettings();

  // The To do tab is opt-in from Settings; off, the bar keeps its three tabs.
  const tabs: { id: Tab; icon: IconName; label: string }[] = [
    { id: 'today', icon: 'cup', label: t.tabToday },
    ...(todoEnabled ? [{ id: 'todo' as Tab, icon: 'listCheck' as IconName, label: t.tabTodo }] : []),
    { id: 'archive', icon: 'stack', label: t.tabArchive },
    { id: 'settings', icon: 'sliders', label: t.tabSettings },
  ];

  return (
    <nav className="tabbar" aria-label={t.appName}>
      {/* Shown only in the desktop sidebar layout. */}
      <div className="tabbar__brand" aria-hidden="true">
        <img
          className="tabbar__brand-icon"
          src="/icons/icon-192.png"
          alt=""
          width={30}
          height={30}
        />
        <span>{t.appName}</span>
      </div>
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
