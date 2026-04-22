// modules/aiEngine.js
// "Adaptive AI" — rule-based system that adjusts the user's plan over time
// based on their actual performance. NO external API, NO ML model.
// This is the kind of logic a real personal trainer applies in their head:
//
//   "Did you hit the rep target last 3 sessions? → bump it up."
//   "Did you bail out 2 sessions in a row? → reduce volume."
//   "Skipped >5 days? → recovery week."
//
// The engine reads from progressEngine + workout history and writes back
// a `recommendation` object that the UI surfaces to the user.

import { Store } from './storage.js?v=3';
import { todayString } from './utils.js?v=3';

const HISTORY_KEY = 'workoutHistory';

/* ============================================================
   HISTORY  — append-only log of completed sets
   { date, exerciseKey, exerciseName, targetReps, actualReps, completed }
   ============================================================ */

export function logSet(entry) {
  const hist = Store.get(HISTORY_KEY, []);
  hist.push({ ...entry, date: todayString(), ts: Date.now() });
  // Keep last 500 entries (plenty)
  if (hist.length > 500) hist.splice(0, hist.length - 500);
  Store.set(HISTORY_KEY, hist);
  return hist;
}

export function getHistory() {
  return Store.get(HISTORY_KEY, []);
}

export function clearHistory() {
  Store.remove(HISTORY_KEY);
}

/* ============================================================
   RECOMMENDATIONS
   ============================================================ */

/**
 * Recommend a rep adjustment for the next session of a given exercise.
 * Returns: { suggestedReps, reason, trend: 'progress' | 'steady' | 'regress' }
 */
export function recommendRepsFor(exerciseKey, currentTarget) {
  const hist = getHistory().filter(h => h.exerciseKey === exerciseKey).slice(-5);
  if (hist.length < 2) {
    return { suggestedReps: currentTarget, reason: 'Building baseline — keep going', trend: 'steady' };
  }

  const lastTwo = hist.slice(-2);
  const hitTarget = lastTwo.every(s => s.actualReps >= s.targetReps);
  const fellShort = lastTwo.every(s => s.actualReps < s.targetReps * 0.7);
  const avgActual = lastTwo.reduce((s, x) => s + x.actualReps, 0) / lastTwo.length;

  if (hitTarget) {
    const next = Math.round(currentTarget * 1.1) + 1;  // +10% (or at least +1)
    return {
      suggestedReps: next,
      reason: `🔥 You crushed ${avgActual.toFixed(0)} reps last session. Bumping target to ${next}.`,
      trend: 'progress',
    };
  }
  if (fellShort) {
    const next = Math.max(3, Math.round(currentTarget * 0.85));
    return {
      suggestedReps: next,
      reason: `Let's reset — averaging ${avgActual.toFixed(0)} reps. Try ${next} this session.`,
      trend: 'regress',
    };
  }
  return {
    suggestedReps: currentTarget,
    reason: `Steady progress — stick with ${currentTarget}.`,
    trend: 'steady',
  };
}

/**
 * Look at the user's session frequency and suggest plan adjustments.
 * Returns: array of recommendation strings the dashboard can display.
 */
export function planAdjustments(profile) {
  const recs = [];
  const hist = getHistory();
  if (!hist.length) return recs;

  // Days since last workout
  const lastTs = Math.max(...hist.map(h => h.ts));
  const daysSince = Math.floor((Date.now() - lastTs) / (24 * 3600 * 1000));

  if (daysSince >= 5) {
    recs.push({
      icon: '⏰',
      title: 'Welcome back!',
      message: `It's been ${daysSince} days. We'll start with a lighter recovery session today.`,
      severity: 'info',
    });
  }

  // Consistency: workouts in the last 7 days
  const recent = hist.filter(h => Date.now() - h.ts < 7 * 24 * 3600 * 1000);
  const distinctDays = new Set(recent.map(h => h.date)).size;
  if (distinctDays >= 4) {
    recs.push({
      icon: '🏆',
      title: 'On fire!',
      message: `${distinctDays} workouts this week. Outstanding consistency.`,
      severity: 'success',
    });
  } else if (distinctDays === 0 && hist.length > 0) {
    recs.push({
      icon: '💪',
      title: 'Time to move',
      message: 'No workouts logged this week. Even a 10-minute session counts.',
      severity: 'warn',
    });
  }

  // Goal-specific nudge
  if (profile && profile.goal === 'weight_loss' && distinctDays < 3) {
    recs.push({
      icon: '🔥',
      title: 'Cardio boost',
      message: 'For weight loss, aim for at least 3 workouts a week + a daily walk.',
      severity: 'info',
    });
  }
  return recs;
}

/**
 * Personal records — best-ever rep count per exercise.
 */
export function personalRecords() {
  const hist = getHistory();
  const prs = {};
  hist.forEach(s => {
    if (!prs[s.exerciseKey] || s.actualReps > prs[s.exerciseKey].reps) {
      prs[s.exerciseKey] = { reps: s.actualReps, name: s.exerciseName, date: s.date };
    }
  });
  return prs;
}

/**
 * Rolling weekly volume (total reps) for a given exercise — for the chart.
 * Returns: [{ week: 'YYYY-WW', total: number }]
 */
export function weeklyVolume(exerciseKey) {
  const hist = getHistory().filter(h => h.exerciseKey === exerciseKey);
  const buckets = {};
  hist.forEach(s => {
    const d = new Date(s.ts);
    const week = isoWeekKey(d);
    buckets[week] = (buckets[week] || 0) + s.actualReps;
  });
  return Object.entries(buckets)
    .sort(([a], [b]) => a < b ? -1 : 1)
    .map(([week, total]) => ({ week, total }));
}

function isoWeekKey(d) {
  // YYYY-WW
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(((date - firstThursday) / 86400000 - 3 + (firstThursday.getUTCDay() + 6) % 7) / 7);
  return `${date.getUTCFullYear()}-${String(week).padStart(2, '0')}`;
}
