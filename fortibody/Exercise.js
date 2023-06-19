import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Text, TextInput, Button, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
import { clearExerciseData, EpleyConversion } from './_clearExerciseData';


// move into function
async function removeSet(arr,id, key, resetSaved = null) {
  console.log(id)
  resetSaved("");
  await AsyncStorage.removeItem(key)
  // remove elements from array of ojects by id   

  const filtered = arr.filter(function(value, index, arr){
    return value.id !== id;
  });
  console.log(filtered)
  await AsyncStorage.setItem(key, JSON.stringify(filtered));
  resetSaved(filtered )
}



// This is designed to be a generic exercise screen
// and will save the sets to the phone's (or computer's) storage
export function Exercise(props) {
  const name = props.name;
  // State variable to store the sets input by the user
  const [sets, setSets] = useState('');
  // State variable to store the reps input by the user
  const [reps, setReps] = useState('');
  // State variable to store the weight input by the user
  const [weight, setWeight] = useState('');

  const [fullSet, setFullSet] = useState([]);

  // State variable to store the reps input by the user
  const [savedFullSet, setSavedFullSet] = useState([]);
  const [toggleRounded, setToggleRounded] = useState(false);

  // Use the name of the exercise as the key for storing and retrieving the sets from storage
  const fullSetKey = name + '-fullSet';


  const buttonTitle = 'Clear ' + name + ' Exercise';
  
  // list for clearning all saved items
  const clearable = [
    // save each setSaved function to clearable
    setSets, setReps, setWeight,
    // setSavedFullSet,
  ];

  const clearableSaved = [
    // save each setSaved function to clearable
    setSavedFullSet
    // setSavedFullSet,
  ];

  // Retrieve the sets from storage when the component mounts
  useEffect(() => {
    (async () => {
      const savedFullSetFromStorage = await AsyncStorage.getItem(fullSetKey);
      // If there are saved fullSets, set them in state
      if (savedFullSetFromStorage) {
        setSavedFullSet(JSON.parse(savedFullSetFromStorage));
      }

    })();
  }, [fullSet]);


  // Handler function to save the full set to storage when the submit button is pressed
  const handleFullSetSubmit = () => {
    if (reps === '' || weight === '' || sets === '') {
      alert('Error: please input values for reps, weight, and sets');
      return;
    }

    // Check if each input is a number
    if (isNaN(reps) || isNaN(weight) || isNaN(sets)) {
      Alert.alert('Error: please input numbers for reps, weight, and sets');
      return;
    }

    // Add warning alert with continue button if reps is more than weight
    if (reps > weight) {
      alert(
        'Warning\nThe number of reps is greater than the weight.')
      return;
    }

    let combined = {};
    let prevFullSet;
    // check if there is a saved full set
    if (!savedFullSet || !Object.keys(savedFullSet).length || !typeof savedFullSet === 'object' || !typeof savedFullSet === 'string' || !typeof savedFullSet === 'number') {
      // if there is no saved full set, create a new one
      combined = [{
        id: Date.now(),
        sets: sets,
        reps: reps,
        weight: weight,
      }];
    } else {
      // if there is a saved full set, parse it
      prevFullSet = JSON.parse(savedFullSet);
      combined = [...prevFullSet, {id: Date.now(), sets: sets, reps: reps, weight: weight}];
    }

    // set everything back to an empty string
    setSets('');
    setReps('');
    setWeight('');

    
    // combine the saved full set with the new values
    const fullSetString = JSON.stringify(combined);

    setFullSet(fullSetString);
    setSavedFullSet(fullSetString);
    AsyncStorage.setItem(fullSetKey, JSON.stringify(fullSetString));
  };

  // function to display the full set
  const displayFullSet = (toggled) => {
    // check if there is a saved full set
    if (!savedFullSet) {
      return;
    }

    let output = [];
    if (typeof (savedFullSet) === 'string') {
      
      // TODO 
      // check if the saved full set is empty
      let prevSetsRepsWeights = JSON.parse(savedFullSet);
      // loop through the sets, reps, and weights and display them
      for (let i = 0; i < prevSetsRepsWeights.length; i++) {
        output.push(
          <View key={prevSetsRepsWeights[i].id}>
            <Text>Set: {prevSetsRepsWeights[i].sets} | Reps: {prevSetsRepsWeights[i].reps} | Weight: {prevSetsRepsWeights[i].weight} |  Est. 1RM: {EpleyConversion(prevSetsRepsWeights[i].sets, prevSetsRepsWeights[i].reps, prevSetsRepsWeights[i].weight, toggled)}</Text>
            {/* <Button title="Remove Set" onPress={() => removeSet(prevSetsRepsWeights ,prevSetsRepsWeights[i].id, fullSetKey, setFullSet)} /> */} 
            
            </View>
        )
      }
    } else {
      return;
    }
    return (
      <View style={{flexDirection: "column"}}>
        {output}
      </View>
      );

  };

  

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <StatusBar style="auto" />
      <Text>{name} Screen</Text>
      <Text>Input Sets Here</Text>

      {/* The text inputs and save buttons */}

      <TextInput placeholder={`sets as a number ${sets}`} value={sets} onChangeText={setSets} />

      <TextInput placeholder={`reps as a number ${reps}`} value={reps} onChangeText={setReps} />

      <TextInput placeholder={`weight as a number ${weight}`}  value={weight} onChangeText={setWeight} />
      
      <Button title="Submit Weights" onPress={() => {
        handleFullSetSubmit();
      }} />

      {/* Displaying all of the information */}
      {/* Display 1RM */}
      <Button title="Toggle Rounded 1RM" onPress={() => {
        setToggleRounded(!toggleRounded);
      }} />
      <ScrollView>
        {displayFullSet(toggleRounded)}
      </ScrollView>
      <Button title={buttonTitle} onPress={() =>
      {  
        clearExerciseData(name, clearable, clearableSaved)
      }  
      } />
      

    </View>
  );
}
