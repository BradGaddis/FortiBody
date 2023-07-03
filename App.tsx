import React from 'react';
import { SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GeneralExercises } from './Exercise/GeneralExercises';
import { total_exercises_dict } from './Exercise/exercise_store';
import { Exercise } from './Exercise/Exercise';
import  Home  from './Home';
import Fasting from './Fasting';
import { ExerciseSettings } from './Exercise/Settings';

const Stack = createStackNavigator();
// options={{"headerShown": false}
export default function App() {
  return (
    <SafeAreaView style={{ 
      flex: 1,
      height: '100%',
      alignContent: 'center',
      
    }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Exercise List'>
          {/*populate each exercise screen */}
          <Stack.Screen name="Exercise List" component={Home}/>
          { generateExerciseScreens()}
          <Stack.Screen name="General Exercises" component={GeneralExercises} />
          {/* <Stack.Screen name="Powerlifting Exercises" component={PowerLiftingExercises} /> */}
          {/* <Stack.Screen name="Diet" component={Diet} /> */}
          <Stack.Screen name="Fasting" component={Fasting} /> 
          <Stack.Screen name="Exercise Settings" component={ExerciseSettings} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

export const generateExerciseScreens = () => {
  return total_exercises_dict.map((exercise : any) => (
    <Stack.Screen key={exercise.id} name={exercise.name}>
      {(props) => <Exercise name={exercise.name} navigation={props.navigation}/>}
    </Stack.Screen>
  ))

}