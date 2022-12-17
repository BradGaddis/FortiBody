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

    return screens
  }
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
          onPress={() => navigation.navigate('Bench Press')}
        >
          <Image
            source={require(placeholder_img)}
            style={{ width: 200, height: 200}}
            />
          <Text>Bench Press</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

async function clearAsyncStorage(functions = null) {
  try {
    await AsyncStorage.clear();
    functions.forEach((func) => {
      func([]);
    });
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
  const [sets, setSets] = useState('');
  // State variable to store the reps input by the user
  const [reps, setReps] = useState('');
  // State variable to store the weight input by the user
  const [weight, setWeight] = useState('');

  // State variable to store the reps input by the user
  const [savedSets, setSavedSets] = useState([]);
  const [savedReps, setSavedReps] = useState([]);
  const [savedWeights, setSavedWeights] = useState([]);
  // Use the name of the exercise as the key for storing and retrieving the sets from storage
  const setKey = name + '-sets';
  const repsKey = name + '-reps';
  const weightKey = name + '-weight';

  // list for clearning all saved items
  const clearable = [
    // save each setSaved function to clearable
    setSavedSets,
    setSavedReps,
    setSavedWeights,
  ]

  // Retrieve the sets from storage when the component mounts
  useEffect(() => {
    (async () => {
      const savedSetsFromStorage = await AsyncStorage.getItem(setKey);
      const savedRepsFromStorage = await AsyncStorage.getItem(repsKey);
      const savedWeightsFromStorage = await AsyncStorage.getItem(weightKey);
      // If there are saved sets, set them in state
      if (savedSetsFromStorage) {
        setSavedSets(savedSetsFromStorage);
      }
      // If there are saved reps, set them in state
      if (savedRepsFromStorage) {
        setSavedReps(savedRepsFromStorage);
      }
      // If there are saved weights, set them in state
      if (savedWeightsFromStorage) {
        setSavedWeights(savedWeightsFromStorage);
      }
    })();
  }, []);

  // Handler function to save the reps to storage when the submit button is pressed
  const handleRepSubmit = () => {
    if (sets === '' || weight === '') {
      alert('Error: please input values for reps and weight as well');
      return;
    }
    // Check if the reps are a number
    if (!isNaN(Number(reps))) {
      // Convert the reps to a string before storing it
      const repsString = reps.toString();
      // check if reps is empty
      if (reps === '') {
        alert('Error: reps cannot be empty');
        return;
      }
      const curReps = Array.from(savedReps);
      curReps.push(reps);
      // Save the reps to storage
      AsyncStorage.setItem(repsKey, repsString);
      setSavedReps(curReps)
    } else {
      // alert the user if the reps are not a number
      alert('Error: reps must be a number');
    }
  };

  // Handler function to save the weight to storage when the submit button is pressed
  const handleWeightSubmit = () => {
    if (reps === '' || sets === '') {
      alert('Error: please input values for reps and weight as well');
      return;
    }
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
      AsyncStorage.setItem(weightKey, weightString);
      setSavedWeights(curWeight)
    } else {
      // alert the user if the weight are not a number
      alert('Error: weight must be a number');
    }
  };

  // Handler function to save the sets to storage when the submit button is pressed
  const handleSetSubmit = () => {
    if (reps === '' || weight === '') {
      alert('Error: please input values for reps and weight as well');
      return;
    }
    // Check if the sets are a number
    if (!isNaN(Number(sets))) {
      // Convert the sets to a string before storing it
      const setsString = sets.toString();
      // check if sets is empty
      if (sets === '') {
        alert('Error: sets cannot be empty');
        return;
      }    
      const curSets = Array.from(savedSets);
      curSets.push(sets);
      // Save the sets to storage
      AsyncStorage.setItem(setKey, setsString);
      setSavedSets(curSets);
    } else {
      // alert the user if the sets are not a number
      alert('Error: sets must be a number');
    } 
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
        handleWeightSubmit();
        handleRepSubmit();
        handleSetSubmit();
        }} />

      {/* Displaying all of the information */}


      {/* Display the sets from storage*/}
      <Text>{savedSets > 0 ? `Saved Sets: ${savedSets}`  : ""}</Text>
      <Text>{savedReps > 0 ? `Saved Reps: ${savedReps}` : ""}</Text>
      <Text>{savedWeights > 0 ? `Saved Weight: ${savedWeights}` : ""}</Text>
     
      <Button title="Clear Storage" onPress={
        () => clearAsyncStorage(clearable)
        } />
    </View>
  );
}



export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
