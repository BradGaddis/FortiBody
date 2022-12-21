import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Text, TextInput, Button, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


async function clearAsyncStorage(functions = null, resetSaved = null) {
  try {
    functions.forEach((func) => {
      func('');
    });
    if (resetSaved != null) {
      resetSaved.forEach((func) => {
        func([]);
      });
    }
    await AsyncStorage.clear();
    console.log('AsyncStorage cleared successfully');
  } catch (e) {
    console.error('Error clearing AsyncStorage', e);
  }

}

async function clearExerciseData(exerciseName, functions = null, resetSaved = null) {
  try {
    const setKey = exerciseName + '-sets';
    const repsKey = exerciseName + '-reps';
    const weightKey = exerciseName + '-weight';
    const fullSetKey = exerciseName + '-fullSet';
    
    await AsyncStorage.removeItem(setKey);
    await AsyncStorage.removeItem(repsKey);
    await AsyncStorage.removeItem(weightKey);
    await AsyncStorage.removeItem(fullSetKey);
    if (functions != null) {
      functions.forEach((func) => {
        func('');
      });
    }
      if (resetSaved != null) {
        resetSaved.forEach((func) => {
          func([]);
        });
      }

    console.log(`Data for exercise ${exerciseName} cleared successfully`);
  } catch (e) {
    console.error(`Error clearing data for exercise ${exerciseName}`, e);
  }
}

// This is designed to be a generic exercise screen
// It will be passed the name of the exercise as a prop
// and will save the sets to the phone's (or computer's) storage
export function Exercise(props) {
  const name = props.name;
  // State variable to store the sets input by the user
  const [sets, setSets] = useState('');
  // State variable to store the reps input by the user
  const [reps, setReps] = useState('');
  // State variable to store the weight input by the user
  const [weight, setWeight] = useState('');
  const [fullSet, setFullSet] = useState(0);

  // State variable to store the reps input by the user
  const [savedSets, setSavedSets] = useState(0);
  const [savedReps, setSavedReps] = useState(0);
  const [savedWeights, setSavedWeights] = useState(0);
  const [savedFullSet, setSavedFullSet] = useState(0);


  // Use the name of the exercise as the key for storing and retrieving the sets from storage
  const setKey = name + '-sets';
  const repsKey = name + '-reps';
  const weightKey = name + '-weight';
  const fullSetKey = name + '-fullSet';

  // list for clearning all saved items
  const clearable = [
    // save each setSaved function to clearable
    setSets, setReps, setWeight,
    // setSavedFullSet,
  ];

  const clearableSaved = [
    // save each setSaved function to clearable
    setSavedSets, setSavedReps, setSavedWeights, setSavedFullSet
    // setSavedFullSet,
  ];

  // Retrieve the sets from storage when the component mounts
  useEffect(() => {
    (async () => {
      const savedSetsFromStorage = await AsyncStorage.getItem(setKey);
      const savedRepsFromStorage = await AsyncStorage.getItem(repsKey);
      const savedWeightsFromStorage = await AsyncStorage.getItem(weightKey);
      const savedFullSetFromStorage = await AsyncStorage.getItem(fullSetKey);

      // If there are saved sets, set them in state
      if (savedSetsFromStorage) {
        arr = JSON.parse(savedSetsFromStorage);
        setSavedSets(arr);
      }
      // If there are saved reps, set them in state
      if (savedRepsFromStorage) {
        arr = JSON.parse(savedRepsFromStorage);
        setSavedReps(arr);
      }
      // If there are saved weights, set them in state
      if (savedWeightsFromStorage) {
        arr = JSON.parse(savedWeightsFromStorage);
        setSavedWeights(arr);
      }
      // If there are saved fullSets, set them in state
      if (savedFullSetFromStorage) {
        arr = JSON.parse(savedFullSetFromStorage);
        setSavedFullSet(arr);
      }

    })();
  }, [sets, reps, weight, fullSet]);


  // Handler function to save the full set to storage when the submit button is pressed
  const handleFullSetSubmit = () => {
    if (reps === '' || weight === '' || sets === '') {
      alert('Error: please input values for reps, weight, and sets');
      return;
    }

    let combined = {};
    // check if there is a saved full set
    if (!savedFullSet || savedFullSet === '[]' || savedFullSet === 'null' || typeof(savedFullSet) === 'object') {
      // if there is no saved full set, create a new one
      combined = {
        sets: [sets],
        reps: [reps],
        weight: [weight],
      };
    } else {
      // if there is a saved full set, parse it
      let prevFullSet = JSON.parse(savedFullSet);
      combined = {
        sets: [prevFullSet.sets, sets],
        reps: [prevFullSet.reps, reps],
        weight: [prevFullSet.weight, weight],
      };
    }
    // combine the saved full set with the new values
    prevFullSet = savedFullSet;
    const fullSetString = JSON.stringify(combined);

    console.log(fullSetString);
    setFullSet(fullSetString);
    AsyncStorage.setItem(fullSetKey, JSON.stringify(fullSetString));
    setSavedFullSet(fullSetString);
    console.log(fullSetString);
    console.log(fullSet);
  };

  // function to display the full set
  const displayFullSet = () => {
    // check if there is a saved full set
    if (!savedFullSet || savedFullSet === '[]' || savedFullSet === 'null' || savedFullSet === 'undefined' || savedFullSet === 'NaN' || savedFullSet === '0') {
      return;
    }

    let output = [];
    if (typeof (savedFullSet) === 'string') {
      let prevSetsRepsWeights = JSON.parse(savedFullSet);
      // loop through the sets, reps, and weights and display them
      for (let i = 0; i < prevSetsRepsWeights.sets.length; i++) {
        let [s, r, w] = [parseFloat(prevSetsRepsWeights.sets[i]), parseFloat(prevSetsRepsWeights.reps[i]), parseFloat(prevSetsRepsWeights.weight[i])];
        output.push(
          <View key={i}>
            <Text key={"weights-" + i}>Set: {s} Reps: {r} Weight: {w} lbs</Text>
            <Text key={"1rm-" + i}>Estimated 1RM: {EpleyConversion(s, r, w).toFixed(2)}</Text>
          </View>
        );
      }
    } else {
      return;
    }
    return output;

  };


  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <StatusBar style="auto" />
      <Text>{name} Screen</Text>
      <Text>Input Sets Here</Text>

      {/* The text inputs and save buttons */}

      <TextInput placeholder={`sets as a number ${sets}`} value={sets} onChangeText={setSets} />

      <TextInput placeholder={`reps as a number ${reps}`} value={reps} onChangeText={setReps} />

      <TextInput placeholder={`weight as a number ${weight}`} value={weight} onChangeText={setWeight} />

      <Button title="Submit Weights" onPress={() => {
        console.log("SETS " + savedSets, "REPS " + savedReps, "WEIGHTS " + savedWeights);
        handleFullSetSubmit();
      }} />

      {/* Displaying all of the information */}
      {/* Display 1RM */}
      {displayFullSet()}

      <Button title="Clear Exercise Data" onPress={() => clearExerciseData(name, clearable, clearableSaved)} />
      
      <Button title="Clear All Storage" onPress={() => clearAsyncStorage(clearable, clearableSaved)} />

    </View>
  );
}
function EpleyConversion(set, rep, weight) {
  return parseFloat(weight * (1 + (rep / 30)));
}
