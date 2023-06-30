import { Text, View, Button } from 'react-native';
import { clearAllAsyncStorage } from './utils';
import { ScrollView } from 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet } from 'react-native';


const HOME_STYLE = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
})

function Home({ navigation } : { navigation: any })  {
 
  return (
    <View>
      <Text>Choose an exercise group:</Text>  
      <ScrollView>
        {/* Button for natigating to general purpose exercises */}
        <Button title="General Exercises" onPress={() => navigation.navigate("General Exercises")} />
        {/* {ShowExercisesGeneral(total_exercises_dict)} */}
    
        {/* <PowerLiftingExercises /> */}
        {/* <Button title="Powerlifting Exercises" onPress={() => navigation.navigate('Powerlifting Exercises')} /> */}
        <Button title="Fasting" onPress={() => navigation.navigate('Fasting')} />


      </ScrollView>
      <Button title="Clear All Storage" onPress={() => clearAllAsyncStorage()} />
    </View>
  );
}

export default Home;
