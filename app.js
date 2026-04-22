/* =========================================================
   FIT COACH — APP ORCHESTRATOR
   Wires all modules together and manages the screen flow.
   ========================================================= */

import { Store } from './modules/storage.js?v=3';
import { ageFromDob, calculateBMR, todayString } from './modules/utils.js?v=3';
import { Voice } from './modules/voiceEngine.js?v=3';
import { setupEntry, setupOnboarding, getProfile, hasProfile } from './modules/onboarding.js?v=3';
import {
  generateSchedule, exercisesFor, WorkoutSession,
} from './modules/workoutEngine.js?v=3';
import {
  dietForProfile, nutritionTargets, totalsForMeal,
} from './modules/dietEngine.js?v=3';
import {
  getWeights, logWeight, currentWeight, weightDelta,
  getMeasurements, logMeasurements, latestMeasurements,
  waterCount, waterGoal, addWaterGlass, removeWaterGlass,
} from './modules/progressEngine.js?v=3';
import {
  logSet, planAdjustments,
} from './modules/aiEngine.js?v=3';
import {
  awardXP, getXP, levelFromXP, allAchievements, unlockedSet, checkAchievements,
} from './modules/gamification.js?v=3';
import { animatedExerciseSVG } from './modules/exerciseAnimations.js?v=3';

/* =========================================================
   STATE
   ========================================================= */
const State = {
  profile: null,
  schedule: [],
  selectedDayIdx: 0,
  selectedFocus: 'full_body',
  selectedMeal: 'breakfast',
  chart: null,
  voiceMuted: false,
  workoutSession: null,
  poseLoopId: null,
  repCounter: null,
  fpsCounter: { count: 0, lastT: 0, fps: 0 },
};

const QUOTES = [
  "Discipline is the bridge between goals and accomplishment.",
  "The only bad workout is the one that didn't happen.",
  "Strength does not come from the body. It comes from the will.",
  "You don't have to be great to start, but you have to start to be great.",
  "Sweat is just fat crying.",
  "Don't limit your challenges. Challenge your limits.",
  "Train hard, stay humble, eat clean.",
  "Your body can stand almost anything. It's your mind you have to convince.",
];

/* =========================================================
   SCREEN ROUTING
   ========================================================= */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('screen-' + id);
  if (target) target.classList.add('active');
  window.scrollTo(0, 0);
}

/* =========================================================
   ENTRY GATE BACKGROUND (lightweight canvas particles, replaces Three.js
   to keep low-end Android performance smooth)
   ========================================================= */
function initEntryBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;
  const N = window.innerWidth < 600 ? 40 : 70;
  const particles = Array.from({ length: N }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 1 + Math.random() * 2,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    hue: Math.random() < 0.6 ? 188 : 270,
  }));
  let raf;
  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, 0.55)`;
      ctx.fill();
    }
    raf = requestAnimationFrame(frame);
  }
  frame();
  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  });
  return () => cancelAnimationFrame(raf);
}

/* =========================================================
   DASHBOARD
   ========================================================= */
function loadAndShowDashboard() {
  State.profile = getProfile();
  if (!State.profile) {
    showScreen('entry');
    return;
  }

  // Theme
  const theme = Store.get('theme', 'dark');
  document.body.dataset.theme = theme;
  updateThemeBtn();

  showScreen('dashboard');
  initDashboard();
}

function initDashboard() {
  const p = State.profile;
  if (!p) return;

  // Welcome panel
  document.getElementById('welcomeName').textContent = p.name || 'Champ';
  document.getElementById('welcomeQuote').textContent = '"' + QUOTES[Math.floor(Math.random() * QUOTES.length)] + '"';
  const hr = new Date().getHours();
  const greet = hr < 12 ? 'GOOD MORNING' : hr < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';
  document.getElementById('welcomeGreet').textContent = greet;

  renderStats();
  renderXPHeader();
  renderAIInsights();
  renderSchedule();
  renderDiet();
  renderProgress();
  renderWater();
  renderMeasurements();
  renderStreak();
  renderAchievements();

  // Footer year
  document.getElementById('footerYear').textContent = new Date().getFullYear();
}

function renderStats() {
  const p = State.profile;
  const wt = currentWeight(p);
  const stats = [
    { label: 'Age',     value: (p.age || '--') + 'y' },
    { label: 'Weight',  value: wt ? wt + 'kg' : '--' },
    { label: 'Goal',    value: goalShort(p.goal) },
    { label: 'Streak',  value: getStreak().count + 'd' },
    { label: 'Progress',value: progressDelta() },
  ];
  // BMI (if height present)
  if (p.height && wt) {
    const h = p.height / 100;
    const bmi = (wt / (h * h)).toFixed(1);
    stats.splice(2, 0, { label: 'BMI', value: bmi });
  }
  document.getElementById('welcomeStats').innerHTML = stats.map(s =>
    `<div class="stat-pill"><div class="label">${s.label}</div><div class="value">${s.value}</div></div>`
  ).join('');
}

function progressDelta() {
  const ws = getWeights();
  if (!ws.length) return '0kg';
  const d = weightDelta();
  if (d === null) return '0kg';
  return (d > 0 ? '+' : '') + d.toFixed(1) + 'kg';
}

function goalShort(g) {
  return ({ weight_loss: 'Cut', muscle_gain: 'Bulk', general_fitness: 'Fit' })[g] || g || '--';
}
function goalLabel(g) {
  return ({ weight_loss: 'Weight Loss', muscle_gain: 'Muscle Gain', general_fitness: 'General Fitness' })[g] || g;
}

/* ---------- XP / Header ---------- */
function renderXPHeader() {
  const xp = getXP();
  const lv = levelFromXP(xp);
  document.getElementById('headerLevel').textContent = lv.level;
  document.getElementById('xpLevel').textContent = lv.level;
  document.getElementById('xpInto').textContent = lv.into;
  document.getElementById('xpSpan').textContent = lv.span;
  document.getElementById('xpFill').style.width = (lv.into / lv.span * 100) + '%';
}

/* ---------- AI Insights ---------- */
function renderAIInsights() {
  const adjustments = planAdjustments(State.profile) || [];
  const targets = nutritionTargets(State.profile);
  const insights = [...adjustments];
  if (targets && targets.macros) {
    insights.push(`🎯 Today's target: ${targets.target} kcal • ${targets.macros.protein}g protein • BMR ${targets.bmr}`);
  }
  document.getElementById('aiInsights').innerHTML = insights
    .slice(0, 3)
    .map(i => `<div class="ai-insight-item">${i}</div>`)
    .join('');
}

/* ---------- Schedule ---------- */
function renderSchedule() {
  const days = parseInt(document.getElementById('daysPerWeek').value, 10);
  const split = document.getElementById('splitType').value;
  const schedule = generateSchedule(days, split);
  State.schedule = schedule;

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  document.getElementById('scheduleGrid').innerHTML = schedule.map((focus, i) => `
    <div class="day-pill ${focus === 'rest' ? 'rest' : ''} ${i === State.selectedDayIdx ? 'active' : ''}" data-idx="${i}">
      <div class="day-name">${dayNames[i]}</div>
      <div class="day-focus">${focus === 'rest' ? '😴' : focusShort(focus)}</div>
    </div>
  `).join('');

  document.querySelectorAll('.day-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      State.selectedDayIdx = parseInt(pill.dataset.idx, 10);
      renderSchedule();
      renderTodayFocus();
      renderWorkoutList();
    });
  });

  renderTodayFocus();
  renderWorkoutList();
}
function focusShort(f) {
  return ({
    push: 'Push', pull: 'Pull', legs: 'Legs',
    chest: 'Chest', back: 'Back', shoulders: 'Shldr', arms: 'Arms',
    full_body: 'Full',
  })[f] || f;
}
function renderTodayFocus() {
  const focus = State.schedule[State.selectedDayIdx] || 'rest';
  State.selectedFocus = focus;
  document.getElementById('todayFocus').textContent = focus === 'rest'
    ? '😴 Rest Day — Recovery is when growth happens'
    : '💥 ' + (({
        push: 'Push Day — Chest, Shoulders, Triceps',
        pull: 'Pull Day — Back, Biceps',
        legs: 'Leg Day — Quads, Hams, Glutes, Calves',
        chest: 'Chest Day', back: 'Back Day',
        shoulders: 'Shoulder Day', arms: 'Arms Day',
        full_body: 'Full Body Workout',
      })[focus] || focus);
}

function renderWorkoutList() {
  const focus = State.selectedFocus;
  const list = document.getElementById('workoutList');
  if (focus === 'rest') {
    list.innerHTML = '<div style="text-align:center; padding:32px; color:var(--text-3);">😴 Rest day — let your muscles recover. Maybe a light walk?</div>';
    return;
  }
  const exercises = exercisesFor(focus, State.profile.type, State.profile.level, State.profile.gender);
  if (!exercises.length) {
    list.innerHTML = '<div style="text-align:center; padding:32px; color:var(--text-3);">No exercises configured.</div>';
    return;
  }
  list.innerHTML = exercises.map((ex, i) => {
    const animSvg = animatedExerciseSVG(ex.name, State.profile?.gender);
    const ytUrl = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(ex.name + ' exercise proper form');
    return `
      <div class="exercise-item" data-idx="${i}">
        <div class="exercise-head">
          <div class="ex-info">
            <div class="ex-num">${String(i + 1).padStart(2, '0')}</div>
            <div style="min-width:0; flex:1;">
              <div class="ex-name">${ex.name}</div>
              <div class="ex-meta">${ex.sets} × ${ex.reps} • Rest ${ex.rest}</div>
            </div>
          </div>
          <div class="ex-toggle">▼</div>
        </div>
        <div class="exercise-body">
          <div class="exercise-body-inner">
            <div class="ex-media ex-media-anim">${animSvg}
              <div class="ex-media-overlay">
                <span class="ex-media-badge">${ex.name}</span>
              </div>
            </div>
            <div class="ex-stats">
              <div class="ex-stat"><div class="l">Sets</div><div class="v">${ex.sets}</div></div>
              <div class="ex-stat"><div class="l">Reps</div><div class="v">${ex.reps}</div></div>
              <div class="ex-stat"><div class="l">Rest</div><div class="v">${ex.rest}</div></div>
            </div>
            <div class="ex-section-title">📋 How to Perform</div>
            <div class="ex-instructions">${ex.instructions}</div>
            <div class="ex-tips"><strong>💡 Pro Form Tip:</strong> ${ex.tips}</div>
            <div class="ex-actions">
              <button class="btn btn-ai" data-action="start"
                      data-name="${ex.name}"
                      data-sets="${ex.sets}"
                      data-reps="${ex.reps}"
                      data-rest="${parseRestSeconds(ex.rest)}">⏱️ Start Guided Set</button>
              <a class="btn btn-yt" href="${ytUrl}" target="_blank" rel="noopener">▶ Tutorial</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('.exercise-item').forEach(item => {
    item.querySelector('.exercise-head').addEventListener('click', () => item.classList.toggle('open'));
  });
  list.querySelectorAll('[data-action="start"]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      startGuidedSet({
        name: btn.dataset.name,
        sets: parseInt(btn.dataset.sets, 10) || 3,
        reps: btn.dataset.reps,
        restSeconds: parseInt(btn.dataset.rest, 10) || 60,
      });
    });
  });
}

function parseRestSeconds(restStr) {
  const m = String(restStr || '').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 60;
}

/* Smart SVG fallback — exercise-specific icon with premium look */
function buildExerciseFallbackSVG(exerciseName) {
  const n = (exerciseName || '').toLowerCase();
  let icon = '💪', g1 = '#7b2cff', g2 = '#00f5ff';

  if (n.includes('push-up') || n.includes('pushup') || n.includes('push up')) {
    icon = '🤲'; g1 = '#ff2d92'; g2 = '#ff5a3c';
  } else if (n.includes('pull-up') || n.includes('chin-up') || n.includes('pullup')) {
    icon = '🧗'; g1 = '#7b2cff'; g2 = '#00f5ff';
  } else if (n.includes('plank')) {
    icon = '🧘'; g1 = '#00f5ff'; g2 = '#00ff9f';
  } else if (n.includes('squat')) {
    icon = '🦵'; g1 = '#00ff9f'; g2 = '#00f5ff';
  } else if (n.includes('lunge')) {
    icon = '🚶'; g1 = '#00ff9f'; g2 = '#ffb320';
  } else if (n.includes('deadlift')) {
    icon = '🏋️'; g1 = '#7b2cff'; g2 = '#ff2d92';
  } else if (n.includes('bench press') || n.includes('chest press')) {
    icon = '🏋️‍♂️'; g1 = '#ff2d92'; g2 = '#ff5a3c';
  } else if (n.includes('fly')) {
    icon = '🦋'; g1 = '#ff2d92'; g2 = '#7b2cff';
  } else if (n.includes('row') || n.includes('pulldown')) {
    icon = '🚣'; g1 = '#7b2cff'; g2 = '#00f5ff';
  } else if (n.includes('curl')) {
    icon = '💪'; g1 = '#ff2d92'; g2 = '#ffb320';
  } else if (n.includes('tricep') || n.includes('pushdown') || n.includes('skull') || n.includes('dip')) {
    icon = '💪'; g1 = '#7b2cff'; g2 = '#ff2d92';
  } else if (n.includes('press') || n.includes('shoulder') || n.includes('arnold')) {
    icon = '🏋️‍♂️'; g1 = '#ffb320'; g2 = '#ff5a3c';
  } else if (n.includes('raise') || n.includes('shrug')) {
    icon = '🙆'; g1 = '#00f5ff'; g2 = '#7b2cff';
  } else if (n.includes('crunch') || n.includes('sit-up') || n.includes('leg raise') || n.includes('bicycle') || n.includes('russian')) {
    icon = '🔥'; g1 = '#00f5ff'; g2 = '#00ff9f';
  } else if (n.includes('mountain') || n.includes('climber') || n.includes('burpee') || n.includes('high knee') || n.includes('jump')) {
    icon = '🏃'; g1 = '#ff5a3c'; g2 = '#ffb320';
  } else if (n.includes('bridge') || n.includes('glute') || n.includes('hip')) {
    icon = '🍑'; g1 = '#ff2d92'; g2 = '#7b2cff';
  } else if (n.includes('calf')) {
    icon = '🦵'; g1 = '#00ff9f'; g2 = '#ffb320';
  } else if (n.includes('superman')) {
    icon = '🦸'; g1 = '#00f5ff'; g2 = '#7b2cff';
  } else if (n.includes('wall sit')) {
    icon = '🪑'; g1 = '#ffb320'; g2 = '#ff5a3c';
  }

  const safe = (exerciseName || '').replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'})[c]).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="${g1}" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="${g2}" stop-opacity="0.95"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="600" height="340" fill="#0a0a14"/>
    <rect width="600" height="340" fill="url(#bg)"/>
    <circle cx="300" cy="140" r="190" fill="url(#glow)"/>
    <text x="300" y="185" font-family="Arial, sans-serif" font-size="150" text-anchor="middle" dominant-baseline="middle">${icon}</text>
    <text x="300" y="295" font-family="Arial Black, sans-serif" font-size="22" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2.5" opacity="0.97">${safe}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function parseTargetReps(repsStr) {
  // "10-12" → 12 ; "8" → 8 ; "AMRAP" → 15
  if (!repsStr) return 10;
  const match = String(repsStr).match(/(\d+)\s*(?:-\s*(\d+))?/);
  if (!match) return 10;
  return parseInt(match[2] || match[1], 10);
}

/* ---------- Diet ---------- */
function renderDiet() {
  const plan = dietForProfile(State.profile);
  document.getElementById('dietTitle').textContent =
    `Indian ${State.profile.diet === 'veg' ? 'Vegetarian' : 'Non-Veg'} • ${goalLabel(State.profile.goal)}`;
  document.getElementById('dietTotal').textContent = `~${plan.total} kcal`;

  const targets = nutritionTargets(State.profile);
  if (targets && targets.macros) {
    document.getElementById('macroPills').innerHTML = `
      <span class="macro-pill"><span class="m-label">P</span><span class="m-val">${targets.macros.protein}g</span></span>
      <span class="macro-pill"><span class="m-label">C</span><span class="m-val">${targets.macros.carbs}g</span></span>
      <span class="macro-pill"><span class="m-label">F</span><span class="m-val">${targets.macros.fats}g</span></span>
      <span class="macro-pill"><span class="m-label">Target</span><span class="m-val">${targets.target} kcal</span></span>
    `;
  } else {
    document.getElementById('macroPills').innerHTML = '';
  }

  renderMeal(plan, State.selectedMeal);

  document.querySelectorAll('#mealTabs .meal-tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('#mealTabs .meal-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      State.selectedMeal = tab.dataset.meal;
      renderMeal(plan, State.selectedMeal);
    };
  });
}
function renderMeal(plan, meal) {
  const items = plan[meal] || [];
  const icons = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snacks: '🍎' };
  document.getElementById('mealList').innerHTML = items.map(item => `
    <div class="meal-item">
      <div class="meal-ico">${icons[meal] || '🍽️'}</div>
      <div class="meal-name">${item.name}</div>
      <div class="meal-cal">${item.cal} kcal</div>
    </div>
  `).join('') || '<div style="text-align:center; padding:18px; color:var(--text-3);">No items.</div>';
}

/* ---------- Progress ---------- */
function renderProgress() {
  const ctx = document.getElementById('progressChart');
  if (!ctx || typeof Chart === 'undefined') return;
  const weights = getWeights();

  if (State.chart) State.chart.destroy();

  const labels = weights.map((_, i) => 'Day ' + (i + 1));
  const data = weights.map(w => w.weight);
  const isLight = document.body.dataset.theme === 'light';

  State.chart = new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Weight (kg)',
        data,
        borderColor: '#00f5ff',
        backgroundColor: 'rgba(0,245,255,0.12)',
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: '#7b2cff',
        tension: 0.35,
        fill: true,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { color: isLight ? '#4a5070' : '#b3b8d4' }, grid: { color: isLight ? 'rgba(15,20,40,0.06)' : 'rgba(255,255,255,0.06)' } },
        x: { ticks: { color: isLight ? '#4a5070' : '#b3b8d4' }, grid: { display: false } },
      },
    },
  });

  // Insight
  const goal = State.profile.goal;
  const ins = document.getElementById('weightInsight');
  if (weights.length < 2) {
    ins.textContent = '💡 Log your weight regularly to see your progress.';
  } else {
    const d = weightDelta();
    if (goal === 'weight_loss') {
      ins.textContent = d < 0 ? `🔥 Down ${Math.abs(d).toFixed(1)}kg — fat loss on track!` : `⚠️ Up ${d.toFixed(1)}kg. Tighten diet & cardio.`;
    } else if (goal === 'muscle_gain') {
      ins.textContent = d > 0 ? `💪 Up ${d.toFixed(1)}kg — keep eating in surplus!` : `⚠️ Down ${Math.abs(d).toFixed(1)}kg. Add ~200 kcal.`;
    } else {
      ins.textContent = `📊 Net change: ${d > 0 ? '+' : ''}${d.toFixed(1)}kg over ${weights.length} entries.`;
    }
  }
}

/* ---------- Water ---------- */
function renderWater() {
  const cnt = waterCount();
  const goal = waterGoal();
  document.getElementById('waterCount').textContent = cnt;
  document.getElementById('waterGoal').textContent = goal;
  document.getElementById('waterGlasses').innerHTML = Array.from({ length: goal }, (_, i) =>
    `<div class="water-glass ${i < cnt ? 'filled' : ''}">💧</div>`
  ).join('');
}

/* ---------- Measurements ---------- */
function renderMeasurements() {
  const last = latestMeasurements();
  if (last) {
    document.getElementById('measChest').value = last.chest || '';
    document.getElementById('measArms').value = last.arms || '';
    document.getElementById('measWaist').value = last.waist || '';
    document.getElementById('measThighs').value = last.thighs || '';
  }
  const history = getMeasurements().slice().reverse().slice(0, 5);
  document.getElementById('measHistory').innerHTML = history.map(m => {
    const d = new Date(m.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    return `<div class="meas-history-row">
      <span class="date">${d}</span>
      <span>C ${m.chest || '-'} • A ${m.arms || '-'} • W ${m.waist || '-'} • T ${m.thighs || '-'}</span>
    </div>`;
  }).join('');
}

/* ---------- Streak ---------- */
function getStreak() { return Store.get('streak', { count: 0, lastCheckin: null }); }
function setStreak(s) { Store.set('streak', s); }
function renderStreak() {
  const s = getStreak();
  document.getElementById('streakNum').textContent = s.count;
  document.getElementById('headerStreakCount').textContent = s.count;
  // Badges
  const targets = [3, 7, 14, 30, 60, 100];
  document.getElementById('badgesRow').innerHTML = targets.map(t => `
    <div class="badge ${s.count >= t ? 'earned' : ''}" title="${t}-day streak">${t >= 100 ? '👑' : t >= 30 ? '🏆' : t >= 14 ? '💎' : t >= 7 ? '🔥' : '⭐'}</div>
  `).join('');

  const today = todayString();
  const last = s.lastCheckin ? new Date(s.lastCheckin).toDateString() : null;
  const btn = document.getElementById('checkinBtn');
  if (last === new Date().toDateString()) {
    btn.textContent = '✓ Checked In Today';
    btn.disabled = true;
    btn.style.opacity = 0.6;
  } else {
    btn.textContent = '🔥 Check In Today';
    btn.disabled = false;
    btn.style.opacity = 1;
  }
}

/* ---------- Achievements ---------- */
function renderAchievements() {
  const all = allAchievements();
  const unlocked = unlockedSet();
  document.getElementById('achGrid').innerHTML = all.map(a => `
    <div class="ach-card ${unlocked.has(a.id) ? 'unlocked' : ''}">
      <div class="ach-icon">${a.icon}</div>
      <div class="ach-name">${a.name}</div>
      <div class="ach-desc">${a.desc}</div>
    </div>
  `).join('');
}

/* =========================================================
   WORKOUT MODE  —  TIMER-BASED (no AI, no camera)
   Indian-English voice guidance with circular progress ring.

   Flow per exercise:
     1. Countdown 3-2-1-GO
     2. Active set: timer counts up. User taps "End Set" when done.
     3. Rest timer counts DOWN with voice alerts at 10s, 5s, 0s.
     4. Repeat for all sets.
     5. Workout complete → XP awarded + confetti.
   ========================================================= */

// Timer state (module-scoped — resets on each new session)
let TM = null;

function startGuidedSet({ name, sets, reps, restSeconds }) {
  TM = {
    name,
    totalSets: sets,
    currentSet: 0,
    reps,
    restSeconds,
    phase: 'idle',
    elapsed: 0,
    targetRest: restSeconds,
    rafId: null,
    phaseStartMs: 0,
    totalReps: parseRepsToNumber(reps),
    totalStartMs: Date.now(),
  };

  showScreen('workout');
  document.body.classList.add('workout-active');

  setText('wmExerciseName', name);
  setText('wmTargetReps', `Target: ${reps} reps`);
  setRing(0);
  hideFormCue();
  showSkipButton(false);

  // Inject animated SVG for this exercise
  const animHost = document.getElementById('wmAnim');
  if (animHost) animHost.innerHTML = animatedExerciseSVG(name, State.profile?.gender);

  // WARMUP / INTRO voice — detailed welcome
  const introMsg = `${name} workout starting. We will do ${sets} sets of ${reps} repetitions. Rest between sets will be ${restSeconds} seconds. Let's begin!`;
  Voice.speak(introMsg);

  // Give voice a moment, then start first set
  setTimeout(() => runSet(1), 2800);
}

function parseRepsToNumber(repsStr) {
  const m = String(repsStr || '').match(/(\d+)/g);
  if (!m) return 10;
  return parseInt(m[m.length - 1], 10);
}

async function runSet(setNum) {
  if (!TM) return;
  TM.currentSet = setNum;
  setText('wmSetIndicator', `Set ${setNum} of ${TM.totalSets}`);
  setText('wmTargetReps', `Target: ${TM.reps} reps`);

  // --- COUNTDOWN PHASE ---
  TM.phase = 'countdown';
  setText('wmPhaseLabel', 'GET READY');
  const setsLeft = TM.totalSets - setNum;
  const setContext = setNum === 1
    ? `Set one. Get into position.`
    : setsLeft === 0
      ? `Final set! You got this. Give your best.`
      : `Set ${setNum}. ${setsLeft} more set${setsLeft === 1 ? '' : 's'} after this.`;
  setText('wmStatus', setContext);
  Voice.speak(setContext + ' Starting in 3, 2, 1, go!');

  await runCountdown(['3', '2', '1', 'GO!']);
  if (!TM) return;

  // --- ACTIVE PHASE ---
  TM.phase = 'active';
  TM.elapsed = 0;
  TM.phaseStartMs = performance.now();
  setText('wmPhaseLabel', 'ACTIVE');
  setText('wmStatus', `Do ${TM.reps} reps with good form`);
  setPrimaryBtn('End Set ✓', 'btn-primary tm-primary-btn');
  showSkipButton(false);
  setRing(0);

  // Voice milestones during active phase — detailed coaching in Indian English
  TM.milestones = [
    { at: 8,  msg: 'Keep the form tight', fired: false },
    { at: 18, msg: 'You are doing great, keep going', fired: false },
    { at: 30, msg: 'Halfway through, stay strong', fired: false },
    { at: 45, msg: 'Push through, almost there', fired: false },
    { at: 60, msg: 'One minute. Finish strong!', fired: false },
  ];

  startActiveTimer();
}

async function runCountdown(steps) {
  const el = document.getElementById('wmCountdown');
  for (const s of steps) {
    if (!TM) return;
    el.textContent = s;
    el.classList.remove('pulse');
    void el.offsetWidth;
    el.classList.add('pulse');
    await new Promise(r => setTimeout(r, 800));
  }
  el.textContent = '';
  el.classList.remove('pulse');
}

function startActiveTimer() {
  if (!TM) return;
  cancelAnimationFrame(TM.rafId);

  const tick = () => {
    if (!TM || TM.phase !== 'active') return;
    const now = performance.now();
    TM.elapsed = Math.floor((now - TM.phaseStartMs) / 1000);

    setText('wmTimerValue', formatMMSS(TM.elapsed));
    const pct = Math.min(TM.elapsed / 60, 1);
    setRing(pct);

    if (TM.milestones) {
      for (const m of TM.milestones) {
        if (!m.fired && TM.elapsed >= m.at) {
          m.fired = true;
          Voice.speak(m.msg);
          showFormCue(m.msg);
        }
      }
    }

    TM.rafId = requestAnimationFrame(tick);
  };
  TM.rafId = requestAnimationFrame(tick);
}

function endSet(targetReached = false) {
  if (!TM) return;

  if (TM.phase === 'active') {
    cancelAnimationFrame(TM.rafId);
    const duration = TM.elapsed;
    const targetReps = TM.totalReps;

    try {
      logSet({
        exerciseKey: TM.name.toLowerCase().replace(/\s+/g, '_'),
        exerciseName: TM.name,
        targetReps,
        actualReps: targetReps,
        duration,
        completed: true,
        mode: 'timer',
      });
      awardXP(10 + 5 * TM.currentSet, `Completed Set ${TM.currentSet} of ${TM.name}`);
    } catch (e) { console.warn('[TM] log error', e); }

    // Context-aware completion cue
    const setsLeft = TM.totalSets - TM.currentSet;
    let setCompleteMsg;
    if (setsLeft === 0) {
      setCompleteMsg = `Final set complete! Outstanding work!`;
    } else if (setsLeft === 1) {
      setCompleteMsg = `Set ${TM.currentSet} done! Just one more set remaining. You got this!`;
    } else {
      setCompleteMsg = `Set ${TM.currentSet} complete! ${setsLeft} more sets to go.`;
    }
    Voice.speak(setCompleteMsg);
    setText('wmStatus', `✅ Set ${TM.currentSet} complete!`);

    if (TM.currentSet < TM.totalSets) {
      setTimeout(() => startRest(), 1200);
    } else {
      setTimeout(() => finishWorkout(), 1400);
    }
    return;
  }

  if (TM.phase === 'rest') {
    skipRest();
  }
}

function startRest() {
  if (!TM) return;
  TM.phase = 'rest';
  TM.targetRest = TM.restSeconds;
  TM.elapsed = 0;
  TM.phaseStartMs = performance.now();

  setText('wmPhaseLabel', 'REST');
  setText('wmStatus', `Rest time — breathe deep, hydrate yourself`);
  setText('wmTimerValue', formatMMSS(TM.restSeconds));
  setPrimaryBtn('Skip Rest →', 'btn-secondary');
  showSkipButton(true);
  setRing(1);

  // Detailed rest intro voice
  const restIntro = TM.restSeconds >= 90
    ? `Take rest for ${TM.restSeconds} seconds. Breathe deeply. Have some water.`
    : `Rest for ${TM.restSeconds} seconds. Take a deep breath.`;
  Voice.speak(restIntro);

  TM.restMilestones = {
    half: false,
    thirty: false,
    twenty: false,
    ten: false,
    five: false,
    three: false,
  };

  const tick = () => {
    if (!TM || TM.phase !== 'rest') return;
    const now = performance.now();
    const elapsed = (now - TM.phaseStartMs) / 1000;
    const remaining = Math.max(0, Math.ceil(TM.targetRest - elapsed));

    setRing(1 - (elapsed / TM.targetRest));
    setText('wmTimerValue', formatMMSS(remaining));

    const rm = TM.restMilestones;
    // Voice milestones during rest (context-aware)
    if (!rm.half && TM.targetRest >= 90 && remaining <= Math.floor(TM.targetRest / 2) && remaining > 30) {
      rm.half = true;
      Voice.speak('Halfway through rest');
    }
    if (!rm.thirty && remaining === 30 && TM.targetRest > 45) {
      rm.thirty = true;
      Voice.speak('30 seconds remaining');
    }
    if (!rm.twenty && remaining === 20 && TM.targetRest > 30) {
      rm.twenty = true;
      Voice.speak('20 seconds. Start getting ready.');
    }
    if (!rm.ten && remaining <= 10 && remaining > 5 && !rm.ten) {
      rm.ten = true;
      Voice.speak('10 seconds. Get into position.');
    }
    if (!rm.five && remaining <= 5 && remaining > 2) {
      rm.five = true;
      Voice.speak('5 seconds. Ready yourself.');
    }
    if (!rm.three && remaining <= 3 && remaining > 0) {
      rm.three = true;
      Voice.speak(`3, 2, 1!`);
    }

    if (remaining <= 0) {
      cancelAnimationFrame(TM.rafId);
      runSet(TM.currentSet + 1);
      return;
    }
    TM.rafId = requestAnimationFrame(tick);
  };
  TM.rafId = requestAnimationFrame(tick);
}

function skipRest() {
  if (!TM || TM.phase !== 'rest') return;
  cancelAnimationFrame(TM.rafId);
  Voice.speak('Rest skipped. Next set coming up.');
  setTimeout(() => runSet(TM.currentSet + 1), 600);
}

function finishWorkout() {
  if (!TM) return;
  cancelAnimationFrame(TM.rafId);
  TM.phase = 'done';
  const totalMins = Math.floor((Date.now() - TM.totalStartMs) / 60000);
  setText('wmPhaseLabel', 'COMPLETE');
  setText('wmTimerValue', '🎉');
  setText('wmStatus', `${TM.name} — all ${TM.totalSets} sets done in ${totalMins} minutes!`);
  setText('wmTargetReps', `+${25 + 5 * TM.totalSets} XP earned`);
  setRing(1);
  setPrimaryBtn('Finish Workout ✓', 'btn-primary tm-primary-btn');
  showSkipButton(false);

  try {
    awardXP(25, `Completed ${TM.name} workout`);
    checkAchievements({});
  } catch (e) { /* swallow */ }

  // Celebration voice — warm and motivating
  const finishMsg = `Workout complete! You finished ${TM.totalSets} sets of ${TM.name}. Excellent work! Drink some water and stretch your muscles. See you tomorrow!`;
  Voice.speak(finishMsg);
}

/* ---------- UI helpers ---------- */

function setText(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

function setRing(pct) {
  const ring = document.getElementById('wmRingFg');
  if (!ring) return;
  const C = 2 * Math.PI * 118;
  const dash = Math.max(0, Math.min(1, pct)) * C;
  ring.style.strokeDasharray = `${dash} ${C - dash}`;
  const wrap = document.querySelector('.tm-wrap');
  if (wrap && TM) wrap.setAttribute('data-phase', TM.phase);
}

function setPrimaryBtn(text, cls) {
  const btn = document.getElementById('wmPrimaryBtn');
  if (!btn) return;
  btn.textContent = text;
  btn.className = 'btn ' + cls;
}

function showSkipButton(show) {
  const el = document.getElementById('wmSkip');
  if (el) el.style.display = show ? '' : 'none';
}

function formatMMSS(s) {
  s = Math.max(0, Math.floor(s));
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return String(m).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
}

let formCueTimer = null;
function showFormCue(msg) {
  const el = document.getElementById('wmFormCue');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  if (formCueTimer) clearTimeout(formCueTimer);
  formCueTimer = setTimeout(() => el.classList.remove('show'), 2400);
}
function hideFormCue() {
  const el = document.getElementById('wmFormCue');
  if (el) el.classList.remove('show');
  if (formCueTimer) clearTimeout(formCueTimer);
}

/* ---------- Stop / Close ---------- */

function stopWorkoutMode() {
  if (TM && TM.rafId) cancelAnimationFrame(TM.rafId);
  TM = null;
  Voice.cancel();
  hideFormCue();
  document.body.classList.remove('workout-active');
}

function closeWorkoutMode() {
  stopWorkoutMode();
  showScreen('dashboard');
  initDashboard();
}

/* =========================================================
   GLOBAL EVENT WIRING (only attached once at init)
   ========================================================= */
function wireGlobalEvents() {
  // Theme toggle
  document.getElementById('themeBtn').addEventListener('click', () => {
    const next = (document.body.dataset.theme === 'dark') ? 'light' : 'dark';
    document.body.dataset.theme = next;
    Store.set('theme', next);
    updateThemeBtn();
    renderProgress();
  });

  // Reset
  document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('resetModal').classList.add('show');
  });
  document.getElementById('cancelReset').addEventListener('click', () => {
    document.getElementById('resetModal').classList.remove('show');
  });
  document.getElementById('confirmReset').addEventListener('click', () => {
    Store.clearAll();
    document.getElementById('resetModal').classList.remove('show');
    location.reload();
  });

  // Schedule controls
  document.getElementById('daysPerWeek').addEventListener('change', renderSchedule);
  document.getElementById('splitType').addEventListener('change', renderSchedule);

  // Weight log
  document.getElementById('logWeight').addEventListener('click', () => {
    const inp = document.getElementById('weightInput');
    const w = parseFloat(inp.value);
    if (!w || w < 20 || w > 300) { showToast('Enter a valid weight (20–300 kg)'); return; }
    logWeight(w);
    inp.value = '';
    renderProgress();
    renderStats();
    awardXP(5, 'Weight log');
    renderXPHeader();
    showToast('Weight logged ✓');
  });

  // Water tracker
  document.getElementById('waterPlus').addEventListener('click', () => {
    addWaterGlass();
    renderWater();
    if (waterCount() === waterGoal()) {
      showToast('💧 Daily water goal hit! +10 XP');
      awardXP(10, 'Water goal');
      renderXPHeader();
    }
  });
  document.getElementById('waterMinus').addEventListener('click', () => {
    removeWaterGlass();
    renderWater();
  });

  // Measurements
  document.getElementById('logMeas').addEventListener('click', () => {
    const m = {
      date: Date.now(),
      chest: parseFloat(document.getElementById('measChest').value) || null,
      arms: parseFloat(document.getElementById('measArms').value) || null,
      waist: parseFloat(document.getElementById('measWaist').value) || null,
      thighs: parseFloat(document.getElementById('measThighs').value) || null,
    };
    if (!m.chest && !m.arms && !m.waist && !m.thighs) {
      showToast('Enter at least one measurement');
      return;
    }
    logMeasurements(m);
    renderMeasurements();
    showToast('Measurements saved ✓');
  });

  // Check-in
  document.getElementById('checkinBtn').addEventListener('click', () => {
    const s = getStreak();
    const todayStr = new Date().toDateString();
    const lastStr = s.lastCheckin ? new Date(s.lastCheckin).toDateString() : null;
    if (lastStr === todayStr) return;
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    if (lastStr === yesterday.toDateString()) {
      s.count += 1;
    } else {
      s.count = 1;
    }
    s.lastCheckin = Date.now();
    setStreak(s);
    renderStreak();
    renderStats();
    awardXP(15, 'Daily check-in');
    renderXPHeader();
    checkAchievements({ streak: s.count, totalReps: 0, weights: getWeights(), waterDaysHit: 0 });
    renderAchievements();
    showToast(`🔥 Streak: ${s.count} day${s.count > 1 ? 's' : ''}! +15 XP`);
  });

  // Workout mode controls
  document.getElementById('wmClose').addEventListener('click', closeWorkoutMode);
  document.getElementById('wmStop').addEventListener('click', () => endSet(false));
  document.getElementById('wmPrimaryBtn').addEventListener('click', () => {
    if (!TM) return;
    if (TM.phase === 'active')      endSet(false);
    else if (TM.phase === 'rest')   skipRest();
    else if (TM.phase === 'done')   closeWorkoutMode();
  });
  document.getElementById('wmSkip').addEventListener('click', skipRest);
  document.getElementById('wmMute').addEventListener('click', () => {
    State.voiceMuted = !State.voiceMuted;
    document.getElementById('wmMute').textContent = State.voiceMuted ? '🔇' : '🔊';
    if (State.voiceMuted) Voice.cancel();
  });

  // Set summary modal close
  document.getElementById('closeSetSummary').addEventListener('click', () => {
    document.getElementById('setSummaryModal').classList.remove('show');
    closeWorkoutMode();
  });

  // Data export/import
  document.getElementById('exportData').addEventListener('click', () => {
    const blob = new Blob([Store.exportAll()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `fitcoach-backup-${todayString()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Backup exported ✓');
  });
  document.getElementById('importData').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      Store.importAll(text);
      showToast('Backup restored — reloading...');
      setTimeout(() => location.reload(), 800);
    } catch (err) {
      showToast('❌ Invalid backup file');
    }
  });
}

function updateThemeBtn() {
  document.getElementById('themeBtn').textContent = document.body.dataset.theme === 'dark' ? '🌙' : '☀️';
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove('show'), 2400);
}

/* =========================================================
   INIT
   ========================================================= */
window.addEventListener('error', (e) => {
  console.error('[Fit Coach Error]', e.message, e.filename, e.lineno);
});

document.addEventListener('DOMContentLoaded', () => {
  try {
    // Signal to the inline fallback in index.html that the ES module loaded fine
    window.__fitcoachReady = true;

    // Load saved theme even before login
    const theme = Store.get('theme', 'dark');
    document.body.dataset.theme = theme;

    // Setup entry gate
    setupEntry({
      onUnlock: () => {
        // Decide: returning user → dashboard, new user → onboarding
        if (hasProfile()) {
          loadAndShowDashboard();
        } else {
          showScreen('onboarding');
        }
      },
    });

    // Setup onboarding
    setupOnboarding({
      onComplete: (profile) => {
        State.profile = profile;
        // Seed initial weight to progress chart
        if (profile.weight && getWeights().length === 0) {
          logWeight(profile.weight);
        }
        loadAndShowDashboard();
        showToast(`Welcome aboard, ${profile.name}! 💪`);
        if (!State.voiceMuted) Voice.speak(`Welcome ${profile.name}, your plan is ready.`);
      },
      onBack: () => showScreen('entry'),
    });

    wireGlobalEvents();

    // If already onboarded, skip to dashboard
    if (hasProfile()) {
      loadAndShowDashboard();
    } else {
      // Show entry only and animate background
      initEntryBackground();
    }

    console.log('[Fit Coach] App initialized ✓');
  } catch (err) {
    console.error('[Fit Coach] Init failed:', err);
    alert('App failed to initialize: ' + err.message);
  }
});
