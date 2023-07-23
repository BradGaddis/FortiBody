import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


export function testError(reps, weight, setReps, setWeight) {
    const reset = () => {
      setReps(0);
      setWeight(0);
    }
    let test = false
    if (parseFloat(reps) > parseFloat(weight)) {
      alert(
        'Warning\nThe number of reps is greater than the weight.')
        test = true;
    }
  
    if (reps == '0' || weight == '0' || isNaN(reps) || isNaN(weight)) {
    {
      Alert.alert(
        'Warning \n Please enter a value for reps and weight.'
      )
      test = true;
    }
    if (test) {
      reset();
    }
      return test;
    }
  }

  function clearSets(key) {
}




export async function getSavedSets(key) {
  const items = await AsyncStorage.getItem(key);
  console.log("unparsed ", items)
  // console.log("retriving sets: ", items)
  return items;
}

export async function getSavedSessions(key) {
  const items = await AsyncStorage.getItem(key);
  return items;
}

export async function saveSets(key, items) {
  // console.log("saving sets ", items)
  return await AsyncStorage.setItem(key, JSON.stringify(items), () => {console.log(items, " saved")});
}

export async function saveSessions(key, items) {
  // console.log("saving sets ", items)
  return await AsyncStorage.setItem(key, JSON.stringify(items));
}

export function combineSets( reps, weight) {
  const combined = {
    reps: reps,
    weight: weight
  };
  return combined;
}