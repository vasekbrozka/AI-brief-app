import type { ReactNode } from 'react';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { Segmented } from '../components/Segmented';
import { Switch } from '../components/Switch';
import { Icon } from '../components/Icon';
import type { Lang } from '../lib/types';
import type { Theme } from '../providers/SettingsProvider';
import { useSettings } from '../providers/SettingsProvider';
import { useRead } from '../providers/ReadProvider';
import { useStreak } from '../providers/StreakProvider';
import { useNotifications } from '../hooks/useNotifications';
import { CATEGORIES, CATEGORY_ORDER } from '../lib/categories';
import { streakLabel } from '../lib/format';

function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="settings-group">
      <h2 className="settings-group__title">{title}</h2>
      <div className="settings-group__body">{children}</div>
    </section>
  );
}

export function SettingsScreen({ onOpenAbout }: { onOpenAbout: () => void }) {
  const {
    t,
    lang,
    setLang,
    theme,
    setTheme,
    hideRead,
    setHideRead,
    mutedCategories,
    toggleCategory,
    gamification,
    setGamification,
    glossaryEnabled,
    setGlossaryEnabled,
  } = useSettings();
  const { clear, readCount } = useRead();
  const { currentStreak } = useStreak();
  const notifications = useNotifications();

  const langOptions: { value: Lang; label: string }[] = [
    { value: 'cs', label: 'Čeština' },
    { value: 'en', label: 'English' },
  ];

  const themeOptions: { value: Theme; label: string }[] = [
    { value: 'auto', label: t.themeAuto },
    { value: 'light', label: t.themeLight },
    { value: 'dark', label: t.themeDark },
  ];

  return (
    <ScreenScaffold title={t.settingsTitle}>
      <SettingsGroup title={t.sectionLanguage}>
        <Segmented
          value={lang}
          onChange={setLang}
          options={langOptions}
          ariaLabel={t.sectionLanguage}
        />
      </SettingsGroup>

      <SettingsGroup title={t.sectionAppearance}>
        <Segmented
          value={theme}
          onChange={setTheme}
          options={themeOptions}
          ariaLabel={t.sectionAppearance}
        />
      </SettingsGroup>

      <SettingsGroup title={t.sectionCategories}>
        <div className="setting-switch__text">
          <span className="setting-switch__hint">{t.categoriesShownHint}</span>
        </div>
        <div className="cat-toggles" role="group" aria-label={t.sectionCategories}>
          {CATEGORY_ORDER.map((c) => {
            const on = !mutedCategories.includes(c);
            return (
              <button
                key={c}
                type="button"
                className={`cat-toggle chip--${CATEGORIES[c].tint}${on ? ' is-on' : ''}`}
                aria-pressed={on}
                onClick={() => toggleCategory(c)}
              >
                {CATEGORIES[c].label[lang]}
              </button>
            );
          })}
        </div>
      </SettingsGroup>

      <SettingsGroup title={t.sectionReading}>
        <div className="setting-switch">
          <div className="setting-switch__text">
            <span className="setting-switch__label">{t.hideReadLabel}</span>
            <span className="setting-switch__hint">{t.hideReadHint}</span>
          </div>
          <Switch checked={hideRead} onChange={setHideRead} ariaLabel={t.hideReadLabel} />
        </div>
        <div className="setting-divider" />
        <div className="setting-switch">
          <div className="setting-switch__text">
            <span className="setting-switch__label">{t.gamifyLabel}</span>
            <span className="setting-switch__hint">{t.gamifyHint}</span>
          </div>
          <Switch checked={gamification} onChange={setGamification} ariaLabel={t.gamifyLabel} />
        </div>
        {gamification && currentStreak > 0 && (
          <p className="setting-hint setting-hint--streak">
            {t.gamifyCurrentLabel}: {streakLabel(currentStreak, lang)}
          </p>
        )}
        <div className="setting-divider" />
        <div className="setting-switch">
          <div className="setting-switch__text">
            <span className="setting-switch__label">{t.glossaryLabel}</span>
            <span className="setting-switch__hint">{t.glossaryHint}</span>
          </div>
          <Switch
            checked={glossaryEnabled}
            onChange={setGlossaryEnabled}
            ariaLabel={t.glossaryLabel}
          />
        </div>
        <div className="setting-divider" />
        <button
          type="button"
          className="link-btn"
          onClick={clear}
          disabled={readCount === 0}
        >
          {t.clearReadLabel}
        </button>
      </SettingsGroup>

      <SettingsGroup title={t.sectionNotifications}>
        {notifications.supported ? (
          <div className="setting-switch">
            <div className="setting-switch__text">
              <span className="setting-switch__label">{t.notifyLabel}</span>
              <span className="setting-switch__hint">{t.notifyHint}</span>
            </div>
            <Switch
              checked={notifications.enabled}
              onChange={notifications.toggle}
              ariaLabel={t.notifyLabel}
            />
          </div>
        ) : (
          <p className="setting-hint">{t.notifyUnsupported}</p>
        )}
      </SettingsGroup>

      <button type="button" className="settings-link" onClick={onOpenAbout}>
        <span className="settings-link__text">
          <span className="settings-link__label">{t.sectionAbout}</span>
          <span className="settings-link__hint">{t.aboutRowHint}</span>
        </span>
        <Icon name="chevronRight" size={18} />
      </button>
    </ScreenScaffold>
  );
}
