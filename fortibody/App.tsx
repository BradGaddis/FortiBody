import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GeneralExercises } from './GeneralExercises';
import Home from './Home';
import { useNavigation } from '@react-navigation/native';
import { clearAsyncStorage } from './utils';
import {  Text, View, ScrollView, Button } from 'react-native';
import { total_exercises_dict } from './exercise_store';
import { Exercise } from './Exercise';

const Stack = createStackNavigator();

export default function App() {
  return (
      <NavigationContainer>
      <Stack.Navigator initialRouteName='Exercise List'>
        {/*populate each exercise screen */}
        <Stack.Screen name="Exercise List" component={Home} />
        { generate_exercise_screens(Stack) }
         <Stack.Screen name="General Exercises" component={GeneralExercises} />
        {/* <Stack.Screen name="Powerlifting Exercises" component={PowerLiftingExercises} /> */}
        {/* <Stack.Screen name="Diet" component={Diet} /> */}
        {/* <Stack.Screen name="Fasting" component={Fasting} />  */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}


export const generate_exercise_screens = () => {
  let screens = [];
  for (let i = 0; i < total_exercises_dict.length; i++) {
    screens.push(
      <Stack.Screen key={total_exercises_dict[i].name} name={total_exercises_dict[i].name}>
        {() => <Exercise name={total_exercises_dict[i].name} />}
      </Stack.Screen>
    );

  }
  return screens
}