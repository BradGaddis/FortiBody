import React from 'react';
import { Text, View, TouchableOpacity, Image, Button} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginScreen } from './login';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import 'react-native-gesture-handler';
import { total_exercises_dict, powerlifting_exercises } from './_exercises';
import { Exercise } from './Exercise';
import { ScrollView } from 'react-native-gesture-handler';
import { PowerLiftingExercises } from './PowerLifter';
import { GeneralExercises } from './GeneralExercises';
import { styles } from './styles';


const Stack = createStackNavigator();

async function clearAsyncStorage() {
  try {
    await AsyncStorage.clear();
    console.log('AsyncStorage cleared successfully');
  } catch (e) {
    console.error('Error clearing AsyncStorage', e);
  }
}


const generate_exercise_screens = () => {
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

export default function App() {
  return (
      <NavigationContainer>
      <Stack.Navigator initialRouteName='Exercise List'>
        {/*populate each exercise screen */}
        <Stack.Screen name="Exercise List" component={ExercisesHome} />
        {generate_exercise_screens()}
        <Stack.Screen name="General Exercises" component={GeneralExercises} />
        <Stack.Screen name="Powerlifting Exercises" component={PowerLiftingExercises} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}



function ExercisesHome() {
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
    <Text>Choose an exercise to record:</Text>
    <ScrollView>
    {/* Button for natigating to general purpose exercises */}
    <Button title="General Exercises" onPress={() => navigation.navigate('General Exercises')} />
    {/* {ShowExercisesGeneral(total_exercises_dict)} */}

    {/* <PowerLiftingExercises /> */}
    <Button title="Powerlifting Exercises" onPress={() => navigation.navigate('Powerlifting Exercises')} />

    <Button style={{}} title="Clear All Storage" onPress={() => clearAsyncStorage()} />
    </ScrollView>
    </View>
  );
}





