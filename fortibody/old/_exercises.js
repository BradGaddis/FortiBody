import placeholder_img from './assets/basketball-placeholder.png';
import ct_bench_press from './assets/benchpress.jpg';
import brian_squat from './assets/squat.jpg';
import eddie_deadlift from './assets/deadlift.jpg';

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
  { name: exercise_names[0], img: ct_bench_press ? ct_bench_press : placeholder_img},
  { name: exercise_names[1], img: brian_squat ? brian_squat : placeholder_img},
  { name: exercise_names[2], img: eddie_deadlift ? eddie_deadlift : placeholder_img},
  { name: exercise_names[3], img: pushup ? pushup : placeholder_img},
  { name: exercise_names[4], img: bodyweight_squat ? bodyweight_squat : placeholder_img},
];


export const powerlifting_exercises = [
  exercise_names[0],
  exercise_names[1],
  exercise_names[2],
]