import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image,} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginScreen } from './login';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import 'react-native-gesture-handler';
import { _exercises } from './_exercises';
import { Exercise } from './Exercise';


const Stack = createStackNavigator();



const generate_exercise_screens = () => {
  let screens = [];
  for (let i = 0; i < _exercises.length; i++) {
    screens.push(
      <Stack.Screen key={_exercises[i].name} name={_exercises[i].name}>
        {() => <Exercise name={_exercises[i].name} />}
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

function ShowExercises(exercises) {
  const navigation = useNavigation();
  let output = [];
  for (let i = 0; i < exercises.length; i++) {
    console.log(exercises[i].img)
    output.push(
      <TouchableOpacity
        key={exercises[i].name}
        onPress={() => navigation.navigate(exercises[i].name)}
      >
        <Image
          source={exercises[i].img }
          style={{ width: 200, height: 200}}
          />
        <Text>{exercises[i].name}</Text>
      </TouchableOpacity>
    );
  }
  return output;

}

function ExerciseListScreen() {
  return (
    <View style={styles.container}>
    <Text>Choose an exercise to record:</Text>
    {ShowExercises(_exercises)}
    {/* Clear all saved items */}
    
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
  exercisecard: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 
    'center' 
  }

});
