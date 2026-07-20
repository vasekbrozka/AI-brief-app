import type { ReactNode } from 'react';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { Icon } from '../components/Icon';
import { useSettings } from '../providers/SettingsProvider';

export const APP_VERSION = '1.5';

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="settings-group">
      <h2 className="settings-group__title">{title}</h2>
      <div className="settings-group__body">{children}</div>
    </section>
  );
}

/** Reference/info screen split out of Settings: identity, support, how it
 * works, install, sources, release notes. Reached from a row in Settings. */
export function AboutScreen({ onBack }: { onBack: () => void }) {
  const { t } = useSettings();

  const backButton = (
    <button type="button" className="navbtn navbtn--back" onClick={onBack}>
      <Icon name="chevronLeft" size={22} />
      <span>{t.back}</span>
    </button>
  );

  return (
    <ScreenScaffold title={t.sectionAbout} left={backButton}>
      {/* Identity + support — lead block, no redundant "About" title. */}
      <section className="settings-group settings-group--lead">
        <div className="settings-group__body">
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
        </div>
      </section>

      <Group title={t.sectionHowItWorks}>
        {t.howItWorksParagraphs.map((paragraph, i) => (
          <p key={i} className="setting-text setting-text--spaced">
            {paragraph}
          </p>
        ))}
      </Group>

      <Group title={t.sectionInstall}>
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
      </Group>

      <Group title={t.sectionSources}>
        <p className="about-line">
          <strong>{t.sourcesOfficialLabel}</strong>: {t.sourcesOfficialList}
        </p>
        <p className="about-line">
          <strong>{t.sourcesMediaLabel}</strong>: {t.sourcesMediaList}
        </p>
      </Group>

      <Group title={t.sectionReleaseNotes}>
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
      </Group>

      <p className="app-signature">{t.signature}</p>
    </ScreenScaffold>
  );
}
