// modules/onboarding.js
// Handles the first two screens:
//   1. Welcome screen  → "Get Started" button
//   2. Plan builder form (collects profile)
//
// On successful onboarding, calls onComplete(profile).

import { Store } from './storage.js?v=3';
import { ageFromDob, toast, Bus } from './utils.js?v=3';
import * as Progress from './progressEngine.js?v=3';

/**
 * Wire up the welcome screen's "Get Started" button.
 * Uses both onclick (direct) AND addEventListener for maximum reliability,
 * and wraps in try/catch so any error still unblocks the user.
 *
 * @param {Object} opts
 * @param {() => void} opts.onUnlock  called when user taps "Get Started"
 */
export function setupEntry({ onUnlock }) {
  const submit = document.getElementById('codeSubmit');
  if (!submit) {
    console.warn('[Fit Coach] Welcome button (#codeSubmit) not found in DOM');
    return;
  }

  const card = document.querySelector('.entry-card');
  let fired = false;

  function go(e) {
    if (e) { try { e.preventDefault(); } catch (_) {} }
    if (fired) return;     // prevent double-firing (click + touchend etc.)
    fired = true;
    console.log('[Fit Coach] Get Started clicked → going to next screen');
    try {
      if (card) {
        card.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
        card.style.transform  = 'scale(0.95)';
        card.style.opacity    = '0';
      }
    } catch (_) { /* ignore */ }
    // Always advance, even if animation fails
    setTimeout(() => {
      try {
        if (card) {
          card.style.transform = '';
          card.style.opacity   = '';
        }
      } catch (_) {}
      try { onUnlock(); }
      catch (err) {
        console.error('[Fit Coach] onUnlock failed:', err);
        // last-ditch fallback: manually flip screen
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const onboard = document.getElementById('screen-onboarding');
        if (onboard) onboard.classList.add('active');
      }
    }, 260);
  }

  // Attach THREE ways for maximum reliability: property, addEventListener, and event delegation
  submit.onclick = go;
  submit.addEventListener('click', go);
  submit.addEventListener('touchend', go, { passive: false });

  // Enter-key anywhere on welcome screen
  const entry = document.getElementById('screen-entry');
  if (entry) {
    entry.addEventListener('keydown', e => { if (e.key === 'Enter') go(e); });
  }
}

/**
 * Wire up the onboarding form. Calls onComplete(profile) when done.
 */
export function setupOnboarding({ onComplete, onBack }) {
  const optionGroups = ['gender', 'goal', 'type', 'level', 'diet'];
  const selected = {};

  optionGroups.forEach(g => {
    const grp = document.getElementById(g + 'Group');
    if (!grp) return;
    grp.addEventListener('click', e => {
      const card = e.target.closest('.option-card');
      if (!card) return;
      grp.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selected[g] = card.dataset.value;
      checkComplete();
    });
  });

  const nameInput   = document.getElementById('userName');
  const dobInput    = document.getElementById('userDob');
  const weightInput = document.getElementById('userWeight');
  const heightInput = document.getElementById('userHeight');
  const submitBtn   = document.getElementById('onboardSubmit');
  const statusEl    = document.getElementById('formStatus');

  function checkComplete() {
    const w = parseFloat(weightInput.value);
    const ok = nameInput.value.trim() &&
               dobInput.value &&
               !isNaN(w) && w >= 20 && w <= 300 &&
               optionGroups.every(g => selected[g]);
    submitBtn.disabled = !ok;
    statusEl.textContent = ok ? 'Ready to launch 🚀' : 'Fill all required fields to continue';
  }

  [nameInput, dobInput, weightInput, heightInput].forEach(el =>
    el.addEventListener('input', checkComplete)
  );

  document.getElementById('onboardForm').addEventListener('submit', e => {
    e.preventDefault();
    if (submitBtn.disabled) return;

    const profile = {
      name:    nameInput.value.trim(),
      dob:     dobInput.value,
      age:     ageFromDob(dobInput.value),
      weight:  parseFloat(weightInput.value),
      height:  parseFloat(heightInput.value) || null,
      gender:  selected.gender,
      goal:    selected.goal,
      type:    selected.type,        // gym | home
      level:   selected.level,        // beginner | intermediate | advanced
      diet:    selected.diet,         // veg | nonveg
      createdAt: Date.now(),
    };
    Store.set('profile', profile);

    // Seed initial weight entry so the chart starts from day 1
    Progress.logWeight(profile.weight);

    toast(`Welcome, ${profile.name}! 💪`);
    Bus.emit('profile:created', profile);
    onComplete(profile);
  });

  const back = document.getElementById('goBackEntry');
  if (back && onBack) back.addEventListener('click', onBack);
}

export function getProfile() { return Store.get('profile'); }
export function hasProfile() { return !!Store.get('profile'); }
