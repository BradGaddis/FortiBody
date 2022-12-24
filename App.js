import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Button} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginScreen } from './login';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import 'react-native-gesture-handler';
import { total_exercises_dict } from './_exercises';
import { Exercise } from './Exercise';
import { ScrollView } from 'react-native-gesture-handler';


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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function ShowExercisesGeneral(exercises) {
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

function ExercisesHome() {
  return (
    <View style={styles.container}>
    <Text>Choose an exercise to record:</Text>
    <ScrollView>
    {ShowExercisesGeneral(total_exercises_dict)}
    <Button title="Clear All Storage" onPress={() => clearAsyncStorage()} />
    </ScrollView>
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
