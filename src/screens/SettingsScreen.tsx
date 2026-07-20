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

const APP_VERSION = '1.4';

function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="settings-group">
      <h2 className="settings-group__title">{title}</h2>
      <div className="settings-group__body">{children}</div>
    </section>
  );
}

export function SettingsScreen() {
  const {
    t,
    lang,
    setLang,
    theme,
    setTheme,
    hideRead,
    setHideRead,
    showCategories,
    setShowCategories,
    mutedCategories,
    toggleCategory,
    gamification,
    setGamification,
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
        <div className="setting-switch">
          <div className="setting-switch__text">
            <span className="setting-switch__label">{t.categoriesLabel}</span>
            <span className="setting-switch__hint">{t.categoriesHint}</span>
          </div>
          <Switch
            checked={showCategories}
            onChange={setShowCategories}
            ariaLabel={t.categoriesLabel}
          />
        </div>
        <div className="setting-divider" />
        <div className="setting-switch__text">
          <span className="setting-switch__label">{t.categoriesShownLabel}</span>
          <span className="setting-switch__hint">{t.categoriesShownHint}</span>
        </div>
        <div className="cat-toggles" role="group" aria-label={t.categoriesShownLabel}>
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

      <SettingsGroup title={t.sectionInstall}>
        <p className="setting-text">{t.installIntro}</p>
        <ol className="steps">
          {t.installSteps.map((step, i) => (
            <li key={i} className="steps__item">
              <span className="steps__num">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="setting-hint">{t.installShareHint}</p>
      </SettingsGroup>

      <SettingsGroup title={t.sectionHowItWorks}>
        {t.howItWorksParagraphs.map((paragraph, i) => (
          <p key={i} className="setting-text setting-text--spaced">
            {paragraph}
          </p>
        ))}
      </SettingsGroup>

      <SettingsGroup title={t.sectionSources}>
        <p className="about-line">
          <strong>{t.sourcesOfficialLabel}</strong>: {t.sourcesOfficialList}
        </p>
        <p className="about-line">
          <strong>{t.sourcesMediaLabel}</strong>: {t.sourcesMediaList}
        </p>
      </SettingsGroup>

      <SettingsGroup title={t.sectionReleaseNotes}>
        <p className="release-version">
          {t.versionLabel} {APP_VERSION}
        </p>
        {[
          { label: t.releaseAddedLabel, items: t.releaseAdded },
          { label: t.releaseImprovedLabel, items: t.releaseImproved },
          { label: t.releaseFixedLabel, items: t.releaseFixed },
        ].map(({ label, items }) =>
          items.length > 0 ? (
            <div key={label}>
              <p className="release-label">{label}</p>
              <ul className="release-list">
                {items.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null,
        )}
      </SettingsGroup>

      <SettingsGroup title={t.sectionAbout}>
        <p className="about-title">
          {t.appName} · {t.aboutTagline}
        </p>
        <p className="about-line">
          {t.versionLabel} {APP_VERSION}
        </p>
        <p className="about-line">
          {t.modelLabel} <strong>{t.modelName}</strong>
        </p>
        <div className="setting-divider" />
        <p className="setting-text">{t.supportText}</p>
        <a
          className="support-link"
          href="https://buymeacoffee.com/vasekbrozka"
          target="_blank"
          rel="noopener noreferrer"
        >
          ☕️ {t.supportCta}
          <Icon name="external" size={15} />
        </a>
      </SettingsGroup>

      <p className="app-signature">{t.signature}</p>
    </ScreenScaffold>
  );
}
