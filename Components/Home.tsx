import { Text, View, Button, Animated } from 'react-native';
import { clearAllAsyncStorage } from '../Utils';
import { ScrollView } from 'react-native-gesture-handler';
import React from 'react';
import CustomButton from './CustomButton';
import styles from '../Styles';
import Header from './Header';
import { RadialPulsatingButton } from './CustomButton';
import { set } from 'react-native-reanimated';


function CheckLoginStatus(loggedin: boolean = false) {
  return loggedin; // TODO: Implement this
}



function Home({ navigation } : { navigation: any })  {
  const [ loggedin , setLoggedin ] = React.useState(false);

  if (!loggedin) {
    return (
      <View style={styles.homeContainer}>
        <Header />
        <RadialPulsatingButton title="Welcome" onPress={() => setLoggedin(true)}/>
      </View>
    )
  }

  return (
    <View style={styles.homeContainer}>
      <Header />
      <ScrollView>
        {/* Button for natigating to general purpose exercises */}
        <CustomButton title="Get Started Working out?" onPress={() => navigation.navigate("General Exercises")} />
        {/* <Button title="Powerlifting Exercises" onPress={() => navigation.navigate('Powerlifting Exercises')} /> */}
        <CustomButton title="Fasting Timer" onPress={() => navigation.navigate('Fasting')} />

        <CustomButton title="Track Nutrition" onPress={() => navigation.navigate('Nutrition')} />
        <Text style={{borderWidth:1}}>Calorie tracking</Text>

      </ScrollView>
      <Button title="Clear All Storage" onPress={() => clearAllAsyncStorage()} />
    </View>
  );  
}


export default Home;
