import { Fragment, useMemo } from 'react';
import { useSettings } from '../providers/SettingsProvider';
import { useGlossary } from '../providers/GlossaryProvider';
import { segmentText } from '../lib/glossary';
import { haptic } from '../lib/haptics';

/**
 * Renders a passage of brief text with known AI terms turned into tappable,
 * dotted-underlined words. Falls back to plain text when the glossary is off,
 * still loading, or the passage contains no known terms.
 */
export function GlossaryText({ text }: { text: string }) {
  const { lang, glossaryEnabled } = useSettings();
  const { glossary, openTerm } = useGlossary();

  const segments = useMemo(
    () =>
      glossaryEnabled && glossary ? segmentText(text, lang, glossary) : null,
    [text, lang, glossary, glossaryEnabled],
  );

  if (!segments || (segments.length === 1 && !segments[0].entry)) return <>{text}</>;

  return (
    <>
      {segments.map((seg, i) =>
        seg.entry ? (
          <button
            key={i}
            type="button"
            className="term"
            aria-label={seg.entry.term[lang]}
            onClick={(e) => {
              e.stopPropagation();
              haptic();
              openTerm(seg.entry!, e.currentTarget.getBoundingClientRect());
            }}
          >
            {seg.text}
          </button>
        ) : (
          <Fragment key={i}>{seg.text}</Fragment>
        ),
      )}
    </>
  );
}
