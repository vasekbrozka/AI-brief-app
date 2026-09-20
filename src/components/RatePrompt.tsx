import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../providers/SettingsProvider';
import { useVotes } from '../providers/VotesProvider';
import { VoteButtons } from './VoteButtons';
import { Icon } from './Icon';

// The day whose prompt the reader closed — it never comes back for that day.
const DISMISSED_KEY = 'aibrief.ratePrompt.dismissed';

function wasDismissed(date: string): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === date;
  } catch {
    return false;
  }
}

function remember(date: string): void {
  try {
    localStorage.setItem(DISMISSED_KEY, date);
  } catch {
    /* ignore */
  }
}

/**
 * A small sheet above the tab bar that asks for the day's rating the moment
 * the last story is marked read — the one point where everyone is sure to
 * see it. Deliberately not a duty: it never appears on a page that opens
 * already finished, never twice for one day, closes with one tap ("Not now"
 * or the cross) and leaves the rating panel at the end of the brief as the
 * quiet alternative. A vote thanks and closes it by itself.
 */
export function RatePrompt({
  dayId,
  date,
  allRead,
}: {
  dayId: string;
  date: string;
  allRead: boolean;
}) {
  const { t } = useSettings();
  const { voteFor } = useVotes();
  const voted = voteFor(dayId) != null;
  const [open, setOpen] = useState(false);
  const wasAllRead = useRef(allRead);

  useEffect(() => {
    if (allRead && !wasAllRead.current && !voted && !wasDismissed(date)) {
      // Let the last card fold and the streak celebrate first.
      const id = window.setTimeout(() => setOpen(true), 900);
      wasAllRead.current = true;
      return () => window.clearTimeout(id);
    }
    wasAllRead.current = allRead;
  }, [allRead, voted, date]);

  useEffect(() => {
    if (!open || !voted) return;
    const id = window.setTimeout(() => setOpen(false), 1500);
    return () => window.clearTimeout(id);
  }, [open, voted]);

  if (!open) return null;

  function dismiss() {
    remember(date);
    setOpen(false);
  }

  return (
    <div className={`rateprompt${voted ? ' is-thanks' : ''}`} role="dialog" aria-label={t.rateTodayLabel}>
      <div className="rateprompt__head">
        <strong className="rateprompt__title">{voted ? t.voteThanks : t.rateTodayLabel}</strong>
        {!voted && (
          <button type="button" className="rateprompt__close" aria-label={t.closeLabel} onClick={dismiss}>
            <Icon name="close" size={16} />
          </button>
        )}
      </div>
      {!voted && (
        <>
          <p className="rateprompt__body">{t.ratePromptBody}</p>
          <div className="rateprompt__row">
            <VoteButtons id={dayId} size={18} />
            <button type="button" className="link-btn rateprompt__later" onClick={dismiss}>
              {t.ratePromptLater}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
