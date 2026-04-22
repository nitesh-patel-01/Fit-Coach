// modules/utils.js
// Pure utility functions used across modules.

/* ---------- Math / Geometry (used by repCounter + form analysis) ---------- */

/** Distance between two 2D points {x, y}. */
export function distance(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Angle at vertex B formed by points A-B-C, in degrees.
 * Used to measure joint angles like elbow (shoulder-elbow-wrist) or knee (hip-knee-ankle).
 */
export function angleBetween(a, b, c) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2);
  const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2);
  const denom = magAB * magCB || 1e-9;
  let cos = dot / denom;
  cos = Math.max(-1, Math.min(1, cos));
  return Math.acos(cos) * (180 / Math.PI);
}

/** Clamp number to a range. */
export function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

/** Linear interpolation. */
export function lerp(a, b, t) { return a + (b - a) * t; }

/* ---------- Async helpers ---------- */

export function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

export function debounce(fn, wait = 200) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

/* ---------- Formatters ---------- */

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function todayString() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export function ageFromDob(dobString) {
  const dob = new Date(dobString);
  return Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

/* ---------- Health / Metabolism Math ---------- */

/**
 * Mifflin-St Jeor BMR formula (industry standard).
 * weight in kg, height in cm, age in years.
 */
export function calculateBMR({ weight, height, age, gender }) {
  if (!weight || !height || !age) return null;
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'female' ? base - 161 : base + 5;
}

/**
 * TDEE = BMR × activity multiplier.
 * activity: sedentary | light | moderate | active | very_active
 */
export function calculateTDEE(bmr, activity = 'moderate') {
  const mult = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  return bmr ? Math.round(bmr * (mult[activity] || 1.55)) : null;
}

/**
 * Suggest a calorie target based on goal.
 * - weight_loss: TDEE − 500 (≈0.5kg/week loss)
 * - muscle_gain: TDEE + 300
 * - general_fitness: TDEE
 */
export function calorieTarget(tdee, goal) {
  if (!tdee) return null;
  if (goal === 'weight_loss') return tdee - 500;
  if (goal === 'muscle_gain') return tdee + 300;
  return tdee;
}

/**
 * Macro split (protein/carbs/fats) in grams given a calorie target + goal.
 */
export function macroSplit(calories, weightKg, goal) {
  if (!calories || !weightKg) return null;
  // Protein: 1.6-2.2 g/kg depending on goal
  const proteinPerKg = goal === 'muscle_gain' ? 2.0 : goal === 'weight_loss' ? 2.0 : 1.6;
  const protein = Math.round(weightKg * proteinPerKg);
  // Fats: 25% of calories
  const fats = Math.round((calories * 0.25) / 9);
  // Remainder = carbs
  const remainingCal = calories - (protein * 4 + fats * 9);
  const carbs = Math.max(0, Math.round(remainingCal / 4));
  return { protein, carbs, fats };
}

/** BMI + category. */
export function calculateBMI(weight, heightCm) {
  if (!weight || !heightCm) return null;
  const h = heightCm / 100;
  const bmi = weight / (h * h);
  let category;
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';
  return { value: +bmi.toFixed(1), category };
}

/* ---------- Tiny event bus (modules pub/sub without coupling) ---------- */
const _bus = new EventTarget();
export const Bus = {
  on(event, cb) { _bus.addEventListener(event, cb); },
  off(event, cb) { _bus.removeEventListener(event, cb); },
  emit(event, detail) { _bus.dispatchEvent(new CustomEvent(event, { detail })); },
};

/* ---------- HTML escape (XSS safety in dynamic strings) ---------- */
export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ---------- Toast notifier (used everywhere for quick feedback) ---------- */
export function toast(msg, ms = 2200) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), ms);
}
