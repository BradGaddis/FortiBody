import { generateExerciseId } from "./utils";

const placeholder_img = require('./assets/basketball-placeholder.png');
const ct_bench_press = require('./assets/benchpress.jpg');
const brian_squat = require('./assets/squat.jpg');
const eddie_deadlift = require('./assets/deadlift.jpg');

let pushup = ''
let bodyweight_squat = ''

const exercise_names = [
  "Bench Press",
  "Weighted Back Squat",
  "Deadlift",
  "Push Ups",
  "Body Weight Squat",
]

export const total_exercises_dict = [
  { name: exercise_names[0], img: ct_bench_press ? ct_bench_press : placeholder_img, id: generateExerciseId()},
  { name: exercise_names[1], img: brian_squat ? brian_squat : placeholder_img, id: generateExerciseId()},
  { name: exercise_names[2], img: eddie_deadlift ? eddie_deadlift : placeholder_img, id: generateExerciseId()},
  { name: exercise_names[3], img: pushup ? pushup : placeholder_img, id: generateExerciseId()},
  { name: exercise_names[4], img: bodyweight_squat ? bodyweight_squat : placeholder_img, id: generateExerciseId()},
];


export const powerlifting_exercises = [
  exercise_names[0],
  exercise_names[1],
  exercise_names[2],
]