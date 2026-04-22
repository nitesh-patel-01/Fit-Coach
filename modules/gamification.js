// modules/gamification.js
// XP, levels, and achievements — the dopamine layer.
// XP is awarded for:
//   - Completing a workout set      → 10 XP per set + 1 XP per rep
//   - Daily check-in (streak hit)   → 25 XP
//   - Beating a personal record     → 50 XP bonus
//   - Hitting daily water goal      → 20 XP
//
// Level curve: level N requires N * 100 XP cumulatively.
//   L1: 0-99     L2: 100-299    L3: 300-599   etc.

import { Store } from './storage.js?v=3';
import { Bus } from './utils.js?v=3';

const XP_KEY = 'xp';
const ACH_KEY = 'achievements';

export function getXP() { return Store.get(XP_KEY, 0); }

export function awardXP(amount, reason = '') {
  if (!amount || amount <= 0) return getXP();
  const before = getXP();
  const after = before + Math.round(amount);
  Store.set(XP_KEY, after);
  Bus.emit('xp:awarded', { amount, reason, total: after });
  // Did we level up?
  const lvlBefore = levelFromXP(before);
  const lvlAfter = levelFromXP(after);
  if (lvlAfter.level > lvlBefore.level) {
    Bus.emit('xp:levelup', { level: lvlAfter.level });
  }
  return after;
}

/**
 * Level math. Given total XP, return level info.
 * Cumulative threshold for level N start = N(N-1)/2 * 100  (so each level needs +100 more than the last)
 *   L1 starts at 0, L2 at 100, L3 at 300, L4 at 600, L5 at 1000, ...
 */
export function levelFromXP(xp) {
  let level = 1;
  while ((level * (level - 1) / 2) * 100 <= xp) level++;
  level = Math.max(1, level - 1);
  const startXP = (level * (level - 1) / 2) * 100;
  const nextXP = ((level + 1) * level / 2) * 100;
  const into = xp - startXP;
  const span = nextXP - startXP;
  return { level, into, span, percent: Math.round((into / span) * 100), nextAt: nextXP };
}

/* ============================================================
   ACHIEVEMENTS
   ============================================================ */

const ACHIEVEMENTS = [
  { id: 'first_workout', name: 'First Sweat',       icon: '💦', desc: 'Complete your first workout set' },
  { id: 'streak_3',      name: '3-Day Spark',       icon: '🔥', desc: 'Workout 3 days in a row' },
  { id: 'streak_7',      name: 'Week Warrior',      icon: '⚡', desc: '7-day streak' },
  { id: 'streak_30',     name: 'Month Machine',     icon: '🏆', desc: '30-day streak' },
  { id: 'reps_100',      name: 'Century Club',      icon: '💯', desc: '100 reps in a single session' },
  { id: 'reps_1000',     name: 'Volume King',       icon: '👑', desc: '1000 total reps logged' },
  { id: 'pushup_25',     name: 'Push-Up Pro',       icon: '💪', desc: '25 push-ups in one set' },
  { id: 'squat_50',      name: 'Squat Master',      icon: '🦵', desc: '50 squats in one set' },
  { id: 'level_5',       name: 'Rising Star',       icon: '⭐', desc: 'Reach Level 5' },
  { id: 'level_10',      name: 'Fitness Pro',       icon: '🌟', desc: 'Reach Level 10' },
  { id: 'water_7',       name: 'Hydration Hero',    icon: '💧', desc: 'Hit water goal 7 days' },
  { id: 'first_kg_lost', name: 'First Kg Down',     icon: '⚖️', desc: 'Lose your first kg' },
];

export function allAchievements() { return ACHIEVEMENTS; }

export function unlockedSet() {
  return new Set(Store.get(ACH_KEY, []));
}

function unlock(id) {
  const set = unlockedSet();
  if (set.has(id)) return false;
  set.add(id);
  Store.set(ACH_KEY, Array.from(set));
  const ach = ACHIEVEMENTS.find(a => a.id === id);
  if (ach) Bus.emit('achievement:unlocked', ach);
  return true;
}

/**
 * Check all achievement conditions against current state.
 * Call this periodically (after a workout, after a check-in, etc.).
 */
export function checkAchievements({ streak, totalReps, lastSetReps, lastSetExercise, weights, waterDaysHit }) {
  unlock('first_workout'); // any check call after first set qualifies (we call this after sets)
  if (streak >= 3)  unlock('streak_3');
  if (streak >= 7)  unlock('streak_7');
  if (streak >= 30) unlock('streak_30');
  if (lastSetReps >= 100) unlock('reps_100');
  if (totalReps >= 1000)   unlock('reps_1000');
  if (lastSetExercise === 'pushup' && lastSetReps >= 25) unlock('pushup_25');
  if (lastSetExercise === 'squat'  && lastSetReps >= 50) unlock('squat_50');

  const lvl = levelFromXP(getXP()).level;
  if (lvl >= 5)  unlock('level_5');
  if (lvl >= 10) unlock('level_10');

  if (weights && weights.length >= 2) {
    const lost = weights[0].weight - weights[weights.length - 1].weight;
    if (lost >= 1) unlock('first_kg_lost');
  }
  if (waterDaysHit >= 7) unlock('water_7');
}
