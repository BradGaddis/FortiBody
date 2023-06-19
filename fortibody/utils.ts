import AsyncStorage from '@react-native-async-storage/async-storage';

export async function clearAsyncStorage() {
    try {
      await AsyncStorage.clear();
      console.log('AsyncStorage cleared successfully');
    } catch (e) {
      console.error('Error clearing AsyncStorage', e);
    }
  }

let exerciseId = 0;

export function generateExerciseId() {
  exerciseId += 1;
  return exerciseId;
}

// Clear all data for an exercise and reset the state variables
export async function clearExerciseData(exerciseName : string, functions = null, resetSaved = null) {
  try {
    const fullSetKey = exerciseName + '-fullSet';
    
    await AsyncStorage.removeItem(fullSetKey);

    if (functions != null) {
      functions.forEach((func) => {
        func('');
      });
    }
      if (resetSaved != null) {
        resetSaved.forEach((func) => {
          func('');
        });
      }

    console.log(`Data for exercise ${exerciseName} cleared successfully`);
  } catch (e) {
    console.error(`Error clearing data for exercise ${exerciseName}`, e);
  }
}

export function EpleyConversion(set: object, rep : number, weight : number, toggleRounded : boolean = true) {
  if (toggleRounded) {
    let value = parseFloat(weight * (1 + (rep / 30)));
    return Math.round(value/5)*5;
  } 
  else
  {
    return parseFloat(weight * (1 + (rep / 30)).toFixed(2));
  }
}
