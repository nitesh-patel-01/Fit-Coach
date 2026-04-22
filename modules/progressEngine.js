// modules/progressEngine.js
// Tracks the user's measurable progress over time:
//   - Body weight (the main one — already used in v1)
//   - Body measurements (chest, arms, waist, thighs)
//   - Water intake (today only — resets daily)
//   - Workout streak (carried over from v1)
// Provides clean read/write APIs that the UI binds to.

import { Store } from './storage.js?v=3';
import { todayString } from './utils.js?v=3';

/* ============================================================
   WEIGHT LOG
   { weight: number, date: 'YYYY-MM-DD', ts: number }
   ============================================================ */

export function getWeights() {
  return Store.get('weights', []);
}

export function logWeight(weight) {
  if (!weight || weight < 20 || weight > 300) return null;
  const list = getWeights();
  list.push({ weight, date: todayString(), ts: Date.now() });
  Store.set('weights', list);
  return list;
}

export function deleteWeightAt(index) {
  const list = getWeights();
  list.splice(index, 1);
  Store.set('weights', list);
  return list;
}

export function weightDelta() {
  const list = getWeights();
  if (list.length < 2) return 0;
  return +(list[list.length - 1].weight - list[0].weight).toFixed(1);
}

export function currentWeight(profile) {
  const list = getWeights();
  if (list.length) return list[list.length - 1].weight;
  return profile && profile.weight;
}

/* ============================================================
   BODY MEASUREMENTS
   { chest, arms, waist, thighs, ts, date } (all in cm)
   ============================================================ */

const MEAS_KEY = 'measurements';
export function getMeasurements() { return Store.get(MEAS_KEY, []); }
export function logMeasurements(m) {
  const list = getMeasurements();
  list.push({ ...m, date: todayString(), ts: Date.now() });
  Store.set(MEAS_KEY, list);
  return list;
}
export function latestMeasurements() {
  const list = getMeasurements();
  return list[list.length - 1] || null;
}

/* ============================================================
   WATER INTAKE  (resets daily)
   ============================================================ */

const WATER_KEY = 'water';
const DAILY_GOAL_GLASSES = 8;

function _waterToday() {
  const w = Store.get(WATER_KEY, { date: '', count: 0 });
  if (w.date !== todayString()) return { date: todayString(), count: 0 };
  return w;
}

export function waterCount() { return _waterToday().count; }
export function waterGoal() { return DAILY_GOAL_GLASSES; }
export function addWaterGlass() {
  const w = _waterToday();
  w.count = Math.min(w.count + 1, 20);
  Store.set(WATER_KEY, w);
  return w.count;
}
export function removeWaterGlass() {
  const w = _waterToday();
  w.count = Math.max(0, w.count - 1);
  Store.set(WATER_KEY, w);
  return w.count;
}

/* ============================================================
   STREAK
   ============================================================ */

const STREAK_KEY = 'streak';

export function getStreak() {
  return Store.get(STREAK_KEY, { count: 0, lastCheckin: null });
}

export function checkInToday() {
  const s = getStreak();
  const today = todayString();
  const last = s.lastCheckin;
  if (last === today) return s; // already checked in
  if (!last) {
    s.count = 1;
  } else {
    const lastDate = new Date(last);
    const diff = Math.round((Date.now() - lastDate.getTime()) / (24 * 3600 * 1000));
    if (diff === 1) s.count += 1;
    else s.count = 1; // streak broken
  }
  s.lastCheckin = today;
  Store.set(STREAK_KEY, s);
  return s;
}

export function isCheckedInToday() {
  return getStreak().lastCheckin === todayString();
}

/* ============================================================
   WEEKLY INSIGHT (used on dashboard)
   ============================================================ */

export function weeklyInsight() {
  const w = getWeights();
  if (w.length < 2) return null;
  const first = w[0], last = w[w.length - 1];
  const days = Math.max(1, Math.round((last.ts - first.ts) / (24 * 3600 * 1000)));
  const delta = +(last.weight - first.weight).toFixed(1);
  const perWeek = +((delta / days) * 7).toFixed(2);
  return {
    days,
    totalDelta: delta,
    weeklyAvg: perWeek,
    direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
  };
}
