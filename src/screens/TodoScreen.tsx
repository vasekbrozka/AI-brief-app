import { useState, type KeyboardEvent } from 'react';
import type { TipEntry } from '../lib/types';
import { ScreenScaffold } from '../components/ScreenScaffold';
import { Icon } from '../components/Icon';
import { ArchiveSkeleton, ErrorState } from '../components/states';
import { useRecentTips } from '../hooks/useTipsBacklog';
import { useSettings } from '../providers/SettingsProvider';
import { todoFromTip, useTodo, type TodoItem } from '../providers/TodoProvider';
import { capitalizeFirst, formatShortDate, todoCountLabel } from '../lib/format';
import { haptic } from '../lib/haptics';
import { toast } from '../lib/toast';

function keyToggle(fn: () => void) {
  return (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };
}

/** One item of the list: tick on the left, note clamped until tapped, a cross to drop it. */
function TodoRow({ item }: { item: TodoItem }) {
  const { lang, t } = useSettings();
  const { toggleDone, remove } = useTodo();
  const [expanded, setExpanded] = useState(false);
  const done = item.done != null;
  const note = item.note?.[lang];
  const expandable = Boolean(note) && !done;

  return (
    <li className={`todo__row${done ? ' is-done' : ''}`}>
      <button
        type="button"
        className={`todo__check${done ? ' is-on' : ''}`}
        aria-pressed={done}
        aria-label={done ? t.todoMarkOpen : t.todoMarkDone}
        onClick={() => {
          haptic();
          toggleDone(item.key);
        }}
      >
        {done && <Icon name="check" size={13} />}
      </button>
      <div
        className="todo__body"
        role={expandable ? 'button' : undefined}
        tabIndex={expandable ? 0 : undefined}
        onClick={expandable ? () => setExpanded((v) => !v) : undefined}
        onKeyDown={expandable ? keyToggle(() => setExpanded((v) => !v)) : undefined}
      >
        <span className="todo__title">{item.title[lang]}</span>
        {expandable && (
          <span className={`todo__note${expanded ? '' : ' todo__note--clamp'}`}>{note}</span>
        )}
        {!done && (item.date || item.source) && (
          <span className="todo__meta">
            {item.date && capitalizeFirst(formatShortDate(item.date, lang))}
            {item.source && (
              <>
                {item.date && ' · '}
                <a
                  className="source-link"
                  href={item.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.source.name}
                </a>
              </>
            )}
          </span>
        )}
      </div>
      {!done && (
        <button
          type="button"
          className="todo__remove"
          aria-label={t.todoRemoveLabel}
          onClick={() => {
            haptic();
            remove(item.key);
            toast(t.todoRemovedToast);
          }}
        >
          <Icon name="close" size={14} />
        </button>
      )}
    </li>
  );
}

/** A tip from the backlog the reader has not picked up yet; the plus adds it. */
function SuggestRow({ tip, onAdd }: { tip: TipEntry; onAdd: () => void }) {
  const { lang, t } = useSettings();
  const [expanded, setExpanded] = useState(false);
  const detail = tip.why?.[lang] ?? tip.summary[lang];
  const primary = tip.sources[0];

  return (
    <li className="todo__row">
      <button type="button" className="todo__add" aria-label={t.todoAddLabel} onClick={onAdd}>
        <Icon name="plus" size={16} />
      </button>
      <div
        className="todo__body"
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={keyToggle(() => setExpanded((v) => !v))}
      >
        <span className="todo__title">{tip.title[lang]}</span>
        <span className={`todo__note${expanded ? '' : ' todo__note--clamp'}`}>{detail}</span>
        <span className="todo__meta">
          {tip.used && capitalizeFirst(formatShortDate(tip.used, lang))}
          {primary && (
            <>
              {tip.used && ' · '}
              <a
                className="source-link"
                href={primary.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {primary.name}
              </a>
            </>
          )}
        </span>
      </div>
    </li>
  );
}

/**
 * The To do tab (optional, from Settings): what the reader kept for later —
 * open items first, done ones below — and, underneath, the recent tips from
 * the backlog that can be added with one tap.
 */
export function TodoScreen() {
  const { t, lang } = useSettings();
  const { items, add, has, clearDone, legacyTried, openCount, doneCount } = useTodo();
  const { status, tips, reload } = useRecentTips();

  const open = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);
  const suggestions = tips.filter((tip) => !has(`tip:${tip.slug}`) && !legacyTried.has(tip.slug));
  const subtitle = items.length ? todoCountLabel(openCount, doneCount, lang) : t.todoSubtitle;

  return (
    <ScreenScaffold title={t.todoTitle} subtitle={subtitle}>
      {items.length === 0 ? (
        <div className="panel todo__empty">
          <p className="todo__empty-title">{t.todoEmptyTitle}</p>
          <p className="todo__empty-body">{t.todoEmptyBody}</p>
        </div>
      ) : (
        <>
          {open.length > 0 && (
            <ul className="list todo__list">
              {open.map((item) => (
                <TodoRow key={item.key} item={item} />
              ))}
            </ul>
          )}
          {done.length > 0 && (
            <>
              <div className="section-divider">
                <span>{t.todoDoneSection}</span>
              </div>
              <ul className="list todo__list todo__list--done">
                {done.map((item) => (
                  <TodoRow key={item.key} item={item} />
                ))}
              </ul>
              <div className="todo__footer">
                <button type="button" className="link-btn" onClick={clearDone}>
                  {t.todoClearDone} ({done.length})
                </button>
              </div>
            </>
          )}
        </>
      )}

      <section aria-label={t.todoSuggestTitle}>
        <div className="section-divider">
          <span>{t.todoSuggestTitle}</span>
        </div>
        <p className="todo__hint">{t.todoSuggestHint}</p>
        {status === 'loading' && <ArchiveSkeleton />}
        {status === 'error' && <ErrorState onRetry={reload} />}
        {status === 'ready' && suggestions.length === 0 && (
          <p className="todo__hint">{t.todoSuggestEmpty}</p>
        )}
        {suggestions.length > 0 && (
          <ul className="list todo__list">
            {suggestions.map((tip) => (
              <SuggestRow
                key={tip.slug}
                tip={tip}
                onAdd={() => {
                  haptic();
                  add(todoFromTip(tip));
                  toast(t.todoAddedToast);
                }}
              />
            ))}
          </ul>
        )}
      </section>
    </ScreenScaffold>
  );
}
