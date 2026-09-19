import { useEffect, useMemo, useState } from 'react';
import type { QuizQuestion } from '../lib/types';
import { useSettings } from '../providers/SettingsProvider';
import { quizProgressLabel, quizScoreLabel } from '../lib/format';
import { hashString, shuffledOrder } from '../lib/seed';
import { haptic } from '../lib/haptics';

interface QuizState {
  /** Chosen option index (in the brief's original order) per answered question. */
  picks: number[];
  /** Question currently on screen; equals the question count once finished. */
  showing: number;
}

const storageKey = (date: string) => `aibrief.quiz.${date}`;

function loadState(date: string, total: number): QuizState {
  try {
    const raw = localStorage.getItem(storageKey(date));
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<QuizState>;
      const picks = Array.isArray(parsed.picks)
        ? parsed.picks.filter((p): p is number => Number.isInteger(p)).slice(0, total)
        : [];
      const showing =
        typeof parsed.showing === 'number' ? Math.max(0, Math.min(total, parsed.showing)) : 0;
      return { picks, showing: Math.min(showing, picks.length) };
    }
  } catch {
    /* ignore */
  }
  return { picks: [], showing: 0 };
}

function saveState(date: string, state: QuizState) {
  try {
    localStorage.setItem(storageKey(date), JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

/**
 * The day's quiz: three questions grounded in the brief, one at a time. The
 * explanation shows after every answer, the result card at the end. Progress
 * is kept per day on the device, so reopening the app resumes where you were.
 */
export function DailyQuiz({ date, quiz }: { date: string; quiz: QuizQuestion[] }) {
  const { lang, t } = useSettings();
  const total = quiz.length;
  const [state, setState] = useState<QuizState>(() => loadState(date, total));

  useEffect(() => saveState(date, state), [date, state]);

  // Stable per-day shuffle so the correct answer never sits in one place.
  const orders = useMemo(
    () => quiz.map((q, i) => shuffledOrder(q.options.length, hashString(`${date}#${i}`))),
    [date, quiz],
  );

  if (total === 0) return null;

  const correct = state.picks.filter((p, i) => p === quiz[i]?.answer).length;
  const finished = state.picks.length >= total && state.showing >= total;

  if (finished) {
    const tier = Math.min(t.quizResultTitles.length - 1, Math.round((correct / total) * 3));
    return (
      <section className="quiz" aria-label={t.quizTitle}>
        <div className="section-divider">
          <span>{t.quizTitle}</span>
        </div>
        <div className="panel quiz__panel quiz__panel--result">
          <div className="quiz__score">
            {correct}/{total}
          </div>
          <div className="quiz__result-title">{t.quizResultTitles[tier]}</div>
          <div className="quiz__result-sub">{quizScoreLabel(correct, total, lang)}</div>
          <button
            type="button"
            className="link-btn"
            onClick={() => setState({ picks: [], showing: 0 })}
          >
            {t.quizRetry}
          </button>
        </div>
      </section>
    );
  }

  const i = Math.min(state.showing, total - 1);
  const q = quiz[i];
  const answered = state.picks.length > i;
  const pick = answered ? state.picks[i] : null;
  const pickedRight = answered && pick === q.answer;

  function choose(optionIndex: number) {
    if (answered) return;
    haptic();
    setState((s) => ({ ...s, picks: [...s.picks.slice(0, i), optionIndex] }));
  }

  function next() {
    setState((s) => ({ ...s, showing: Math.min(total, i + 1) }));
  }

  return (
    <section className="quiz" aria-label={t.quizTitle}>
      <div className="section-divider">
        <span>{t.quizTitle}</span>
      </div>
      <div className="panel quiz__panel">
        <div className="quiz__meta">
          <span>{quizProgressLabel(i + 1, total, lang)}</span>
          {answered && (
            <span className={`quiz__verdict${pickedRight ? ' is-correct' : ' is-wrong'}`}>
              {pickedRight ? t.quizCorrect : t.quizWrong}
            </span>
          )}
        </div>
        <p className="quiz__q">{q.question[lang]}</p>
        <div className="quiz__opts" role="group" aria-label={q.question[lang]}>
          {orders[i].map((optionIndex, k) => {
            const isAnswer = optionIndex === q.answer;
            const isPick = pick === optionIndex;
            const cls = answered
              ? isAnswer
                ? ' is-correct'
                : isPick
                  ? ' is-wrong'
                  : ' is-dim'
              : '';
            return (
              <button
                key={optionIndex}
                type="button"
                className={`quiz__opt${cls}`}
                disabled={answered}
                aria-pressed={isPick}
                onClick={() => choose(optionIndex)}
              >
                <span className="quiz__letter">{String.fromCharCode(65 + k)}</span>
                <span>{q.options[optionIndex]?.[lang]}</span>
              </button>
            );
          })}
        </div>
        {answered && (
          <>
            <p className="quiz__explain">{q.explain[lang]}</p>
            <button type="button" className="btn quiz__next" onClick={next}>
              {i + 1 < total ? t.quizNext : t.quizShowResult}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
