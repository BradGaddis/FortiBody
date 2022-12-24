import placeholder_img from './assets/basketball-placeholder.png';
import ct_bench_press from './assets/benchpress.jpg';
import brian_squat from './assets/squat.jpg';
import eddie_deadlift from './assets/deadlift.jpg';


const exercise_names = [
  "Bench Press",
  "Weighted Back Squat",
  "Deadlift",
]

export const total_exercises_dict = [
  { name: exercise_names[0], img: ct_bench_press },
  { name: exercise_names[1], img: brian_squat },
  { name: exercise_names[2], img: eddie_deadlift },
];


export const powerlifting_exercises = [
  exercise_names[0],
  exercise_names[1],
  exercise_names[2],
]