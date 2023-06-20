import React from 'react';
import { NavigationContainer,useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GeneralExercises } from './GeneralExercises';
import { total_exercises_dict } from './exercise_store';
import { Exercise } from './Exercise';
import  Home  from './Home';

const Stack = createStackNavigator();

export default function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Exercise List'>
          {/*populate each exercise screen */}
          <Stack.Screen name="Exercise List" component={Home} options={{"title": "Home"}}/>
          { generate_exercise_screens()}
          <Stack.Screen name="General Exercises" component={GeneralExercises} />
          {/* <Stack.Screen name="Powerlifting Exercises" component={PowerLiftingExercises} /> */}
          {/* <Stack.Screen name="Diet" component={Diet} /> */}
          {/* <Stack.Screen name="Fasting" component={Fasting} />  */}
        </Stack.Navigator>
    </NavigationContainer>
  );
}




export const generate_exercise_screens = () => {
  // return screens
  return total_exercises_dict.map((exercise : any) => (
    <Stack.Screen key={exercise.id} name={exercise.name}>
      {() => <Exercise name={exercise.name} />}
    </Stack.Screen>
  ))

}