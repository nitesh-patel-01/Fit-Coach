// modules/exerciseAnimations.js
// =======================================================================
// EXERCISE IMAGES — DIRECT URL SYSTEM
// =======================================================================
// Paste ANY image URL you like: Google Images, Freepik, Pexels, Unsplash,
// Imgur, your own uploads, CDN-hosted photos — anything that serves a
// direct image.  Just replace the URL string next to the exercise key.
//
// ⚡ HOW TO CHANGE AN IMAGE:
//    1. Open this file in a text editor
//    2. Find the exercise key inside MALE_IMAGES or FEMALE_IMAGES below
//    3. Replace its URL string with your new image URL
//    4. Save → reload the page → done
//
// 📌 URL TIPS:
//    - Must start with https://
//    - Must be a DIRECT image link (usually ends in .jpg, .jpeg, .png,
//      .webp, .gif). Page URLs (e.g. google.com/imgres?...) will NOT work.
//    - Google Images   → right-click image → "Copy image address"
//    - Freepik         → use the final CDN URL after you download the file
//    - Pexels          → use the px() helper below or paste the full URL
//    - Unsplash        → use their /photos/... raw download URL
//    - Imgur / any CDN → paste the direct image URL
//
// 🖼️ IMAGES ARE ALWAYS FULLY VISIBLE:
//    The image card uses object-fit: contain, so portrait, landscape,
//    square, ultrawide — all aspect ratios display without cropping.
// =======================================================================

// Tiny helper to build Pexels URLs from just the photo ID (optional).
const px = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900`;

// =======================================================================
// 👨 MALE EXERCISE IMAGES — paste any URL to override
// =======================================================================
export const MALE_IMAGES = {
  // ---- PUSH / CHEST ----
  pushup:           'https://images.pexels.com/photos/176782/pexels-photo-176782.jpeg',
  pushup_diamond:   'https://i.ibb.co/LdmJDCZP/Screenshot-2024-03-21-at-12-36-05-PM.jpg',
  pushup_decline:   'https://i.ibb.co/2wCJK89/shutterstock-1390575701-eed06c1a-7b77-4082-b262-10470e28ce94-1000x.jpg',
  pushup_incline:   'https://images.pexels.com/photos/4803878/pexels-photo-4803878.jpeg',
  pushup_wide:      'https://images.pexels.com/photos/4720281/pexels-photo-4720281.jpeg',
  pushup_pike:      'https://images.pexels.com/photos/14793892/pexels-photo-14793892.jpeg',
  bench_press:      ' https://images.pexels.com/photos/3837781/pexels-photo-3837781.jpeg',
  bench_incline:    'https://images.pexels.com/photos/18060077/pexels-photo-18060077.jpeg',
  bench_decline:    'https://images.pexels.com/photos/16890699/pexels-photo-16890699.jpeg',
  chest_fly:        ' https://images.pexels.com/photos/14616295/pexels-photo-14616295.jpeg',
  dip:              'https://images.pexels.com/photos/6496123/pexels-photo-6496123.jpeg',

  // ---- PULL / BACK ----
  pullup:           'https://images.pexels.com/photos/34043597/pexels-photo-34043597.jpeg',
  lat_pulldown:     ' https://images.pexels.com/photos/18060085/pexels-photo-18060085.jpeg',
  row_bent:         'https://i.ibb.co/s9vM26Mt/row-66d063aa3f7e5.jpg',
  row_dumbbell:     'https://i.ibb.co/gbph1JDy/Dumbbell-Bent-Over-Row-Single-Arm.webp',
  row_seated:       'https://images.pexels.com/photos/11876626/pexels-photo-11876626.jpeg',
  deadlift:         'https://images.pexels.com/photos/5837307/pexels-photo-5837307.jpeg',
  rdl:              'https://i.ibb.co/YF7dYNJh/rdl-workout-480x480.jpg',

  // ---- SHOULDERS ----
  shoulder_press:   ' https://images.pexels.com/photos/34669288/pexels-photo-34669288.jpeg',
  arnold_press:     'https://images.pexels.com/photos/7289370/pexels-photo-7289370.jpeg',
  lateral_raise:    ' https://images.pexels.com/photos/5327460/pexels-photo-5327460.jpeg',
  front_raise:      'https://i.ibb.co/WvgYNLLr/img-2533-jpg-1580318618.jpg',
  reverse_fly:      'https://i.ibb.co/1tqXxX2c/reverseflie.jpg',
  shrug:            'https://i.ibb.co/KpTYhzvD/dumbbell-shrug-steps-1536x1153.png',

  // ---- ARMS ----
  bicep_curl:       ' https://images.pexels.com/photos/6550874/pexels-photo-6550874.jpeg',
  hammer_curl:      'https://images.pexels.com/photos/23158705/pexels-photo-23158705.jpeg',
  barbell_curl:     ' https://images.pexels.com/photos/9073246/pexels-photo-9073246.jpeg',
  tricep_pushdown:  ' https://images.pexels.com/photos/6243176/pexels-photo-6243176.jpeg',
  skull_crusher:    'https://i.ibb.co/jvt3HyPT/skull-Crusher20.jpg',
  kickback:         'https://i.ibb.co/3yyWbVY5/skimble-workout-trainer-exercise-dumbbell-tricep-kickbacks-2-iphone.jpg',
  oh_tricep:        'https://i.ibb.co/JRVz1pPn/overheadtricepsextension.jpg',

  // ---- LEGS ----
  squat:            'https://images.pexels.com/photos/4384679/pexels-photo-4384679.jpeg',
  squat_barbell:    'https://images.pexels.com/photos/13106607/pexels-photo-13106607.jpeg',
  goblet_squat:     'https://i.ibb.co/fdDt9bYr/goblet-squat-with-kettlebells-600x600.jpg',
  jump_squat:       'https://images.pexels.com/photos/2468366/pexels-photo-2468366.jpeg',
  wall_sit:         'https://i.ibb.co/rfFyw1gV/wall-squat-6634a69fa8eb5.jpg',
  lunge:            'https://images.pexels.com/photos/5067743/pexels-photo-5067743.jpeg',
  bulgarian:        'https://i.ibb.co/6JTrHF0P/Bulgarian-split-squats-for-glutes-2-520x500-520x500-7c041018-830f-4ec1-a62b-9e9a44750407-grande.jpg',
  leg_press:        'https://images.pexels.com/photos/18060020/pexels-photo-18060020.jpeg',
  leg_extension:    'https://images.pexels.com/photos/19254709/pexels-photo-19254709.jpeg',
  leg_curl:         'https://i.ibb.co/tT12PGZZ/1255.jpg',
  calf_raise:       'https://images.pexels.com/photos/9152547/pexels-photo-9152547.jpeg',
  glute_bridge:     'https://images.pexels.com/photos/6295723/pexels-photo-6295723.jpeg',
  hip_thrust:       'https://i.ibb.co/GvCJ2yHs/maxresdefault.jpg',

  // ---- CORE ----
  plank:            'https://images.pexels.com/photos/4047105/pexels-photo-4047105.jpeg',
  side_plank:       'https://images.pexels.com/photos/2294363/pexels-photo-2294363.jpeg',
  mountain_climber: 'https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg',
  crunch:           'https://images.pexels.com/photos/4162553/pexels-photo-4162553.jpeg',
  bicycle_crunch:   'https://images.pexels.com/photos/6496105/pexels-photo-6496105.jpeg',
  russian_twist:    'https://images.pexels.com/photos/4720520/pexels-photo-4720520.jpeg',
  leg_raise:        'https://images.pexels.com/photos/8520073/pexels-photo-8520073.jpeg',

  // ---- CARDIO ----
  burpee:           'https://images.pexels.com/photos/4803865/pexels-photo-4803865.jpeg',
  jumping_jack:     'https://images.pexels.com/photos/8544611/pexels-photo-8544611.jpeg',
  high_knee:        'https://images.pexels.com/photos/6339341/pexels-photo-6339341.jpeg',
  superman:         'https://images.pexels.com/photos/20860621/pexels-photo-20860621.jpeg',

  // ---- FALLBACK ----
  default:          px(29981150),
};

// =======================================================================
// 👩 FEMALE EXERCISE IMAGES — paste any URL to override
// =======================================================================
export const FEMALE_IMAGES = {
  // ---- PUSH / CHEST ----
  pushup:           px(6739040),
  pushup_diamond:   px(8038628),
  pushup_decline:   px(8038628),
  pushup_incline:   px(6739040),
  pushup_wide:      px(6739040),
  pushup_pike:      px(8038628),
  bench_press:      px(416754),
  bench_incline:    px(4853325),
  bench_decline:    px(4853325),
  chest_fly:        px(4853325),
  dip:              px(2247179),

  // ---- PULL / BACK ----
  pullup:           px(2247179),
  lat_pulldown:     px(2247179),
  row_bent:         px(14623740),
  row_dumbbell:     px(416809),
  row_seated:       px(866027),
  deadlift:         px(14623740),
  rdl:              px(14623740),

  // ---- SHOULDERS ----
  shoulder_press:   px(416809),
  arnold_press:     px(416809),
  lateral_raise:    px(866027),
  front_raise:      px(866027),
  reverse_fly:      px(866027),
  shrug:            px(14623740),

  // ---- ARMS ----
  bicep_curl:       px(4853325),
  hammer_curl:      px(4853325),
  barbell_curl:     px(14623740),
  tricep_pushdown:  px(866027),
  skull_crusher:    px(416754),
  kickback:         px(4853325),
  oh_tricep:        px(416809),

  // ---- LEGS ----
  squat:            px(416809),
  squat_barbell:    px(14623740),
  goblet_squat:     px(416809),
  jump_squat:       px(2247179),
  wall_sit:         px(3823086),
  lunge:            px(4807549),
  bulgarian:        px(4807549),
  leg_press:        px(2247179),
  leg_extension:    px(4807549),
  leg_curl:         px(2247179),
  calf_raise:       px(3823086),
  glute_bridge:     px(3823086),
  hip_thrust:       px(2247179),

  // ---- CORE ----
  plank:            px(14074802),
  side_plank:       px(14074802),
  mountain_climber: px(8038628),
  crunch:           px(14074802),
  bicycle_crunch:   px(14074802),
  russian_twist:    px(8038628),
  leg_raise:        px(3823086),

  // ---- CARDIO ----
  burpee:           px(8038628),
  jumping_jack:     px(2247179),
  high_knee:        px(2247179),
  superman:         px(3823086),

  // ---- FALLBACK ----
  default:          px(866027),
};

// =======================================================================
// Match an exercise name (free text) → one of the image keys above.
// =======================================================================
function matchKey(name) {
  const n = (name || '').toLowerCase();

  // CHEST / PUSH
  if (/incline bench|incline press/.test(n))          return 'bench_incline';
  if (/decline bench|decline press/.test(n))          return 'bench_decline';
  if (/bench press|chest press|dumbbell press/.test(n)) return 'bench_press';
  if (/chest fly|cable fly/.test(n))                  return 'chest_fly';
  if (/chest dip|tricep dip|^dip|\bdip\b/.test(n))    return 'dip';

  if (/diamond push|close-grip push|close grip push/.test(n)) return 'pushup_diamond';
  if (/decline push/.test(n))                         return 'pushup_decline';
  if (/incline push/.test(n))                         return 'pushup_incline';
  if (/wide push/.test(n))                            return 'pushup_wide';
  if (/pike push/.test(n))                            return 'pushup_pike';
  if (/push-up|pushup|push up/.test(n))               return 'pushup';

  // PULL / BACK
  if (/pull-up|pullup|pull up|chin-up|chinup/.test(n)) return 'pullup';
  if (/lat pulldown/.test(n))                         return 'lat_pulldown';
  if (/bent.over row|bent-over row|barbell row/.test(n)) return 'row_bent';
  if (/dumbbell row/.test(n))                         return 'row_dumbbell';
  if (/seated row|cable row/.test(n))                 return 'row_seated';

  if (/romanian deadlift|rdl/.test(n))                return 'rdl';
  if (/deadlift/.test(n))                             return 'deadlift';

  // SHOULDERS
  if (/arnold press/.test(n))                         return 'arnold_press';
  if (/shoulder press|military press|overhead press/.test(n)) return 'shoulder_press';
  if (/lateral raise|side raise/.test(n))             return 'lateral_raise';
  if (/front raise/.test(n))                          return 'front_raise';
  if (/reverse fly/.test(n))                          return 'reverse_fly';
  if (/shrug/.test(n))                                return 'shrug';

  // ARMS
  if (/hammer curl/.test(n))                          return 'hammer_curl';
  if (/barbell curl/.test(n))                         return 'barbell_curl';
  if (/preacher curl|bicep curl|curl\b/.test(n))      return 'bicep_curl';
  if (/tricep pushdown|pushdown/.test(n))             return 'tricep_pushdown';
  if (/skull crusher/.test(n))                        return 'skull_crusher';
  if (/tricep kickback|kickback/.test(n))             return 'kickback';
  if (/overhead tricep|tricep extension/.test(n))     return 'oh_tricep';

  // LEGS
  if (/barbell squat|back squat/.test(n))             return 'squat_barbell';
  if (/goblet squat/.test(n))                         return 'goblet_squat';
  if (/jump squat/.test(n))                           return 'jump_squat';
  if (/wall sit/.test(n))                             return 'wall_sit';
  if (/bulgarian|split squat/.test(n))                return 'bulgarian';
  if (/walking lunge|reverse lunge|lunge/.test(n))    return 'lunge';
  if (/squat/.test(n))                                return 'squat';
  if (/leg press/.test(n))                            return 'leg_press';
  if (/leg extension/.test(n))                        return 'leg_extension';
  if (/leg curl/.test(n))                             return 'leg_curl';
  if (/calf raise/.test(n))                           return 'calf_raise';
  if (/glute bridge/.test(n))                         return 'glute_bridge';
  if (/hip thrust/.test(n))                           return 'hip_thrust';

  // CORE
  if (/side plank/.test(n))                           return 'side_plank';
  if (/plank/.test(n))                                return 'plank';
  if (/mountain climber|climber/.test(n))             return 'mountain_climber';
  if (/bicycle crunch/.test(n))                       return 'bicycle_crunch';
  if (/russian twist/.test(n))                        return 'russian_twist';
  if (/leg raise/.test(n))                            return 'leg_raise';
  if (/crunch|sit-up|situp/.test(n))                  return 'crunch';

  // CARDIO
  if (/burpee/.test(n))                               return 'burpee';
  if (/jumping jack/.test(n))                         return 'jumping_jack';
  if (/high knee/.test(n))                            return 'high_knee';
  if (/superman/.test(n))                             return 'superman';

  return 'default';
}

// =======================================================================
// Color themes per muscle group — tinted accent overlays.
// =======================================================================
function matchTheme(name) {
  const n = (name || '').toLowerCase();
  if (/push-up|pushup|push up|bench press|chest press|chest fly|dip\b/.test(n))
    return ['#ff2d92', '#ff5a3c'];   // chest
  if (/pull-up|pullup|chin-up|row|lat pulldown|deadlift|superman/.test(n))
    return ['#7b2cff', '#00f5ff'];   // back
  if (/shoulder|lateral raise|front raise|arnold|reverse fly|shrug/.test(n))
    return ['#ffb320', '#ff5a3c'];   // shoulders
  if (/curl|tricep|skull|kickback|pushdown/.test(n))
    return ['#ff2d92', '#ffb320'];   // arms
  if (/squat|lunge|leg|calf|glute|hip thrust|wall sit|bulgarian/.test(n))
    return ['#00ff9f', '#00f5ff'];   // legs
  if (/plank|crunch|sit-up|situp|twist|leg raise|bicycle/.test(n))
    return ['#00f5ff', '#7b2cff'];   // core
  if (/burpee|jumping jack|high knee|mountain climber/.test(n))
    return ['#ff5a3c', '#ffb320'];   // cardio
  return ['#7b2cff', '#00f5ff'];
}

// =======================================================================
// Public API — resolveImageUrl + animatedExerciseSVG
// =======================================================================

/**
 * Returns the image URL for a given exercise name + gender.
 * Useful if you want to use the URL somewhere else (preload, hero, etc).
 */
export function resolveImageUrl(exerciseName, gender = 'male') {
  const key = matchKey(exerciseName);
  const set = (gender === 'female') ? FEMALE_IMAGES : MALE_IMAGES;
  return set[key] || set.default;
}

/**
 * Builds the HTML card for one exercise.  Name is kept the same
 * (animatedExerciseSVG) for drop-in backwards compatibility with the rest
 * of the app, even though the output is an HTML card around an <img>.
 *
 * @param {string} exerciseName  e.g. "Incline Bench Press"
 * @param {'male'|'female'} gender
 * @returns {string} HTML markup
 */
export function animatedExerciseSVG(exerciseName, gender = 'male') {
  const url = resolveImageUrl(exerciseName, gender);
  const [g1, g2] = matchTheme(exerciseName);
  const safeName = (exerciseName || '').replace(/[<>"'&]/g, '');

  return `
<div class="ex-photo-card" style="--g1: ${g1}; --g2: ${g2};">
  <!-- Image at natural aspect ratio — card auto-sizes, never crops -->
  <img class="ex-photo-img"
       src="${url}"
       alt="${safeName} exercise demonstration"
       loading="lazy"
       decoding="async"
       referrerpolicy="no-referrer"
       draggable="false"
       onerror="this.style.display='none';this.parentElement.classList.add('ex-photo-fallback');"/>
  <!-- Color tint matching muscle group -->
  <div class="ex-photo-tint"></div>
  <!-- Vignette darkening edges -->
  <div class="ex-photo-vignette"></div>
  <!-- Animated shimmer sweep -->
  <div class="ex-photo-shimmer"></div>
  <!-- Exercise name chip -->
  <div class="ex-photo-label">${safeName}</div>
  <!-- Gender icon chip -->
  <div class="ex-photo-gender">${gender === 'female' ? '♀' : '♂'}</div>
  <!-- Glowing futuristic corner brackets -->
  <div class="ex-photo-corner ex-photo-corner-tl"></div>
  <div class="ex-photo-corner ex-photo-corner-tr"></div>
  <div class="ex-photo-corner ex-photo-corner-bl"></div>
  <div class="ex-photo-corner ex-photo-corner-br"></div>
</div>`;
}
