import type { ReactNode } from 'react';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { Segmented } from '../components/Segmented';
import { Switch } from '../components/Switch';
import type { Lang } from '../lib/types';
import type { Theme } from '../providers/SettingsProvider';
import { useSettings } from '../providers/SettingsProvider';
import { useRead } from '../providers/ReadProvider';

const APP_VERSION = '0.1.0';

function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="settings-group">
      <h2 className="settings-group__title">{title}</h2>
      <div className="settings-group__body">{children}</div>
    </section>
  );
}

export function SettingsScreen() {
  const { t, lang, setLang, theme, setTheme, hideRead, setHideRead, showCategories, setShowCategories } =
    useSettings();
  const { clear, readCount } = useRead();

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
        <div className="setting-divider" />
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
        <button
          type="button"
          className="link-btn"
          onClick={clear}
          disabled={readCount === 0}
        >
          {t.clearReadLabel}
        </button>
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

      <SettingsGroup title={t.sectionAbout}>
        <p className="setting-text">{t.aboutBody}</p>
        <p className="setting-text setting-text--spaced">{t.editorialNote}</p>
        <div className="about-meta">
          <span>
            {t.versionLabel} {APP_VERSION}
          </span>
          <span className="about-meta__model">
            {t.modelLabel} <strong>{t.modelName}</strong>
          </span>
        </div>
      </SettingsGroup>

      <p className="app-signature">
        {t.appName} · {t.tagline}
      </p>
    </ScreenScaffold>
  );
}
