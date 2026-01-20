import { total_exercises_dict } from '@/services/exercise/exercise_store';

export interface Exercise {
  name: string;
  img: any;
  id: string;
  category: 'strength' | 'bodyweight' | 'cardio' | 'flexibility';
  equipment: string;
  muscleGroups: string[];
  instructions: string;
}

export interface ExerciseCategory {
  name: string;
  exercises: Exercise[];
}

export const getExercisesByCategory = (): ExerciseCategory[] => {
  const exercises = total_exercises_dict as Exercise[];

  return [
    {
      name: 'Strength',
      exercises: exercises.filter(ex => ex.category === 'strength'),
    },
    {
      name: 'Bodyweight',
      exercises: exercises.filter(ex => ex.category === 'bodyweight'),
    },
    {
      name: 'Cardio',
      exercises: exercises.filter(ex => ex.category === 'cardio'),
    },
    {
      name: 'Flexibility',
      exercises: exercises.filter(ex => ex.category === 'flexibility'),
    },
  ];
};

export const getExercisesByEquipment = (equipment: string): Exercise[] => {
  const exercises = total_exercises_dict as Exercise[];
  return exercises.filter(ex => ex.equipment === equipment);
};

export const searchExercises = (query: string): Exercise[] => {
  const exercises = total_exercises_dict as Exercise[];
  return exercises.filter(ex =>
    ex.name.toLowerCase().includes(query.toLowerCase())
  );
};
