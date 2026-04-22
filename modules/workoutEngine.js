// modules/workoutEngine.js
// Simplified, deployment-ready workout engine.
//   - 4 exercises per focus/level (trimmed from 6-7)
//   - ALL exercises: 3 sets (was 3-5)
//   - 6-day full_body schedule: Sunday rest (was Thursday)
//   - Every exercise has a verified image URL

/* ============================================================
   1. IMAGE MAP  — folder names verified against free-exercise-db
   URL: /exercises/{Folder}/0.jpg  (NO /images/ subfolder)
   ============================================================ */

const IMG_BASE = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/';
const img = folder => IMG_BASE + folder + '/0.jpg';

export const EX_IMG = {
  // CHEST
  'Push-Up':              img('Pushups'),
  'Wide Push-Up':         img('Pushups'),
  'Diamond Push-Up':      img('Pushups_-_Close_Triceps_Position'),
  'Decline Push-Up':      img('Decline_Push-Up'),
  'Incline Push-Up':      img('Pushups'),
  'Bench Press':          img('Barbell_Bench_Press_-_Medium_Grip'),
  'Incline Bench Press':  img('Barbell_Incline_Bench_Press_-_Medium-Grip'),
  'Decline Bench Press':  img('Decline_Barbell_Bench_Press'),
  'Dumbbell Press':       img('Dumbbell_Bench_Press'),
  'Chest Fly':            img('Dumbbell_Flyes'),
  'Cable Fly':            img('Cable_Crossover'),
  'Chest Dip':            img('Dips_-_Chest_Version'),

  // BACK
  'Pull-Up':              img('Pullups'),
  'Chin-Up':              img('Chin-Up'),
  'Lat Pulldown':         img('Wide-Grip_Lat_Pulldown'),
  'Bent-Over Row':        img('Bent_Over_Barbell_Row'),
  'Dumbbell Row':         img('One-Arm_Dumbbell_Row'),
  'Seated Row':           img('Seated_Cable_Rows'),
  'Deadlift':             img('Barbell_Deadlift'),
  'Romanian Deadlift':    img('Romanian_Deadlift'),
  'Superman':             img('Alternate_Superman'),

  // SHOULDERS
  'Shoulder Press':       img('Standing_Military_Press'),
  'Dumbbell Shoulder Press': img('Seated_Dumbbell_Press'),
  'Arnold Press':         img('Arnold_Dumbbell_Press'),
  'Lateral Raise':        img('Side_Lateral_Raise'),
  'Front Raise':          img('Front_Dumbbell_Raise'),
  'Pike Push-Up':         img('Pushups'),
  'Shrugs':               img('Barbell_Shrugs'),
  'Reverse Fly':          img('Bent_Over_Two-Dumbbell_Row_With_Palms_In'),

  // BICEPS
  'Bicep Curl':           img('Dumbbell_Bicep_Curl'),
  'Hammer Curl':          img('Hammer_Curls'),
  'Barbell Curl':         img('Barbell_Curl'),

  // TRICEPS
  'Tricep Dip':           img('Bench_Dips'),
  'Tricep Pushdown':      img('Tricep_Pushdown'),
  'Skull Crusher':        img('EZ-Bar_Skullcrusher'),
  'Overhead Tricep Extension': img('Standing_Dumbbell_Triceps_Extension'),
  'Close-Grip Push-Up':   img('Pushups_-_Close_Triceps_Position'),

  // LEGS
  'Squat':                img('Bodyweight_Squat'),
  'Barbell Squat':        img('Barbell_Full_Squat'),
  'Goblet Squat':         img('Goblet_Squat'),
  'Jump Squat':           img('Bodyweight_Squat'),
  'Wall Sit':             img('Wall-Squat'),
  'Lunge':                img('Bodyweight_Walking_Lunge'),
  'Walking Lunge':        img('Bodyweight_Walking_Lunge'),
  'Reverse Lunge':        img('Reverse_Dumbbell_Lunge'),
  'Bulgarian Split Squat': img('Dumbbell_Lunges'),
  'Leg Press':            img('Leg_Press'),
  'Leg Extension':        img('Leg_Extensions'),
  'Leg Curl':             img('Lying_Leg_Curls'),
  'Calf Raise':           img('Standing_Calf_Raises'),
  'Glute Bridge':         img('Barbell_Glute_Bridge'),

  // CORE
  'Plank':                img('Plank'),
  'Crunches':             img('Crunches'),
  'Bicycle Crunch':       img('Air_Bike'),
  'Russian Twist':        img('Seated_Russian_Twist'),
  'Leg Raise':            img('Leg_Pull-In'),
  'Mountain Climber':     img('Mountain_Climbers'),

  // CARDIO
  'Burpee':               img('Burpees'),
  'Jumping Jack':         img('Jumping_Jacks'),
};

/* ============================================================
   2. EXERCISE DATABASE  —  SIMPLIFIED
   4 exercises × 3 sets per focus/type/level (keeps workouts ≤40 min).
   ============================================================ */

const EX_DB = {
  /* ======== PUSH (Chest + Shoulders + Triceps) ======== */
  push: {
    gym: {
      beginner: [
        { name: 'Bench Press',        sets: 3, reps: '10-12', rest: '90s', instructions: 'Lie flat on bench. Lower bar to mid-chest, press up powerfully.', tips: 'Keep wrists straight, shoulder blades pulled back.' },
        { name: 'Incline Bench Press', sets: 3, reps: '10-12', rest: '90s', instructions: 'Bench at 30-45°. Press bar from upper chest to lockout.', tips: 'Squeeze chest at top, don\'t lock elbows.' },
        { name: 'Shoulder Press',     sets: 3, reps: '10-12', rest: '75s', instructions: 'Press dumbbells from shoulder level to overhead.', tips: 'Don\'t arch lower back. Core tight.' },
        { name: 'Tricep Pushdown',    sets: 3, reps: '12-15', rest: '60s', instructions: 'Push rope down until arms fully extended.', tips: 'Elbows pinned to sides — only forearms move.' },
      ],
      intermediate: [
        { name: 'Bench Press',        sets: 3, reps: '8-10', rest: '90s', instructions: 'Compound press with controlled descent.', tips: 'Pause briefly at chest for extra strength.' },
        { name: 'Incline Bench Press', sets: 3, reps: '8-10', rest: '90s', instructions: 'Upper-chest builder at 30°.', tips: 'Explosive push, slow descent.' },
        { name: 'Decline Bench Press', sets: 3, reps: '8-10', rest: '90s', instructions: 'Decline bench press for lower chest.', tips: 'Great for chest mass.' },
        { name: 'Lateral Raise',      sets: 3, reps: '12-15', rest: '60s', instructions: 'Raise dumbbells to shoulder height at sides.', tips: 'Lead with elbows, not hands.' },
      ],
      advanced: [
        { name: 'Bench Press',        sets: 3, reps: '6-8',  rest: '120s', instructions: 'Heavy strength-building press.', tips: 'Warm up thoroughly.' },
        { name: 'Incline Bench Press', sets: 3, reps: '6-8', rest: '120s', instructions: 'Heavy upper-chest builder.', tips: 'Control eccentric, explosive concentric.' },
        { name: 'Decline Bench Press', sets: 3, reps: '8-10', rest: '90s', instructions: 'Heavy decline press.', tips: 'Deeper stretch than flat.' },
        { name: 'Arnold Press',       sets: 3, reps: '10-12', rest: '75s', instructions: 'Rotational shoulder press.', tips: 'Hits all three shoulder heads.' },
      ],
    },
    home: {
      beginner: [
        { name: 'Push-Up',         sets: 3, reps: '8-12', rest: '60s', instructions: 'Plank position. Lower chest to floor, push back up.', tips: 'Drop to knees if needed.' },
        { name: 'Incline Push-Up', sets: 3, reps: '10-15', rest: '60s', instructions: 'Hands on table or bed, body at incline.', tips: 'Easier variation for beginners.' },
        { name: 'Pike Push-Up',    sets: 3, reps: '6-10', rest: '75s', instructions: 'Form inverted V. Lower head toward floor.', tips: 'Targets shoulders.' },
        { name: 'Tricep Dip',      sets: 3, reps: '10-12', rest: '60s', instructions: 'Hands on chair behind you. Bend elbows.', tips: 'Elbows point back.' },
      ],
      intermediate: [
        { name: 'Push-Up',         sets: 3, reps: '15-20', rest: '60s', instructions: 'Strict full-range push-ups.', tips: 'Squeeze chest at top.' },
        { name: 'Diamond Push-Up', sets: 3, reps: '10-15', rest: '75s', instructions: 'Hands form diamond under chest.', tips: 'Intense tricep focus.' },
        { name: 'Decline Push-Up', sets: 3, reps: '12-15', rest: '75s', instructions: 'Feet elevated on chair.', tips: 'Upper chest + shoulder focus.' },
        { name: 'Pike Push-Up',    sets: 3, reps: '10-12', rest: '75s', instructions: 'Shoulder-focused inverted-V.', tips: 'Walk feet closer = harder.' },
      ],
      advanced: [
        { name: 'Push-Up',         sets: 3, reps: '20-30', rest: '60s', instructions: 'High-rep controlled push-ups.', tips: 'Focus on tempo.' },
        { name: 'Diamond Push-Up', sets: 3, reps: '12-15', rest: '75s', instructions: 'Heavy tricep emphasis.', tips: 'Go slow.' },
        { name: 'Decline Push-Up', sets: 3, reps: '12-15', rest: '75s', instructions: 'Elevated feet for upper chest.', tips: 'Try clap variation.' },
        { name: 'Pike Push-Up',    sets: 3, reps: '10-15', rest: '75s', instructions: 'Advanced shoulder builder.', tips: 'Work toward handstand push-ups.' },
      ],
    },
  },

  /* ======== PULL (Back + Biceps) ======== */
  pull: {
    gym: {
      beginner: [
        { name: 'Lat Pulldown',  sets: 3, reps: '10-12', rest: '75s', instructions: 'Pull bar down to upper chest, squeeze lats.', tips: 'Lean back slightly, chest up.' },
        { name: 'Seated Row',    sets: 3, reps: '10-12', rest: '75s', instructions: 'Pull handle to stomach, squeeze shoulder blades.', tips: 'Strict form — no momentum.' },
        { name: 'Dumbbell Row',  sets: 3, reps: '10-12', rest: '60s', instructions: 'One knee on bench, row dumbbell to hip.', tips: 'Pull with elbow, not hand.' },
        { name: 'Barbell Curl',  sets: 3, reps: '10-12', rest: '60s', instructions: 'Standing barbell curl.', tips: 'Elbows locked at sides.' },
      ],
      intermediate: [
        { name: 'Pull-Up',         sets: 3, reps: '6-10', rest: '90s', instructions: 'Hang from bar, pull chest to bar.', tips: 'Use assist band if needed.' },
        { name: 'Bent-Over Row',   sets: 3, reps: '8-10', rest: '90s', instructions: 'Hinge at hips, row barbell to stomach.', tips: 'Keep back flat, core tight.' },
        { name: 'Lat Pulldown',    sets: 3, reps: '10-12', rest: '75s', instructions: 'Wide grip, pull to upper chest.', tips: 'Feel the squeeze in lats.' },
        { name: 'Hammer Curl',     sets: 3, reps: '10-12', rest: '60s', instructions: 'Neutral grip curl.', tips: 'Thick-arm builder.' },
      ],
      advanced: [
        { name: 'Deadlift',      sets: 3, reps: '5-6',   rest: '150s', instructions: 'Heavy hip hinge. Bar travels straight up.', tips: 'Brace hard, neutral spine.' },
        { name: 'Pull-Up',       sets: 3, reps: '8-12',  rest: '90s', instructions: 'Weighted pull-ups.', tips: 'Add belt for extra load.' },
        { name: 'Bent-Over Row', sets: 3, reps: '6-8',   rest: '120s', instructions: 'Heavy barbell row.', tips: 'Drive elbows back.' },
        { name: 'Barbell Curl',  sets: 3, reps: '8-10',  rest: '60s', instructions: 'Heavy bicep curl.', tips: 'Controlled negative.' },
      ],
    },
    home: {
      beginner: [
        { name: 'Superman',        sets: 3, reps: '12-15', rest: '45s', instructions: 'Lie face down, lift arms and legs together.', tips: 'Hold 2 seconds at top.' },
        { name: 'Dumbbell Row',    sets: 3, reps: '10-12', rest: '60s', instructions: 'With backpack or heavy bag — row to hip.', tips: 'Squeeze back at top.' },
        { name: 'Bicep Curl',      sets: 3, reps: '12-15', rest: '60s', instructions: 'Curl any available weight.', tips: 'Full range of motion.' },
        { name: 'Reverse Fly',     sets: 3, reps: '12-15', rest: '60s', instructions: 'Bent over, raise arms out to sides.', tips: 'Rear delts focus.' },
      ],
      intermediate: [
        { name: 'Pull-Up',     sets: 3, reps: '5-8',   rest: '90s', instructions: 'Use doorframe pull-up bar.', tips: 'Band assist if needed.' },
        { name: 'Superman',    sets: 3, reps: '15-20', rest: '45s', instructions: 'Controlled superman reps.', tips: 'Slow and deliberate.' },
        { name: 'Dumbbell Row', sets: 3, reps: '12-15', rest: '60s', instructions: 'Heavier backpack row.', tips: 'Elbow leads the movement.' },
        { name: 'Bicep Curl',  sets: 3, reps: '12-15', rest: '60s', instructions: 'Weighted curls with any load.', tips: 'No momentum — strict.' },
      ],
      advanced: [
        { name: 'Pull-Up',     sets: 3, reps: '10-15', rest: '90s', instructions: 'High-volume pull-ups.', tips: 'Try wide/chin-up mix.' },
        { name: 'Chin-Up',     sets: 3, reps: '8-12',  rest: '90s', instructions: 'Palms facing you — bigger bicep hit.', tips: 'Full dead hang at bottom.' },
        { name: 'Superman',    sets: 3, reps: '20-25', rest: '45s', instructions: 'Explosive supermans.', tips: 'Hold peak.' },
        { name: 'Hammer Curl', sets: 3, reps: '15-20', rest: '60s', instructions: 'High-rep neutral-grip curls.', tips: 'Burn the forearms.' },
      ],
    },
  },

  /* ======== LEGS ======== */
  legs: {
    gym: {
      beginner: [
        { name: 'Barbell Squat',  sets: 3, reps: '10-12', rest: '120s', instructions: 'Bar on upper back. Squat to parallel, stand up.', tips: 'Chest up, knees track toes.' },
        { name: 'Leg Press',      sets: 3, reps: '12-15', rest: '90s',  instructions: 'Feet shoulder-width. Lower until knees at 90°.', tips: 'Don\'t lock knees at top.' },
        { name: 'Leg Curl',       sets: 3, reps: '12-15', rest: '60s',  instructions: 'Prone on machine. Curl heels toward butt.', tips: 'Focus on hamstring squeeze.' },
        { name: 'Calf Raise',     sets: 3, reps: '15-20', rest: '45s',  instructions: 'Rise onto toes, pause, lower.', tips: 'Full stretch at bottom.' },
      ],
      intermediate: [
        { name: 'Barbell Squat',    sets: 3, reps: '8-10',  rest: '120s', instructions: 'Heavier compound squat.', tips: 'Drive through heels.' },
        { name: 'Romanian Deadlift', sets: 3, reps: '10-12', rest: '90s', instructions: 'Hip hinge — feel hamstring stretch.', tips: 'Slight knee bend, flat back.' },
        { name: 'Leg Press',         sets: 3, reps: '10-12', rest: '90s', instructions: 'Heavy leg press.', tips: 'Don\'t round lower back.' },
        { name: 'Calf Raise',        sets: 3, reps: '15-20', rest: '45s', instructions: 'Weighted calf raise.', tips: 'Slow negative.' },
      ],
      advanced: [
        { name: 'Barbell Squat',    sets: 3, reps: '5-6',   rest: '150s', instructions: 'Heavy strength squats.', tips: 'Brace hard, protect spine.' },
        { name: 'Romanian Deadlift', sets: 3, reps: '6-8',   rest: '120s', instructions: 'Heavy RDL for posterior chain.', tips: 'Bar stays close to shins.' },
        { name: 'Bulgarian Split Squat', sets: 3, reps: '10 each', rest: '90s', instructions: 'Rear foot on bench. Single-leg squat.', tips: 'Front knee at 90°.' },
        { name: 'Calf Raise',       sets: 3, reps: '12-15', rest: '45s',  instructions: 'Heavy weighted calf raise.', tips: 'Full stretch, full contraction.' },
      ],
    },
    home: {
      beginner: [
        { name: 'Squat',      sets: 3, reps: '12-15', rest: '60s', instructions: 'Feet shoulder-width. Sit back, knees track toes.', tips: 'Keep chest up, heels planted.' },
        { name: 'Lunge',      sets: 3, reps: '10 each', rest: '60s', instructions: 'Step forward, lower back knee.', tips: 'Front knee at 90°.' },
        { name: 'Glute Bridge', sets: 3, reps: '15-20', rest: '45s', instructions: 'Lie on back, lift hips, squeeze glutes.', tips: 'Hold at top 2 sec.' },
        { name: 'Calf Raise', sets: 3, reps: '20-25', rest: '30s', instructions: 'Rise onto toes. Lower slowly.', tips: 'Use a step for range.' },
      ],
      intermediate: [
        { name: 'Jump Squat',    sets: 3, reps: '12-15', rest: '60s', instructions: 'Explosive squat — jump at top.', tips: 'Soft landings.' },
        { name: 'Walking Lunge', sets: 3, reps: '12 each', rest: '60s', instructions: 'Lunge forward alternating legs.', tips: 'Full ROM.' },
        { name: 'Glute Bridge',  sets: 3, reps: '20-25', rest: '45s', instructions: 'Single-leg is harder.', tips: 'Drive through heel.' },
        { name: 'Wall Sit',      sets: 3, reps: '45-60s', rest: '60s', instructions: 'Hold squat against wall.', tips: 'Thighs parallel.' },
      ],
      advanced: [
        { name: 'Jump Squat',    sets: 3, reps: '20-25', rest: '60s', instructions: 'High-rep plyometric squats.', tips: 'Maintain explosive power.' },
        { name: 'Bulgarian Split Squat', sets: 3, reps: '12 each', rest: '75s', instructions: 'Rear foot on chair.', tips: 'Brutal for quads.' },
        { name: 'Reverse Lunge', sets: 3, reps: '15 each', rest: '60s', instructions: 'Step back into lunge.', tips: 'Easier on knees.' },
        { name: 'Calf Raise',    sets: 3, reps: '25-30', rest: '30s', instructions: 'Single-leg calf raises.', tips: 'Pause at top.' },
      ],
    },
  },

  /* ======== CHEST (dedicated) ======== */
  chest: {
    gym: {
      beginner: [
        { name: 'Bench Press',        sets: 3, reps: '10-12', rest: '90s', instructions: 'Flat bench press.', tips: 'Bar to mid-chest.' },
        { name: 'Incline Bench Press', sets: 3, reps: '10-12', rest: '90s', instructions: 'Upper-chest at 30° incline.', tips: 'Don\'t flare elbows.' },
        { name: 'Decline Bench Press', sets: 3, reps: '10-12', rest: '90s', instructions: 'Lower-chest on decline.', tips: 'Full range, pause at bottom.' },
        { name: 'Chest Fly',          sets: 3, reps: '12-15', rest: '60s', instructions: 'Dumbbell fly, slight elbow bend.', tips: 'Feel the stretch.' },
      ],
      intermediate: [
        { name: 'Bench Press',        sets: 3, reps: '8-10', rest: '90s', instructions: 'Heavier flat bench.', tips: 'Pause 1 sec at chest.' },
        { name: 'Incline Bench Press', sets: 3, reps: '8-10', rest: '90s', instructions: 'Upper-chest builder.', tips: 'Explosive concentric.' },
        { name: 'Decline Bench Press', sets: 3, reps: '8-10', rest: '90s', instructions: 'Heavy decline.', tips: 'Great for chest mass.' },
        { name: 'Cable Fly',          sets: 3, reps: '12-15', rest: '60s', instructions: 'Constant-tension fly.', tips: 'Cross arms at bottom.' },
      ],
      advanced: [
        { name: 'Bench Press',        sets: 3, reps: '5-6',   rest: '120s', instructions: 'Heavy strength work.', tips: 'Warm up thoroughly.' },
        { name: 'Incline Bench Press', sets: 3, reps: '6-8',   rest: '120s', instructions: 'Heavy incline.', tips: 'Control descent.' },
        { name: 'Decline Bench Press', sets: 3, reps: '8-10',  rest: '90s', instructions: 'Max weight decline.', tips: 'Full range.' },
        { name: 'Chest Dip',          sets: 3, reps: '10-12',  rest: '75s', instructions: 'Lean forward for chest.', tips: 'Add weighted belt.' },
      ],
    },
    home: {
      beginner: [
        { name: 'Push-Up',         sets: 3, reps: '10-12', rest: '60s', instructions: 'Standard push-up.', tips: 'Full range, controlled.' },
        { name: 'Incline Push-Up', sets: 3, reps: '12-15', rest: '60s', instructions: 'Hands on elevated surface.', tips: 'Easier variation.' },
        { name: 'Wide Push-Up',    sets: 3, reps: '8-12',  rest: '60s', instructions: 'Hands wider than shoulders.', tips: 'Outer chest focus.' },
        { name: 'Decline Push-Up', sets: 3, reps: '8-12',  rest: '75s', instructions: 'Feet elevated on chair.', tips: 'Upper chest harder.' },
      ],
      intermediate: [
        { name: 'Push-Up',         sets: 3, reps: '15-20', rest: '60s', instructions: 'Strict push-ups.', tips: '2 sec down, 1 sec up.' },
        { name: 'Diamond Push-Up', sets: 3, reps: '10-15', rest: '75s', instructions: 'Diamond hand position.', tips: 'Chest + tricep combo.' },
        { name: 'Decline Push-Up', sets: 3, reps: '12-15', rest: '75s', instructions: 'Feet elevated.', tips: 'Upper chest focus.' },
        { name: 'Wide Push-Up',    sets: 3, reps: '12-15', rest: '60s', instructions: 'Wide-grip push-up.', tips: 'Outer chest burn.' },
      ],
      advanced: [
        { name: 'Push-Up',         sets: 3, reps: '25-30', rest: '60s', instructions: 'High-rep strict push-ups.', tips: 'Perfect form throughout.' },
        { name: 'Diamond Push-Up', sets: 3, reps: '15-20', rest: '75s', instructions: 'Diamond push-ups.', tips: 'Slow + controlled.' },
        { name: 'Decline Push-Up', sets: 3, reps: '15-20', rest: '75s', instructions: 'Decline clap variation.', tips: 'Explosive power.' },
        { name: 'Wide Push-Up',    sets: 3, reps: '20-25', rest: '60s', instructions: 'Wide-grip finisher.', tips: 'Full range.' },
      ],
    },
  },

  /* ======== BACK (dedicated) ======== */
  back: {
    gym: {
      beginner: [
        { name: 'Lat Pulldown',  sets: 3, reps: '10-12', rest: '75s', instructions: 'Pull bar to upper chest.', tips: 'Lean back slightly.' },
        { name: 'Seated Row',    sets: 3, reps: '10-12', rest: '75s', instructions: 'Pull to stomach, squeeze.', tips: 'Strict form.' },
        { name: 'Dumbbell Row',  sets: 3, reps: '10-12', rest: '60s', instructions: 'Single-arm row.', tips: 'Full stretch at bottom.' },
        { name: 'Superman',      sets: 3, reps: '15-20', rest: '45s', instructions: 'Lower-back strengthener.', tips: 'Hold peak 2 sec.' },
      ],
      intermediate: [
        { name: 'Pull-Up',       sets: 3, reps: '6-10',  rest: '90s', instructions: 'Strict pull-ups.', tips: 'Full hang between reps.' },
        { name: 'Bent-Over Row', sets: 3, reps: '8-10',  rest: '90s', instructions: 'Barbell row to stomach.', tips: 'Hinge at hips.' },
        { name: 'Lat Pulldown',  sets: 3, reps: '10-12', rest: '75s', instructions: 'Wide-grip lat focus.', tips: 'Feel the stretch.' },
        { name: 'Dumbbell Row',  sets: 3, reps: '10-12', rest: '60s', instructions: 'Heavy single-arm row.', tips: 'Pull with elbow.' },
      ],
      advanced: [
        { name: 'Deadlift',      sets: 3, reps: '5-6',   rest: '150s', instructions: 'Heavy conventional deadlift.', tips: 'Brace hard.' },
        { name: 'Pull-Up',       sets: 3, reps: '10-12', rest: '90s', instructions: 'Weighted pull-ups.', tips: 'Add weight belt.' },
        { name: 'Bent-Over Row', sets: 3, reps: '6-8',   rest: '120s', instructions: 'Heavy barbell row.', tips: 'Drive elbows back.' },
        { name: 'Chin-Up',       sets: 3, reps: '8-10',  rest: '90s', instructions: 'Underhand grip.', tips: 'Full range.' },
      ],
    },
    home: {
      beginner: [
        { name: 'Superman',     sets: 3, reps: '15-20', rest: '45s', instructions: 'Prone lift of arms + legs.', tips: 'Hold 2 sec.' },
        { name: 'Dumbbell Row', sets: 3, reps: '12-15', rest: '60s', instructions: 'With backpack or bag.', tips: 'Squeeze shoulder blade.' },
        { name: 'Reverse Fly',  sets: 3, reps: '12-15', rest: '60s', instructions: 'Bent over, arms out to sides.', tips: 'Rear delt focus.' },
        { name: 'Bicycle Crunch', sets: 3, reps: '20-30', rest: '45s', instructions: 'Alternating elbow to knee.', tips: 'Core + posterior chain.' },
      ],
      intermediate: [
        { name: 'Pull-Up',      sets: 3, reps: '5-8',   rest: '90s', instructions: 'Doorframe pull-ups.', tips: 'Band assist OK.' },
        { name: 'Superman',     sets: 3, reps: '20-25', rest: '45s', instructions: 'Controlled supermans.', tips: 'Slow and steady.' },
        { name: 'Dumbbell Row', sets: 3, reps: '12-15', rest: '60s', instructions: 'Heavier backpack row.', tips: 'Elbow leads.' },
        { name: 'Reverse Fly',  sets: 3, reps: '12-15', rest: '60s', instructions: 'Weighted reverse fly.', tips: 'Squeeze at top.' },
      ],
      advanced: [
        { name: 'Pull-Up',   sets: 3, reps: '10-15', rest: '90s', instructions: 'High-rep pull-ups.', tips: 'Mix grips.' },
        { name: 'Chin-Up',   sets: 3, reps: '8-12',  rest: '90s', instructions: 'Underhand grip.', tips: 'Bicep + back hit.' },
        { name: 'Superman',  sets: 3, reps: '25-30', rest: '45s', instructions: 'Explosive supermans.', tips: 'Hold peak.' },
        { name: 'Dumbbell Row', sets: 3, reps: '15-20', rest: '60s', instructions: 'Heavy high-rep rows.', tips: 'Form over weight.' },
      ],
    },
  },

  /* ======== SHOULDERS (dedicated) ======== */
  shoulders: {
    gym: {
      beginner: [
        { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10-12', rest: '75s', instructions: 'Seated dumbbell press.', tips: 'Neutral wrists, core tight.' },
        { name: 'Lateral Raise',          sets: 3, reps: '12-15', rest: '60s', instructions: 'Raise dumbbells to sides.', tips: 'Lead with elbows.' },
        { name: 'Front Raise',            sets: 3, reps: '12-15', rest: '60s', instructions: 'Raise dumbbells straight forward.', tips: 'No swinging.' },
        { name: 'Shrugs',                 sets: 3, reps: '12-15', rest: '45s', instructions: 'Shrug shoulders straight up.', tips: 'Pause at top.' },
      ],
      intermediate: [
        { name: 'Shoulder Press', sets: 3, reps: '8-10',  rest: '90s', instructions: 'Standing barbell press.', tips: 'Engage glutes and core.' },
        { name: 'Arnold Press',   sets: 3, reps: '10-12', rest: '75s', instructions: 'Rotational shoulder press.', tips: 'All three heads.' },
        { name: 'Lateral Raise',  sets: 3, reps: '12-15', rest: '60s', instructions: 'Strict laterals.', tips: 'Slight lean forward.' },
        { name: 'Reverse Fly',    sets: 3, reps: '12-15', rest: '60s', instructions: 'Rear delt fly.', tips: 'Slight elbow bend.' },
      ],
      advanced: [
        { name: 'Shoulder Press', sets: 3, reps: '6-8',   rest: '120s', instructions: 'Heavy overhead press.', tips: 'Full lockout.' },
        { name: 'Arnold Press',   sets: 3, reps: '8-10',  rest: '90s', instructions: 'Heavy Arnold press.', tips: 'Slow rotation.' },
        { name: 'Lateral Raise',  sets: 3, reps: '12-15', rest: '45s', instructions: 'Constant-tension laterals.', tips: 'Drop sets work.' },
        { name: 'Shrugs',         sets: 3, reps: '15-20', rest: '45s', instructions: 'Heavy barbell shrugs.', tips: 'Pause 2 sec at top.' },
      ],
    },
    home: {
      beginner: [
        { name: 'Pike Push-Up',   sets: 3, reps: '6-10', rest: '75s', instructions: 'Inverted-V push-up.', tips: 'Hips high, head to floor.' },
        { name: 'Lateral Raise',  sets: 3, reps: '12-15', rest: '60s', instructions: 'With bottles or weights.', tips: 'Lead with elbows.' },
        { name: 'Front Raise',    sets: 3, reps: '12-15', rest: '60s', instructions: 'Forward raise with weight.', tips: 'Controlled motion.' },
        { name: 'Reverse Fly',    sets: 3, reps: '12-15', rest: '60s', instructions: 'Bent over, arms out.', tips: 'Rear delts.' },
      ],
      intermediate: [
        { name: 'Pike Push-Up',   sets: 3, reps: '10-15', rest: '75s', instructions: 'Harder pike variation.', tips: 'Feet elevated for more.' },
        { name: 'Lateral Raise',  sets: 3, reps: '15-20', rest: '60s', instructions: 'High-rep laterals.', tips: 'Burn the shoulders.' },
        { name: 'Front Raise',    sets: 3, reps: '12-15', rest: '60s', instructions: 'Front raises.', tips: 'Alternating arms OK.' },
        { name: 'Reverse Fly',    sets: 3, reps: '12-15', rest: '60s', instructions: 'Rear delt work.', tips: 'Squeeze blades.' },
      ],
      advanced: [
        { name: 'Pike Push-Up',  sets: 3, reps: '15-20', rest: '75s', instructions: 'Elevated pike push-up.', tips: 'Toward handstand push-ups.' },
        { name: 'Lateral Raise', sets: 3, reps: '20-25', rest: '45s', instructions: 'High-rep burnout.', tips: 'Slow negatives.' },
        { name: 'Front Raise',   sets: 3, reps: '15-20', rest: '45s', instructions: 'High-rep fronts.', tips: 'No momentum.' },
        { name: 'Reverse Fly',   sets: 3, reps: '15-20', rest: '45s', instructions: 'Rear delt finisher.', tips: 'Top-of-rep hold.' },
      ],
    },
  },

  /* ======== ARMS (Biceps + Triceps) ======== */
  arms: {
    gym: {
      beginner: [
        { name: 'Barbell Curl',    sets: 3, reps: '10-12', rest: '60s', instructions: 'Standing barbell curl.', tips: 'Elbows pinned.' },
        { name: 'Tricep Pushdown', sets: 3, reps: '12-15', rest: '60s', instructions: 'Rope/bar pushdown.', tips: 'Lock elbows.' },
        { name: 'Hammer Curl',     sets: 3, reps: '12-15', rest: '60s', instructions: 'Neutral-grip curl.', tips: 'Brachialis builder.' },
        { name: 'Skull Crusher',   sets: 3, reps: '10-12', rest: '60s', instructions: 'Lying tricep extension.', tips: 'Elbows point up.' },
      ],
      intermediate: [
        { name: 'Barbell Curl',    sets: 3, reps: '8-10',  rest: '60s', instructions: 'Heavy barbell curl.', tips: 'No swinging.' },
        { name: 'Tricep Pushdown', sets: 3, reps: '10-12', rest: '60s', instructions: 'Heavy pushdowns.', tips: 'Full lockout.' },
        { name: 'Hammer Curl',     sets: 3, reps: '10-12', rest: '60s', instructions: 'Heavier hammers.', tips: 'Controlled.' },
        { name: 'Overhead Tricep Extension', sets: 3, reps: '10-12', rest: '60s', instructions: 'Overhead extension.', tips: 'Feel the stretch.' },
      ],
      advanced: [
        { name: 'Barbell Curl',    sets: 3, reps: '6-8',   rest: '75s', instructions: 'Heavy strength curls.', tips: 'Explosive positive.' },
        { name: 'Skull Crusher',   sets: 3, reps: '8-10',  rest: '60s', instructions: 'Heavy lying extension.', tips: 'Slow negative.' },
        { name: 'Hammer Curl',     sets: 3, reps: '10-12', rest: '60s', instructions: 'Heavy hammers.', tips: 'Full range.' },
        { name: 'Close-Grip Push-Up', sets: 3, reps: '12-15', rest: '60s', instructions: 'Tricep-focused push-up.', tips: 'Elbows tucked.' },
      ],
    },
    home: {
      beginner: [
        { name: 'Bicep Curl',   sets: 3, reps: '12-15', rest: '60s', instructions: 'With any weight.', tips: 'Strict form.' },
        { name: 'Tricep Dip',   sets: 3, reps: '10-12', rest: '60s', instructions: 'On chair behind you.', tips: 'Elbows back.' },
        { name: 'Hammer Curl',  sets: 3, reps: '12-15', rest: '60s', instructions: 'Neutral grip.', tips: 'Slow tempo.' },
        { name: 'Close-Grip Push-Up', sets: 3, reps: '8-12', rest: '60s', instructions: 'Hands close together.', tips: 'Tricep focus.' },
      ],
      intermediate: [
        { name: 'Bicep Curl',   sets: 3, reps: '15-20', rest: '60s', instructions: 'Higher-rep curls.', tips: 'Continuous tension.' },
        { name: 'Tricep Dip',   sets: 3, reps: '15-20', rest: '60s', instructions: 'Elevated feet for more.', tips: 'Full depth.' },
        { name: 'Diamond Push-Up', sets: 3, reps: '10-15', rest: '75s', instructions: 'Diamond hand shape.', tips: 'Pure tricep burn.' },
        { name: 'Hammer Curl',  sets: 3, reps: '15-20', rest: '60s', instructions: 'High-rep hammers.', tips: 'Forearm burn.' },
      ],
      advanced: [
        { name: 'Diamond Push-Up', sets: 3, reps: '15-20', rest: '75s', instructions: 'Heavy tricep work.', tips: 'Control descent.' },
        { name: 'Tricep Dip',      sets: 3, reps: '20-25', rest: '60s', instructions: 'Weighted dips with backpack.', tips: 'Full range.' },
        { name: 'Bicep Curl',      sets: 3, reps: '20-25', rest: '45s', instructions: 'High-rep curl finisher.', tips: 'No rest at top.' },
        { name: 'Close-Grip Push-Up', sets: 3, reps: '15-20', rest: '60s', instructions: 'Close-grip tricep work.', tips: 'Elbows tucked.' },
      ],
    },
  },

  /* ======== FULL BODY ======== */
  full_body: {
    gym: {
      beginner: [
        { name: 'Barbell Squat', sets: 3, reps: '10-12', rest: '90s', instructions: 'Fundamental leg builder.', tips: 'Full depth.' },
        { name: 'Bench Press',   sets: 3, reps: '10-12', rest: '90s', instructions: 'Compound chest press.', tips: 'Controlled descent.' },
        { name: 'Seated Row',    sets: 3, reps: '10-12', rest: '75s', instructions: 'Back builder.', tips: 'Squeeze shoulder blades.' },
        { name: 'Shoulder Press', sets: 3, reps: '10-12', rest: '75s', instructions: 'Overhead press.', tips: 'Tight core.' },
      ],
      intermediate: [
        { name: 'Barbell Squat', sets: 3, reps: '8-10', rest: '90s', instructions: 'Heavier squat.', tips: 'Brace hard.' },
        { name: 'Deadlift',      sets: 3, reps: '6-8',  rest: '120s', instructions: 'Hip hinge compound.', tips: 'Flat back.' },
        { name: 'Bench Press',   sets: 3, reps: '8-10', rest: '90s', instructions: 'Heavy bench.', tips: 'Pause at chest.' },
        { name: 'Pull-Up',       sets: 3, reps: '6-10', rest: '90s', instructions: 'Vertical pull.', tips: 'Full range.' },
      ],
      advanced: [
        { name: 'Barbell Squat', sets: 3, reps: '5-6',  rest: '150s', instructions: 'Heavy strength work.', tips: 'Full commitment.' },
        { name: 'Deadlift',      sets: 3, reps: '5-6',  rest: '150s', instructions: 'Maximum hip hinge.', tips: 'Neutral spine.' },
        { name: 'Bench Press',   sets: 3, reps: '5-6',  rest: '120s', instructions: 'Heavy press.', tips: 'Warm up well.' },
        { name: 'Pull-Up',       sets: 3, reps: '8-12', rest: '90s', instructions: 'Weighted pull-ups.', tips: 'Add belt weight.' },
      ],
    },
    home: {
      beginner: [
        { name: 'Push-Up',  sets: 3, reps: '8-12',  rest: '60s', instructions: 'Upper body base.', tips: 'Knees down if needed.' },
        { name: 'Squat',    sets: 3, reps: '15-20', rest: '60s', instructions: 'Lower body base.', tips: 'Heels planted.' },
        { name: 'Lunge',    sets: 3, reps: '10 each', rest: '60s', instructions: 'Single-leg strength.', tips: 'Full knee bend.' },
        { name: 'Plank',    sets: 3, reps: '30-45s', rest: '45s', instructions: 'Core stability hold.', tips: 'Straight line.' },
      ],
      intermediate: [
        { name: 'Push-Up',    sets: 3, reps: '15-20', rest: '60s', instructions: 'Strict push-ups.', tips: 'Tempo-based.' },
        { name: 'Jump Squat', sets: 3, reps: '12-15', rest: '60s', instructions: 'Explosive squat.', tips: 'Soft landings.' },
        { name: 'Lunge',      sets: 3, reps: '12 each', rest: '60s', instructions: 'Walking lunges.', tips: 'Full ROM.' },
        { name: 'Plank',      sets: 3, reps: '60s',   rest: '45s', instructions: 'Extended plank.', tips: 'Engage glutes.' },
      ],
      advanced: [
        { name: 'Push-Up',    sets: 3, reps: '25-30', rest: '60s', instructions: 'High-volume push-ups.', tips: 'Maintain form.' },
        { name: 'Jump Squat', sets: 3, reps: '20-25', rest: '60s', instructions: 'Explosive plyos.', tips: 'Explosive power.' },
        { name: 'Burpee',     sets: 3, reps: '10-15', rest: '75s', instructions: 'Full-body conditioning.', tips: 'Pace yourself.' },
        { name: 'Plank',      sets: 3, reps: '90s',   rest: '60s', instructions: 'Long plank holds.', tips: 'Perfect form.' },
      ],
    },
  },
};

/* ============================================================
   3. SCHEDULE TEMPLATES  —  FIXED: 6-day full_body rests SUNDAY
   Indexes: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
   ============================================================ */

const SPLIT_TEMPLATES = {
  full_body: {
    3: ['full_body','rest','full_body','rest','full_body','rest','rest'],
    4: ['full_body','rest','full_body','rest','full_body','full_body','rest'],
    5: ['full_body','full_body','rest','full_body','full_body','full_body','rest'],
    6: ['full_body','full_body','full_body','full_body','full_body','full_body','rest'], // FIX: Sunday rest, not Thursday
  },
  ppl: {
    3: ['push','pull','legs','rest','rest','rest','rest'],
    4: ['push','pull','legs','full_body','rest','rest','rest'],
    5: ['push','pull','legs','push','pull','rest','rest'],
    6: ['push','pull','legs','push','pull','legs','rest'],
  },
  bro: {
    3: ['chest','back','legs','rest','rest','rest','rest'],
    4: ['chest','back','legs','shoulders','rest','rest','rest'],
    5: ['chest','back','legs','shoulders','arms','rest','rest'],
    6: ['chest','back','legs','shoulders','arms','full_body','rest'],
  },
};

export function generateSchedule(daysPerWeek, splitType) {
  const map = SPLIT_TEMPLATES[splitType] || SPLIT_TEMPLATES.full_body;
  return map[daysPerWeek] || map[4];
}

export function exercisesFor(focus, type = 'gym', level = 'beginner', gender = 'male') {
  if (focus === 'rest') return [];
  const bucket = EX_DB[focus];
  if (!bucket) return [];
  const typeBucket = bucket[type] || bucket.home || bucket.gym;
  const baseList = typeBucket[level] || typeBucket.beginner || [];
  return applyGenderModifier(baseList, focus, type, level, gender);
}

/* ============================================================
   GENDER-BASED MODIFIER
   Female workouts emphasize:
     - Glutes / hips / hamstrings (Hip Thrust, Glute Bridge, Bulgarian SS)
     - Toning over hypertrophy (higher reps, shorter rest)
     - Less heavy chest pressing, more back/shoulder balance
   Male workouts emphasize:
     - Chest / back / arm hypertrophy
     - Moderate-heavy compound lifts
   This is not gospel — it's a pragmatic overlay users commonly prefer.
   ============================================================ */

function applyGenderModifier(list, focus, type, level, gender) {
  if (gender !== 'female') return list;
  // Clone to avoid mutating EX_DB
  const modified = list.map(ex => ({ ...ex }));

  // Universal female tweak: higher reps, slightly shorter rest (where > 60s)
  modified.forEach(ex => {
    // Bump rep ranges up by ~20% for toning focus
    ex.reps = bumpRepRange(ex.reps);
    // Reduce rest time for fat-burning / toning bias
    const r = parseInt(String(ex.rest).match(/\d+/)?.[0] || '60', 10);
    if (r >= 90) ex.rest = Math.max(60, r - 30) + 's';
  });

  // Focus-specific swaps for female-preferred routines
  if (focus === 'legs') {
    // Emphasize glute-hamstring over quads
    if (type === 'gym') {
      swapByName(modified, 'Leg Press', {
        name: 'Hip Thrust', sets: 3, reps: '12-15', rest: '75s',
        instructions: 'Bar across hips, drive hips up to lockout. Killer for glutes.',
        tips: 'Squeeze glutes hard at top. Chin tucked.',
      });
      swapByName(modified, 'Leg Extension', {
        name: 'Romanian Deadlift', sets: 3, reps: '12-15', rest: '75s',
        instructions: 'Hinge at hips — hamstring + glute focus.',
        tips: 'Slight knee bend, bar close to legs.',
      });
    } else {
      swapByName(modified, 'Wall Sit', {
        name: 'Hip Thrust (Bodyweight)', sets: 3, reps: '15-20', rest: '45s',
        instructions: 'Shoulders on couch, drive hips up.',
        tips: 'Squeeze glutes for 2 sec at top.',
      });
    }
  }

  if (focus === 'push' || focus === 'chest') {
    // Reduce heavy pressing, add shoulder/tricep finishers (toned upper body vs mass)
    if (type === 'gym') {
      swapByName(modified, 'Decline Bench Press', {
        name: 'Chest Fly', sets: 3, reps: '12-15', rest: '60s',
        instructions: 'Dumbbell fly with slight elbow bend.',
        tips: 'Feel the chest stretch — don\'t drop elbows too low.',
      });
    }
  }

  if (focus === 'arms') {
    // Prefer higher volume, lighter weight
    modified.forEach(ex => {
      if (parseInt(String(ex.reps).match(/\d+/)?.[0] || '10', 10) < 12) {
        ex.reps = '12-15';
      }
    });
  }

  if (focus === 'full_body') {
    // Add a glute-focused finisher by swapping Plank with Glute Bridge in home variant
    if (type === 'home') {
      swapByName(modified, 'Plank', {
        name: 'Glute Bridge', sets: 3, reps: '15-20', rest: '45s',
        instructions: 'Lie on back, drive hips up, squeeze glutes.',
        tips: 'Hold top position 2 sec.',
      });
    }
  }

  return modified;
}

function bumpRepRange(repsStr) {
  const s = String(repsStr || '').trim();
  // "8-10" → "10-15", "10-12" → "12-15", "12-15" → "15-20", "15-20" → "18-25"
  const m = s.match(/^(\d+)\s*-\s*(\d+)(.*)$/);
  if (m) {
    const lo = parseInt(m[1], 10);
    const hi = parseInt(m[2], 10);
    const suffix = m[3] || '';
    return `${Math.round(lo * 1.2)}-${Math.round(hi * 1.2)}${suffix}`;
  }
  // Single number like "10" → "12"
  const n = s.match(/^(\d+)(.*)$/);
  if (n) return Math.round(parseInt(n[1], 10) * 1.2) + (n[2] || '');
  return repsStr;
}

function swapByName(list, targetName, newEx) {
  const idx = list.findIndex(e => e.name === targetName);
  if (idx >= 0) list[idx] = newEx;
}

/* ============================================================
   4. WorkoutSession — simple data holder (no pose/camera dependency)
   ============================================================ */
export class WorkoutSession {
  constructor(exerciseKey, exerciseName, targetReps) {
    this.exerciseKey = exerciseKey;
    this.exerciseName = exerciseName;
    this.target = targetReps;
    this.startedAt = Date.now();
    this.isManual = true;
  }
}
