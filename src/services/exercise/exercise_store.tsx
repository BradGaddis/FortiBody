import { generateExerciseId } from '../../utils/Utils';

const placeholder_img = require('../../assets/basketball-placeholder.png');
const ct_bench_press = require('../../assets/benchpress.jpg');
const brian_squat = require('../../assets/squat.jpg');
const deadlift_img = require('../../assets/benchpress.jpg');
const pushup_img = require('../../assets/benchpress.jpg');
const inclined_press_img = require('../../assets/benchpress.jpg');
const overhead_press_img = require('../../assets/benchpress.jpg');
const rows_img = require('../../assets/benchpress.jpg');
const pullups_img = require('../../assets/benchpress.jpg');
const dips_img = require('../../assets/benchpress.jpg');
const lunges_img = require('../../assets/benchpress.jpg');
const calf_raises_img = require('../../assets/benchpress.jpg');
const running_img = require('../../assets/benchpress.jpg');
const cycling_img = require('../../assets/benchpress.jpg');
const rowing_img = require('../../assets/benchpress.jpg');
const jump_rope_img = require('../../assets/benchpress.jpg');
const hiit_img = require('../../assets/benchpress.jpg');
const yoga_img = require('../../assets/benchpress.jpg');
const stretching_img = require('../../assets/benchpress.jpg');
const burpees_img = require('../../assets/benchpress.jpg');
const planks_img = require('../../assets/benchpress.jpg');
const mountain_climbers_img = require('../../assets/benchpress.jpg');

const exercise_names = [
  // Strength Exercises
  'Bench Press',
  'Incline Bench Press',
  'Weighted Back Squat',
  'Deadlift',
  'Overhead Press',
  'Bent Over Row',
  'Pull-ups',
  'Dips',
  'Lunges',
  'Calf Raises',
  // Bodyweight Exercises
  'Push Ups',
  'Body Weight Squat',
  'Burpees',
  'Planks',
  'Mountain Climbers',
  // Cardio Exercises
  'Running',
  'Cycling',
  'Rowing Machine',
  'Jump Rope',
  'HIIT',
  // Flexibility Exercises
  'Yoga',
  'Stretching',
];

export const total_exercises_dict = [
  {
    name: exercise_names[0],
    img: ct_bench_press,
    id: generateExerciseId(),
    category: 'strength',
    equipment: 'barbell',

    muscleGroups: ['chest', 'shoulders', 'triceps'],
    instructions:
      'Lie on bench, lower bar to chest, press upward until arms are extended.',
  },
  {
    name: exercise_names[1],
    img: inclined_press_img,
    id: generateExerciseId(),
    category: 'strength',
    equipment: 'barbell',

    muscleGroups: ['upper chest', 'shoulders', 'triceps'],
    instructions:
      'Similar to bench press but on an inclined bench (15-30 degrees) targeting upper chest.',
  },
  {
    name: exercise_names[2],
    img: brian_squat,
    id: generateExerciseId(),
    category: 'strength',
    equipment: 'barbell',

    muscleGroups: ['quadriceps', 'glutes', 'hamstrings', 'core'],
    instructions:
      'Stand with bar on shoulders, squat down until thighs are parallel to floor, return to standing.',
  },
  {
    name: exercise_names[3],
    img: deadlift_img,
    id: generateExerciseId(),
    category: 'strength',
    equipment: 'barbell',

    muscleGroups: ['back', 'glutes', 'hamstrings', 'core'],
    instructions:
      'Lift bar from floor to standing position, keeping back straight and driving through heels.',
  },
  {
    name: exercise_names[4],
    img: overhead_press_img,
    id: generateExerciseId(),
    category: 'strength',
    equipment: 'barbell',

    muscleGroups: ['shoulders', 'triceps', 'core'],
    instructions:
      'Press barbell overhead from shoulder height to full arm extension.',
  },
  {
    name: exercise_names[5],
    img: rows_img,
    id: generateExerciseId(),
    category: 'strength',
    equipment: 'barbell',

    muscleGroups: ['back', 'biceps', 'rear shoulders'],
    instructions:
      'Bend at waist, pull barbell toward lower chest, squeezing back muscles.',
  },
  {
    name: exercise_names[6],
    img: pullups_img,
    id: generateExerciseId(),
    category: 'strength',
    equipment: 'bodyweight',

    muscleGroups: ['back', 'biceps', 'forearms'],
    instructions:
      'Hang from bar, pull body up until chin clears the bar, lower with control.',
  },
  {
    name: exercise_names[7],
    img: dips_img,
    id: generateExerciseId(),
    category: 'strength',
    equipment: 'bodyweight',

    muscleGroups: ['chest', 'triceps', 'shoulders'],
    instructions:
      'Support body on parallel bars, lower down, push back up to arm extension.',
  },
  {
    name: exercise_names[8],
    img: lunges_img,
    id: generateExerciseId(),
    category: 'strength',
    equipment: 'bodyweight',

    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    instructions:
      'Step forward with one leg, lower until both knees are 90 degrees, return to start.',
  },
  {
    name: exercise_names[9],
    img: calf_raises_img,
    id: generateExerciseId(),
    category: 'strength',
    equipment: 'bodyweight',

    muscleGroups: ['calves'],
    instructions: 'Rise onto toes, hold briefly, lower back down with control.',
  },
  {
    name: exercise_names[10],
    img: pushup_img,
    id: generateExerciseId(),
    category: 'bodyweight',
    equipment: 'none',

    muscleGroups: ['chest', 'triceps', 'shoulders', 'core'],
    instructions:
      'Start in plank position, lower body to floor, push back up to arm extension.',
  },
  {
    name: exercise_names[11],
    img: brian_squat,
    id: generateExerciseId(),
    category: 'bodyweight',
    equipment: 'none',

    muscleGroups: ['quadriceps', 'glutes', 'hamstrings', 'core'],
    instructions:
      'Stand with feet shoulder-width, squat down until thighs are parallel, return to standing.',
  },
  {
    name: exercise_names[12],
    img: burpees_img,
    id: generateExerciseId(),
    category: 'bodyweight',
    equipment: 'none',

    muscleGroups: ['full body', 'core', 'cardio'],
    instructions:
      'From standing, drop to plank, perform push-up, jump feet to hands, jump up with arm raise.',
  },
  {
    name: exercise_names[13],
    img: planks_img,
    id: generateExerciseId(),
    category: 'bodyweight',
    equipment: 'none',

    muscleGroups: ['core', 'shoulders', 'back'],
    instructions:
      'Hold push-up position with straight body, engaging core muscles.',
  },
  {
    name: exercise_names[14],
    img: mountain_climbers_img,
    id: generateExerciseId(),
    category: 'bodyweight',
    equipment: 'none',

    muscleGroups: ['core', 'cardio', 'shoulders'],
    instructions:
      'In plank position, alternate bringing knees toward chest in running motion.',
  },
  {
    name: exercise_names[15],
    img: running_img,
    id: generateExerciseId(),
    category: 'cardio',
    equipment: 'none',

    muscleGroups: ['legs', 'core', 'cardio'],
    instructions:
      'Run at comfortable pace, focusing on good form and breathing.',
  },
  {
    name: exercise_names[16],
    img: cycling_img,
    id: generateExerciseId(),
    category: 'cardio',
    equipment: 'bike',

    muscleGroups: ['legs', 'cardio', 'glutes'],
    instructions:
      'Cycle at moderate to high intensity, maintaining proper bike fit and form.',
  },
  {
    name: exercise_names[17],
    img: rowing_img,
    id: generateExerciseId(),
    category: 'cardio',
    equipment: 'machine',

    muscleGroups: ['full body', 'cardio', 'back'],
    instructions:
      'Row with powerful leg drive and arm pull, maintaining steady rhythm.',
  },
  {
    name: exercise_names[18],
    img: jump_rope_img,
    id: generateExerciseId(),
    category: 'cardio',
    equipment: 'rope',

    muscleGroups: ['cardio', 'calves', 'shoulders'],
    instructions:
      'Jump over rope with both feet, maintaining rhythm and minimal impact.',
  },
  {
    name: exercise_names[19],
    img: hiit_img,
    id: generateExerciseId(),
    category: 'cardio',
    equipment: 'none',

    muscleGroups: ['full body', 'cardio'],
    instructions:
      'Alternate high-intensity exercises with brief rest periods for maximum calorie burn.',
  },
  {
    name: exercise_names[20],
    img: yoga_img,
    id: generateExerciseId(),
    category: 'flexibility',
    equipment: 'mat',

    muscleGroups: ['full body', 'flexibility', 'balance'],
    instructions:
      'Perform yoga poses focusing on breathing, flexibility, and mind-body connection.',
  },
  {
    name: exercise_names[21],
    img: stretching_img,
    id: generateExerciseId(),
    category: 'flexibility',
    equipment: 'none',

    muscleGroups: ['flexibility', 'recovery'],
    instructions:
      'Hold gentle stretches for 15-30 seconds, never to point of pain.',
  },
];

export const strength_exercises = [
  exercise_names[0], // Bench Press
  exercise_names[1], // Incline Bench Press
  exercise_names[2], // Weighted Back Squat
  exercise_names[3], // Deadlift
  exercise_names[4], // Overhead Press
  exercise_names[5], // Bent Over Row
];

export const powerlifting_exercises = [
  exercise_names[0], // Bench Press
  exercise_names[1], // Incline Bench Press
  exercise_names[2], // Weighted Back Squat
  exercise_names[3], // Deadlift
];

export const bodyweight_exercises = [
  exercise_names[10], // Push Ups
  exercise_names[11], // Body Weight Squat
  exercise_names[12], // Burpees
  exercise_names[13], // Planks
  exercise_names[14], // Mountain Climbers
];

export const cardio_exercises = [
  exercise_names[15], // Running
  exercise_names[16], // Cycling
  exercise_names[17], // Rowing Machine
  exercise_names[18], // Jump Rope
  exercise_names[19], // HIIT
];

export const flexibility_exercises = [
  exercise_names[20], // Yoga
  exercise_names[21], // Stretching
];
