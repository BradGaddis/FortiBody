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
// This needs work. Perhaps I need to save and load the IDs or use some other library
export function generateExerciseId() {
  exerciseId += 1;
  return exerciseId.toString();
}

// Clear all data for an exercise and reset the state variables
export async function clearExerciseData(key: string, state: any = null) {
  try {
    await AsyncStorage.removeItem(key);
    if (state !== null) state(null);
    console.log('Exercise data cleared successfully');
  } catch (e) {
    console.error('Error clearing exercise data', e);
  }
}

export function EpleyConversion(rep : string, weight : string, toggleRounded : boolean = true) {
  let value = parseFloat(weight) * (1 + (parseFloat(rep) / 30));
  if (toggleRounded) {
    return Math.round(value/5)*5;
  } 
  else
  {
    return value;
  }
}

export async function DefaultClearDataOnFirstLoad () {
  // check if flag for data is set
  const check = await AsyncStorage.getItem('dataFlagA');
  // if not, clear all data
  if (check === null) {
    clearAllAsyncStorage();
    await AsyncStorage.setItem('dataFlagA', 'true');
  }
}