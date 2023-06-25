import React, { useState, useEffect } from 'react';
import { Text, Button, View, Alert, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
import { EpleyConversion, clearExerciseData, generateExerciseId } from './utils';

// This is designed to be a generic exercise screen
export function Exercise({name}) {
  const [setNum, setSetNums] = useState(0);
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);

  // State variable to store the reps input by the user
  const [saved, setSaved] = useState(null);
  
  const [toggleRounded, setToggleRounded] = useState(true);

  // Use the name of the exercise as the key for storing and retrieving the sets from storage
  const key = name + '-key';
  const buttonTitle = 'Clear ' + name + ' Exercise';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const value = await JSON.parse(getSavedSets(key));
        if (value !== null) {
          setSaved(JSON.parse(value));
        }
      } catch (error) {
        // Error retrieving data
        console.log("no data", error);
        // alert("Error retrieving data", error);
      }
    };
  
    fetchData();
  }, [saved]);
  
  // Handler function to save the full set to storage when the submit button is pressed
  const handleFullSetSubmit = () => {
    // Add warning alert with continue button if Alertreps is more than weight
    if (parseFloat(reps) > parseFloat(weight)) {
      alert(
        'Warning\nThe number of reps is greater than the weight.')
      return;
    }

    if (reps == '0' || weight == '0' || isNaN(reps) || isNaN(weight)) {
      alert("Warning\nPlease enter a value for reps and weight.")
      return;
    }

    
    const full = combineSets(setNum, reps, weight);
    
    // Save the full set to storage
    console.log("just after log" , full)

    saveSets(key, full);

    console.log("gets saved?")

    setSaved((prev) => {
      if (!prev) {
        return [full];
      } else {
        return [...prev, full];
      }
    });
    console.log("got saved", saved)
    
    setSetNums(0);
    setReps(0);
    setWeight(0);
  };

  function removeSet(id) {
    const filtered = saved.filter((item) => item.id !== id);
    console.log(filtered)
    setSaved(filtered);
    saveSets(key, filtered);
  }
  
  // function to display the full set
  const displayFullSet = (toggled) => {
    // check if there is a saved full set
    if (!saved || saved.length === 0) {
      return <Text>No saved sets</Text>;
    }
  
    console.log("display", saved);
    return (
      <View>
        {saved.map((item) => {
          return (
            <View key={item.id}>
              <Text>Sets: {item.sets} | reps: {item.reps} | weight: {item.weight} | Est. 1RM: {EpleyConversion(item.sets, item.reps, item.weight, toggled)}</Text>
              <Button title="Remove Set" onPress={() => {
                removeSet(item.id);
              }} />
            </View>
          );
        })}
      </View>
    );
  };

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>{name} Screen</Text>
        <Text>Input Sets Here</Text>

        {/* The text inputs and save buttons */}
        <TextInput placeholder={`sets as a number ${setNum}`} value={setNum} onChangeText={setSetNums} />

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
          clearExerciseData(key, setSaved);
        }  
        } />
        
      </View>
  );
}

async function getSavedSets(key) {
  const items = await AsyncStorage.getItem(key);
  console.log("retriving sets: ", items)
  return items;
}

async function saveSets(key, items) {
  console.log("save sets ", items)
  return await AsyncStorage.setItem(key, JSON.stringify(items));
}

function combineSets(setNum, reps, weight) {
  const combined = {
    id: generateExerciseId(),
    sets: setNum,
    reps: reps,
    weight: weight
  };
  console.log("combined " , combined);
  return combined;
}