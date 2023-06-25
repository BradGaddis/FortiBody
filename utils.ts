import AsyncStorage from '@react-native-async-storage/async-storage';

export async function clearAllAsyncStorage() {
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
  return exerciseId.toString();
}

// Clear all data for an exercise and reset the state variables
export async function clearExerciseData(key: string, state: any) {
  try {
    await AsyncStorage.removeItem(key);
    state(null);
  } catch (e) {
    console.error('Error clearing exercise data', e);
  }
}

export function EpleyConversion(set: string, rep : string, weight : string, toggleRounded : boolean = true) {
  let value = parseFloat(weight) * (1 + (parseFloat(rep) / 30));
  if (toggleRounded) {
    return Math.round(value/5)*5;
  } 
  else
  {
    return value;
  }
}
