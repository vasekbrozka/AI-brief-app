import { useSettings } from '../providers/SettingsProvider';
import { useVotes } from '../providers/VotesProvider';
import { haptic } from '../lib/haptics';
import { Icon } from './Icon';

/**
 * Thumbs up / down for one id (a story, or a whole day as "<date>-brief"),
 * with everyone's counts once the site has answered. The reader's own choice
 * is highlighted; tapping it again retracts the vote.
 */
export function VoteButtons({ id, size = 16 }: { id: string; size?: number }) {
  const { t } = useSettings();
  const { voteFor, countFor, vote } = useVotes();
  const mine = voteFor(id);
  const counts = countFor(id);

  const button = (kind: 'up' | 'down') => (
    <button
      type="button"
      className={`vote-btn vote-btn--${kind}${mine === kind ? ' is-on' : ''}`}
      aria-pressed={mine === kind}
      aria-label={kind === 'up' ? t.voteUp : t.voteDown}
      onClick={() => {
        haptic();
        vote(id, kind);
      }}
    >
      <Icon name={kind === 'up' ? 'thumbUp' : 'thumbDown'} size={size} />
      {counts[kind] > 0 && <span className="vote-btn__count">{counts[kind]}</span>}
    </button>
  );

  return (
    <div className="vote-btns">
      {button('up')}
      {button('down')}
    </div>
  );
}
