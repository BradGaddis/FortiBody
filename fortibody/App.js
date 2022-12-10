import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, Button ,  View, TouchableOpacity, Image,} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginScreen } from './login';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

const Stack = createStackNavigator();

export default function App() {
  return (

      <NavigationContainer>
      <Stack.Navigator initialRouteName='Exercise List'>
        <Stack.Screen name="Exercise List" component={ExerciseListScreen} />
        <Stack.Screen name="Bench Press" component={Exercise} />
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
      <Text>Choose an exercise to record:</Text>
      <View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Bench Press')}
        >
          <Image
            source={require('./basketball-placeholder.png')}
            style={{ width: 200, height: 200}}
            />
          <Text>Bench Press</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const GoBackButton = () => {
  const { goBack } = useNavigation();
  return (
    <TouchableOpacity onPress={() => goBack()}>
      <Text>Go back</Text>
    </TouchableOpacity>
  );
}

function isNumber(input) {
  return /^\d+$/.test(input);
  }

function Exercise(name = "Bench Press") {
  const navigation = useNavigation();
  const [sets, setSets] = useState(0);

  savedSets = getSets();

  function printSets() {
    for (let set in savedSets ){
     <Text>{set}</Text>
    }
  }
  
  function handleSubmit() {
    if (isNumber(sets)) {
      // Set the state only if the input is a number
        setSets(sets);
        savedSets = getSets()
        AsyncStorage.setItem(name + ' sets', savedSets.push(sets));
      }
    }

  async function getSets(sets) {
    // check first if the sets are already saved
    const savedSets = await AsyncStorage.getItem(name + 'sets');
    if (savedSets !== null) {
      AsyncStorage.setItem(name + ' sets', []);
    }
    return AsyncStorage.getItem(name + ' sets');
  }
  
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Bench Press Screen</Text>
      <Text>Input Sets Here</Text>
      <TextInput value={sets} onChangeText={setSets} />
      <Button title="Submit" onPress={handleSubmit} />
      <Text>{printSets()}</Text>
      <GoBackButton />
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
