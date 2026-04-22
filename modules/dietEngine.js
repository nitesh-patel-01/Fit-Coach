// modules/dietEngine.js
// Smart diet engine:
//   - Computes BMR + TDEE + macro targets from the profile
//   - Returns an Indian meal plan tailored to goal (weight_loss / muscle_gain / general_fitness)
//   - Veg + Non-Veg variants
//   - Each meal has approximate calorie + protein info so totals add up cleanly

import { calculateBMR, calculateTDEE, calorieTarget, macroSplit } from './utils.js?v=3';

/* ============================================================
   FOOD DATABASE
   Each meal entry: { name, cal, protein }
   ============================================================ */

const FOODS = {
  veg: {
    weight_loss: {
      total: 1600,
      breakfast: [
        { name: 'Vegetable Poha (1 bowl)', cal: 250, protein: 6 },
        { name: 'Green Tea (1 cup)', cal: 5, protein: 0 },
        { name: 'Banana (1 medium)', cal: 90, protein: 1 },
        { name: 'Sprouts Chaat (1 bowl)', cal: 120, protein: 10 },
      ],
      lunch: [
        { name: '2 Multigrain Roti', cal: 200, protein: 7 },
        { name: 'Mixed Vegetable Sabzi (1 bowl)', cal: 150, protein: 5 },
        { name: 'Dal (1 bowl)', cal: 180, protein: 12 },
        { name: 'Low-fat Curd (1 bowl)', cal: 60, protein: 6 },
        { name: 'Cucumber Salad', cal: 30, protein: 1 },
      ],
      dinner: [
        { name: '1 Roti + Salad', cal: 150, protein: 5 },
        { name: 'Paneer Tikka (6 pieces)', cal: 220, protein: 18 },
        { name: 'Steamed Veggies', cal: 80, protein: 3 },
      ],
      snacks: [
        { name: 'Roasted Chana (1 fistful)', cal: 100, protein: 6 },
        { name: 'Apple (1 medium)', cal: 95, protein: 0 },
        { name: 'Buttermilk (1 glass)', cal: 60, protein: 3 },
        { name: 'Moong Dal Chilla (1)', cal: 120, protein: 9 },
      ],
    },
    muscle_gain: {
      total: 2800,
      breakfast: [
        { name: 'Moong Dal Chilla (3 pcs)', cal: 320, protein: 22 },
        { name: '2 Multigrain Toast + Peanut Butter', cal: 280, protein: 12 },
        { name: 'Glass of Milk + Almonds (10)', cal: 240, protein: 10 },
        { name: 'Banana (1 large)', cal: 120, protein: 2 },
      ],
      lunch: [
        { name: '3 Roti + 1 katori Rice', cal: 500, protein: 12 },
        { name: 'Paneer Butter Masala (1 bowl)', cal: 380, protein: 22 },
        { name: 'Dal Makhani (1 bowl)', cal: 220, protein: 14 },
        { name: 'Salad + Curd', cal: 100, protein: 5 },
      ],
      dinner: [
        { name: '2 Roti + Paneer Sabzi', cal: 450, protein: 22 },
        { name: 'Rajma / Chole (1 large bowl)', cal: 300, protein: 18 },
        { name: 'Soya Chunks Curry (1 bowl)', cal: 220, protein: 25 },
      ],
      snacks: [
        { name: 'Plant Protein Shake (Pea/Soy + Milk)', cal: 250, protein: 28 },
        { name: 'Peanut Butter Sandwich (2)', cal: 350, protein: 14 },
        { name: 'Greek Yogurt + Honey + Nuts', cal: 220, protein: 14 },
      ],
    },
    general_fitness: {
      total: 2200,
      breakfast: [
        { name: 'Paneer Paratha (2)', cal: 380, protein: 18 },
        { name: 'Curd (1 bowl)', cal: 80, protein: 6 },
        { name: 'Banana (1 medium)', cal: 90, protein: 1 },
      ],
      lunch: [
        { name: '2 Roti + 1 katori Rice', cal: 380, protein: 9 },
        { name: 'Mixed Vegetable Sabzi (1 bowl)', cal: 150, protein: 5 },
        { name: 'Dal Tadka (1 bowl)', cal: 180, protein: 12 },
        { name: 'Salad + Curd', cal: 100, protein: 5 },
      ],
      dinner: [
        { name: '2 Roti + Sabzi', cal: 320, protein: 9 },
        { name: 'Paneer Tikka (8 pieces)', cal: 300, protein: 24 },
      ],
      snacks: [
        { name: 'Sprouts Salad (1 bowl)', cal: 150, protein: 12 },
        { name: 'Apple + Almonds (10)', cal: 200, protein: 5 },
        { name: 'Buttermilk', cal: 60, protein: 3 },
        { name: 'Roasted Makhana (1 bowl)', cal: 120, protein: 4 },
      ],
    },
  },
  nonveg: {
    weight_loss: {
      total: 1700,
      breakfast: [
        { name: '3 Egg White Omelette + 1 Yolk', cal: 140, protein: 20 },
        { name: '1 Multigrain Toast', cal: 90, protein: 3 },
        { name: 'Black Coffee', cal: 5, protein: 0 },
        { name: 'Apple (1)', cal: 95, protein: 0 },
      ],
      lunch: [
        { name: '2 Roti + Salad', cal: 250, protein: 7 },
        { name: 'Grilled Chicken Breast (150g)', cal: 230, protein: 45 },
        { name: 'Steamed Veggies', cal: 80, protein: 3 },
      ],
      dinner: [
        { name: '1 Roti + Salad', cal: 150, protein: 5 },
        { name: 'Fish Curry (150g)', cal: 220, protein: 28 },
        { name: 'Cucumber Salad', cal: 30, protein: 1 },
      ],
      snacks: [
        { name: 'Boiled Eggs (2)', cal: 140, protein: 12 },
        { name: 'Green Tea', cal: 5, protein: 0 },
        { name: 'Buttermilk', cal: 60, protein: 3 },
      ],
    },
    muscle_gain: {
      total: 3000,
      breakfast: [
        { name: '4 Whole Eggs Omelette + Cheese', cal: 380, protein: 28 },
        { name: '2 Multigrain Toast + Butter', cal: 220, protein: 7 },
        { name: 'Glass of Milk + Banana', cal: 230, protein: 10 },
      ],
      lunch: [
        { name: '3 Roti + 1 bowl Rice', cal: 500, protein: 12 },
        { name: 'Chicken Curry (200g)', cal: 380, protein: 50 },
        { name: 'Dal (small bowl)', cal: 150, protein: 10 },
        { name: 'Salad + Curd', cal: 100, protein: 5 },
      ],
      dinner: [
        { name: '2 Roti + Mixed Dal (1 bowl)', cal: 380, protein: 18 },
        { name: 'Fish / Chicken (150g)', cal: 250, protein: 35 },
      ],
      snacks: [
        { name: 'Whey Protein Shake + Milk', cal: 280, protein: 35 },
        { name: 'Peanut Butter Sandwich (2)', cal: 350, protein: 14 },
        { name: '4 Boiled Eggs', cal: 280, protein: 24 },
      ],
    },
    general_fitness: {
      total: 2300,
      breakfast: [
        { name: 'Egg Bhurji (3 eggs)', cal: 220, protein: 18 },
        { name: '2 Multigrain Toast', cal: 180, protein: 6 },
        { name: 'Banana (1 medium)', cal: 90, protein: 1 },
      ],
      lunch: [
        { name: '2 Roti + 1 katori Rice', cal: 380, protein: 9 },
        { name: 'Chicken Curry (150g)', cal: 280, protein: 38 },
        { name: 'Salad + Curd', cal: 100, protein: 5 },
      ],
      dinner: [
        { name: '2 Roti + Sabzi', cal: 320, protein: 9 },
        { name: 'Grilled Chicken (200g)', cal: 320, protein: 50 },
      ],
      snacks: [
        { name: 'Boiled Eggs (2)', cal: 140, protein: 12 },
        { name: 'Apple + Almonds (8)', cal: 180, protein: 4 },
        { name: 'Tuna Sandwich', cal: 280, protein: 22 },
      ],
    },
  },
};

/* ============================================================
   PUBLIC API
   ============================================================ */

export function dietForProfile(profile) {
  const dietKey = profile.diet === 'veg' ? 'veg' : 'nonveg';
  const goalKey = profile.goal in FOODS[dietKey] ? profile.goal : 'general_fitness';
  return FOODS[dietKey][goalKey];
}

export function nutritionTargets(profile, activity = 'moderate') {
  if (!profile || !profile.weight) return null;
  const bmr = calculateBMR({
    weight: profile.weight,
    height: profile.height || 170,
    age: profile.age,
    gender: profile.gender,
  });
  const tdee = calculateTDEE(bmr, activity);
  const target = calorieTarget(tdee, profile.goal);
  const macros = macroSplit(target, profile.weight, profile.goal);
  return { bmr: Math.round(bmr), tdee, target, macros };
}

export function totalsForMeal(plan, mealKey) {
  const items = plan[mealKey] || [];
  const cal = items.reduce((s, x) => s + (x.cal || 0), 0);
  const protein = items.reduce((s, x) => s + (x.protein || 0), 0);
  return { cal, protein };
}
