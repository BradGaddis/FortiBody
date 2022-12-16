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

async function clearAsyncStorage(func = null) {
  try {
    await AsyncStorage.clear();
    if (func) {
      func();
    }
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
  const [savedSets, setSavedSets] = useState([]);
  // Use the name of the exercise as the key for storing and retrieving the sets from storage
  const setKey = name + '-sets';

  // Retrieve the sets from storage when the component mounts
  useEffect(() => {
    (async () => {
      const savedSetsFromStorage = await AsyncStorage.getItem(setKey);
      // If there are saved sets, set them in state
      if (savedSetsFromStorage) {
        setSavedSets(savedSetsFromStorage);
      }
    })();
  }, []);

  // Handler function to save the sets to storage when the submit button is pressed
  const handleSubmit = () => {
    // Convert the sets to a string before storing it
    const setsString = sets.toString();
    const curSets = Array.from(savedSets);
    curSets.push(sets);
    console.log(curSets)
    // Save the sets to storage
    AsyncStorage.setItem(setKey, setsString);
    setSavedSets(curSets);
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <StatusBar style="auto" />
      <Text>{name} Screen</Text>
      <Text>Input Sets Here</Text>
      <TextInput placeholder={`sets as a number ${sets}`} value={sets} onChangeText={setSets} />
      <Button title="Submit" onPress={() => handleSubmit()} />
      
      {/* Display the sets from storage TODO */}
      <Text>{`Previous sets: ${[...savedSets]}`}</Text>

      <Button title="Clear Storage" onPress={() => clearAsyncStorage(() => setSavedSets([]))} />
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
