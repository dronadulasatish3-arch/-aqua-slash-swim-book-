import { useState } from 'react';
import { api, type Student } from '../lib/api';
import { useIdentity } from '../lib/identity';
import { cn } from '../utils/cn';

export const LEARNING_EXPERIENCES = [
  { emoji: '😊', label: 'I loved it' },
  { emoji: '🙂', label: 'I liked it' },
  { emoji: '😐', label: 'It was okay' },
  { emoji: '💪', label: 'I need more practice' },
  { emoji: '😕', label: 'It was difficult' },
] as const;

const FEEDBACK_MAX = 1000;

/** 💬 Feedback — no login needed. Submits straight to Google Sheets with the local profile's name. */
export function FeedbackSection({ student }: { student: Student }) {
  const { token } = useIdentity();
  const [experience, setExperience] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (submitting) return;
    if (!experience) return setError('Please choose your Learning Experience.');
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.submitFeedback({
        studentId: student.studentId,
        studentName: student.studentName,
        email: student.email,
        token: token ?? undefined,
        learningExperience: experience,
        studentFeedback: text,
      });
      if (!res.success) return setError(res.message || 'Unable to save feedback.');
      setSent(true);
      setExperience(null);
      setText('');
    } catch {
      setError('Unable to reach the Aqua Slash server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <section id="feedback" className="fade-up rounded-[28px] bg-gradient-to-r from-sky-500 to-cyan-500 p-6 text-center text-white shadow-lg" role="status">
        <p className="font-display text-2xl font-semibold uppercase">💙 Thank you!</p>
        <p className="mt-1 font-bold">Your feedback has been saved.</p>
        <button onClick={() => setSent(false)} className="mt-4 min-h-11 rounded-2xl bg-white px-5 font-extrabold uppercase text-sky-700 shadow">
          Share more feedback
        </button>
      </section>
    );
  }

  return (
    <section id="feedback" className="space-y-5">
      <div className="text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.3em] text-sky-500">Glass & Pool · Your Aqua Slash experience</p>
        <h2 className="font-display text-2xl font-semibold uppercase text-[#06214a] sm:text-3xl">💬 Feedback</h2>
      </div>

      <form
        className="space-y-5 rounded-[28px] bg-white p-5 shadow-lg ring-1 ring-sky-100 sm:p-7"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        noValidate
      >
        <div className="rounded-2xl bg-sky-50 px-4 py-3">
          <p className="text-xs font-extrabold uppercase tracking-wider text-sky-500">From</p>
          <p className="truncate font-bold text-[#06214a]">{student.studentName}</p>
        </div>

        <fieldset>
          <legend className="mb-3 font-display text-xl font-semibold text-[#06214a]">
            Learning Experience <span className="text-rose-500">*</span>
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="radiogroup" aria-label="Learning Experience">
            {LEARNING_EXPERIENCES.map((r) => {
              const on = experience === r.label;
              return (
                <button
                  key={r.label}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => {
                    setExperience(r.label);
                    setError(null);
                  }}
                  className={cn(
                    'flex min-h-24 flex-col items-center justify-center gap-1 rounded-2xl p-3 text-center text-sm font-extrabold ring-2 transition focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200',
                    on ? 'scale-[1.03] bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-lg ring-sky-500' : 'bg-slate-50 text-slate-700 ring-slate-100 hover:ring-sky-200',
                  )}
                >
                  <span className="text-3xl" aria-hidden>
                    {r.emoji}
                  </span>
                  {r.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="block">
          <span className="font-display text-lg font-semibold text-[#06214a]">Tell us more (optional)</span>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value.slice(0, FEEDBACK_MAX));
              setError(null);
            }}
            maxLength={FEEDBACK_MAX}
            rows={4}
            placeholder="Tell us about your swimming learning experience…"
            className="mt-2 w-full resize-y rounded-2xl border-2 border-sky-100 p-4 font-semibold text-[#06214a] outline-none focus:border-cyan-400"
          />
          <span className={cn('block text-right text-xs font-bold', text.length > FEEDBACK_MAX - 80 ? 'text-amber-600' : 'text-slate-400')}>
            {text.length}/{FEEDBACK_MAX}
          </span>
        </label>

        {error && (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={cn(
            'min-h-14 w-full rounded-2xl px-6 py-4 font-display text-xl font-semibold uppercase tracking-wide transition focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200',
            experience && !submitting ? 'bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white shadow-xl shadow-sky-300/50 hover:-translate-y-0.5' : 'bg-slate-200 text-slate-500',
            submitting && 'cursor-wait',
          )}
        >
          {submitting ? '⏳ Sending…' : '💬 Submit Feedback'}
        </button>
      </form>
    </section>
  );
}
