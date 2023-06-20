import React, { useState, useEffect } from 'react';
import { Text, TextInput, Button, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
import { clearExerciseData, EpleyConversion, generateExerciseId } from './utils';

// This is designed to be a generic exercise screen
export function Exercise(props) {
  const { name } = props;
  const key = `${name}-key`;

  const [setNum, setSetNum] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [combined, setCombined] = useState([]);
  const [saved, setSaved] = useState(null);
  const [toggleRounded, setToggleRounded] = useState(true);
  
  const buttonTitle = 'Clear ' + name + ' Exercise';
  
  // Retrieve the sets from storage when the component mounts
  useEffect(() => {
    (async () => {
      const savedSets = await getFromStorage(key);
      if (savedSets) {
        setSaved(savedSets);
      }
    })()
  }, [saved]);

  // Handler function to save the full set to storage when the submit button is pressed
  async function handleSubmit() {
    if (reps === '' || weight === '' || setNum === '') {
      alert('Error: please input values for reps, weight, and sets');
      return;
    }

    // Check if each input is a number
    if (isNaN(reps) || isNaN(weight) || isNaN(setNum)) {
      Alert.alert('Error: Only input numbers for reps, weight, and sets');
      return;
    }

    // Add warning alert with continue button if reps is more than weight
    if (parseFloat(reps) > parseFloat(weight)) {
      console.log(typeof (reps), typeof (weight))
      alert(
        'Warning\nThe number of reps is greater than the weight.')
      return;
    }

    // combine everything into one full set
    const fullSet = combineSet(setNum, reps, weight)
    // set everything back to an empty string
    setSetNum('');
    setReps('');
    setWeight('');

    setSaved((prev) => {
        if (prev) {
          return [...prev, fullSet]
        } else {
          return [fullSet]
        }
      }
     )
    console.log("saved set" + saved)
    cd 
    await saveToStorage(key, combined)
    setCombined(fullSet);
  }

  // move into function
  async function removeSet(savedItems,id) {
    await AsyncStorage.removeItem(key)
    // remove elements from array of ojects by id   
    const filtered = savedItems.filter(item => item.id !== id);
    console.log(filtered)
    await AsyncStorage.setItem(key, JSON.stringify(filtered));
    setSaved(filtered);
  }

  
  function displaySets(toggled, savedItems) {
  
    // return if not array
    if (!Array.isArray(savedItems)) {
      return <Text>Nothing to see here</Text>;
    }
    return (
      <View>
        {
          savedItems.map((item) => (
            <View key={item.id}>
              <Text>Set: {item.sets} | Reps: {item.reps} | Weight: {item.weight} |  Est. 1RM: {EpleyConversion(item.sets, item.reps, item.weight, toggled)}</Text>
              <Button title="Remove Set" onPress={() => removeSet(savedItems, item.id)} />
            </View>
            ))
        }
      </View>
    )
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{name} Screen</Text>
      <Text>Input Sets Here</Text>
      <TextInput placeholder={`sets as a number ${setNum}`} value={setNum} onChangeText={setSetNum} />
      <TextInput placeholder={`reps as a number ${reps}`} value={reps} onChangeText={setReps} />
      <TextInput placeholder={`weight as a number ${weight}`}  value={weight} onChangeText={setWeight} />

      <Button title="Submit Weights" onPress={() => {
        handleSubmit();
      }} />

      {/* Displaying all of the information */}
      {/* Display 1RM */}
      <Button title="Toggle Rounded 1RM" onPress={() => {
          setToggleRounded(!toggleRounded);
        }} 
      />
      <ScrollView>
        {displaySets(toggleRounded, saved)}
      </ScrollView>
      <Button style={{bottom: 0}} title={buttonTitle} onPress={() =>
          {  
            clearExerciseData(name, key)
            setSaved(null);
            setCombined([]);
            setSetNum('');
            setReps('');
            setWeight('');
          }  
        }
       />
    </View>
  );
}

async function saveToStorage(key, obj =null) {
  if (obj === null) {
    alert('Error: nothing to save');
    return;
  }
  await AsyncStorage.setItem(key, JSON.stringify(obj));
}


async function getFromStorage(key) {
  const item = await AsyncStorage.getItem(key);
  const output = item ? JSON.parse(item) : null;
  return output;
}


function combineSet(setNum, reps, weight) {
  console.log(`combineSet ${setNum} ${reps} ${weight}`)
  return ({
    id: generateExerciseId(),
    sets: setNum,
    reps: reps,
    weight: weight,
  })
}
