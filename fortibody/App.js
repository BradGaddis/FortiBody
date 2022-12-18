import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, Button ,  View, TouchableOpacity, Image,} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginScreen } from './login';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { array, string } from 'prop-types';

const Stack = createStackNavigator();

const placeholder_img = './basketball-placeholder.png';
const ct_bench_press = './assets/benchpress.jpg';


const _exerciseList = [
  "Bench Press",
  "Squat",
  "Deadlift",
]

const generate_exercise_screens = () => {
  let screens = [];
  for (let i = 0; i < _exerciseList.length; i++) {
    screens.push(
      <Stack.Screen key={_exerciseList[i]} name={_exerciseList[i]}>
        {() => <Exercise name={_exerciseList[i]} />}
      </Stack.Screen>
    );

  }
  return screens
}

export default function App() {
  return (
      <NavigationContainer>
      <Stack.Navigator initialRouteName='Exercise List'>
        {/*populate each exercise screen */}
        <Stack.Screen name="Exercise List" component={ExerciseListScreen} />
        {generate_exercise_screens()}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function ExerciseListScreen() {
  const navigation = useNavigation();
  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <StatusBar style="auto" />
      <Text>Choose an exercise to record:</Text>
      <View>
        <TouchableOpacity
          onPress={() => navigation.navigate(_exerciseList[0])}
        >
          <Image
            source={require(ct_bench_press)}
            style={{ width: 200, height: 200}}
            />
          <Text>{_exerciseList[0]}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate(_exerciseList[1])}
        >
          <Image
            source={require(placeholder_img)}
            style={{ width: 200, height: 200}}
            />
          <Text>{_exerciseList[1]}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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


// This is designed to be a generic exercise screen
// It will be passed the name of the exercise as a prop
// and will save the sets to the phone's (or computer's) storage
function Exercise(props) {
  const name = props.name;
  // State variable to store the sets input by the user
  const [sets, setSets] = useState(0);
  // State variable to store the reps input by the user
  const [reps, setReps] = useState(0);
  // State variable to store the weight input by the user
  const [weight, setWeight] = useState(0);
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
  ]

  const clearableSaved = [
    // save each setSaved function to clearable
    setSavedSets, setSavedReps, setSavedWeights, setSavedFullSet
    // setSavedFullSet,
  ]

  // Retrieve the sets from storage when the component mounts
  useEffect(() => {
    (async () => {
      const savedSetsFromStorage = await AsyncStorage.getItem(setKey);
      const savedRepsFromStorage = await AsyncStorage.getItem(repsKey);
      const savedWeightsFromStorage = await AsyncStorage.getItem(weightKey);
      const savedFullSetFromStorage = await AsyncStorage.getItem(fullSetKey);
      
      // If there are saved sets, set them in state
      if (savedSetsFromStorage) {
        arr = JSON.parse(savedSetsFromStorage)
        setSavedSets(arr);
      } 
      // If there are saved reps, set them in state
      if (savedRepsFromStorage) {
        arr = JSON.parse(savedRepsFromStorage)
        setSavedReps(arr);
      } 
      // If there are saved weights, set them in state
      if (savedWeightsFromStorage) {
        arr = JSON.parse(savedWeightsFromStorage)
        setSavedWeights(arr);
      } 
      // If there are saved fullSets, set them in state
      if (savedFullSetFromStorage) {
        arr = JSON.parse(savedFullSetFromStorage)
        setSavedFullSet(arr);
      }

    })();
  }, [sets, reps, weight, fullSet]);


  console.log("sets " + savedSets, "reps " +  savedReps, "weight "+ savedWeights, "fullSet " + savedFullSet);
  // Handler function to save the reps to storage when the su bmit button is pressed
  const handleRepSubmit = () => {
    // Check if the reps are a number
    if (!isNaN(Number(reps))) {
      // Convert the reps to a string before storing it
      const repsString = reps.toString();
      // check if reps is empty
      if (reps === '') {
        alert('Error: reps cannot be empty');
        return;
      }
      setReps(repsString)
      const curReps = Array.from(savedReps);
      curReps.push(reps);
      // Save the reps to storage
      AsyncStorage.setItem(repsKey, JSON.stringify(curReps));
      setSavedReps(curReps)
    } else {
      // alert the user if the reps are not a number
      alert('Error: reps must be a number');
    }
  };

  // Handler function to save the weight to storage when the submit button is pressed
  const handleWeightSubmit = () => {
    // Check if the weight are a number
    if (!isNaN(Number(weight))) {
      // Convert the weight to a string before storing it
      const weightString = weight.toString();
      // check if weight is empty
      if (weight === '') {
        alert('Error: weight cannot be empty');
        return;
      }
      const curWeight = Array.from(savedWeights);
      curWeight.push(weight);

      // Save the weight to storage
      AsyncStorage.setItem(weightKey, JSON.stringify(curWeight));
      setSavedWeights(curWeight)
    } else {
      // alert the user if the weight are not a number
      alert('Error: weight must be a number');
    }
  };

  // Handler function to save the sets to storage when the submit button is pressed
  const handleSetSubmit = () => {
    // Check if the sets are a number
    if (!isNaN(Number(sets))) {
      // Convert the sets to a string before storing it
      const setsString = sets.toString();
      // check if sets is empty
      if (sets === '') {
        alert('Error: sets cannot be empty');
        return;
      }    
      setSets(setsString)
      const curSets = Array.from(savedSets);
      curSets.push(setsString);
      // Save the sets to storage
      AsyncStorage.setItem(setKey, JSON.stringify(curSets));
      setSavedSets(curSets);
    } else {
      // alert the user if the sets are not a number
      alert('Error: sets must be a number');
    } 
  };
  // let fullSet = { sets: savedSets, reps: savedReps, weight: savedWeights };
  // Handler function to save the full set to storage when the submit button is pressed
  const handleFullSetSubmit = () => {
    if (reps === '' || weight === '' || sets === '') {
      alert('Error: please input values for reps, weight, and sets');
      return;
    }
    handleSetSubmit();
    handleRepSubmit();
    handleWeightSubmit();


    const combined = {
      sets: [...(savedSets ?? []), sets],
      reps: [...(savedReps ?? []), reps],
      weight: [...(savedWeights ?? []), weight],
    };

    prevFullSet = savedFullSet;
    const fullSetString = JSON.stringify(combined);
    
    console.log(fullSetString)
    setFullSet(fullSetString);
    AsyncStorage.setItem(fullSetKey, JSON.stringify(fullSetString));
    setSavedFullSet(fullSetString);
    console.log(fullSetString)
    console.log(fullSet)
  }

  // function to display the full set
  const displayFullSet = () => {
    let output = []
      if (typeof(savedFullSet) === 'string') {
        let prevSetsRepsWeights = JSON.parse(savedFullSet)
        // loop through the sets, reps, and weights and display them
        for (let i = 0; i < prevSetsRepsWeights.sets.length; i++) {
          let [s, r, w] = [parseFloat(prevSetsRepsWeights.sets[i]), parseFloat(prevSetsRepsWeights.reps[i]), parseFloat(prevSetsRepsWeights.weight[i])]
          output.push (
            <View key={i}>
            <Text key={"weights-"+i}>Set: {s} Reps: {r} Weight: {w} lbs</Text>
            <Text key={"1rm-"+i}>Estimated 1RM: {EpleyConversion(s,r,w).toFixed(2)}</Text>
            </View>
          );
        }
      } else {
        return;
      }
      return output;


      // try {
      //   let temp = JSON.parse(savedFullSet).sets
      //   console.log(`type of savedFullSet ${typeof( temp)} and savedFullSet ${temp}`)
      //   console.log(`savedFullSet ${temp}`)
      // } 
      // catch (e) {
      //   console.log(e)
      // }
  }


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
        console.log("SETS " + savedSets, "REPS " +  savedReps, "WEIGHTS "+ savedWeights)
        handleFullSetSubmit();
        }} />

      {/* Displaying all of the information */}
      {displayFullSet()}
      {/* Display 1RM */}
      
        
      {/* Clear all saved items */}
      <Button title="Clear Storage" onPress={
        () => clearAsyncStorage(clearable, clearableSaved)
        } />
    </View>
  );
}

function EpleyConversion(set, rep, weight) {
  return parseFloat(weight * (1 + (rep / 30)));
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
