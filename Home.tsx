import { Text, View, Button } from 'react-native';
import { clearAllAsyncStorage } from './Utils';
import { ScrollView } from 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet } from 'react-native';
import CustomButton from './Components/CustomButton';
import Icon from 'react-native-vector-icons/FontAwesome';
import Favicon from 'react-native-vector-icons/FontAwesome5';


const styles = StyleSheet.create({
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
        <CustomButton title="General Exercises" onPress={() => navigation.navigate("General Exercises")} />
        {/* <Button title="Powerlifting Exercises" onPress={() => navigation.navigate('Powerlifting Exercises')} /> */}
        <CustomButton title="Fasting Timer" onPress={() => navigation.navigate('Fasting')} />


      </ScrollView>
      <Button title="Clear All Storage" onPress={() => clearAllAsyncStorage()} />
    </View>
  );  
}


export default Home;
