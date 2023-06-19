import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GeneralExercises } from './GeneralExercises';
import Home from './Home';
import { useNavigation } from '@react-navigation/native';
import { clearAsyncStorage } from './utils';
import {  Text, View, ScrollView, Button } from 'react-native';
const Stack = createStackNavigator();


export default function App() {
  return (
      <NavigationContainer>
      <Stack.Navigator initialRouteName='Exercise List'>
        {/*populate each exercise screen */}
        <Stack.Screen name="Exercise List" component={Home} />
        {/* {generate_exercise_screens()} */}
         <Stack.Screen name="General Exercises" component={GeneralExercises} />
        {/* <Stack.Screen name="Powerlifting Exercises" component={PowerLiftingExercises} /> */}
        {/* <Stack.Screen name="Diet" component={Diet} /> */}
        {/* <Stack.Screen name="Fasting" component={Fasting} />  */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}


