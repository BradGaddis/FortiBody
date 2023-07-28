import { Text, View, Button, Animated } from 'react-native';
import { clearAllAsyncStorage } from '../Utils';
import { ScrollView } from 'react-native-gesture-handler';
import React from 'react';
import CustomButton from './CustomButton';
import styles from '../Styles';
import Header from './Header';
import { RadialPulsatingButton } from './CustomButton';
import Icon from 'react-native-vector-icons/FontAwesome';


function CheckLoginStatus(loggedin: boolean = false) {
  return loggedin; // TODO: Implement this
}



function Home({ navigation, route } : { navigation: any, route: any })  {
  const [ loggedin , setLoggedin ] = React.useState(false);

  // if (!loggedin) {
  //   return (
  //     <View style={styles.homeContainer}>
  //       <Header />
  //       <RadialPulsatingButton 
  //       title="Get Started" 
  //       pulseSpeed={{in: 1500, out: 1000}} 
  //       size={{min:1.25, max:1.5}}
  //        onPress={() => setLoggedin(true)}
  //        />
  //     </View>
  //   )
  // }

  return (
    <View style={[styles.container, {flexDirection: "column"}]}>
      <Header title={route.name} subtitle="Where the heart is"/>
      <ScrollView style={
        {
          // position: "absolute",
          flexWrap: "wrap",
          flexDirection: "row",
          height: "100%",
        }
      }>
        <View style={{
          flexDirection: "column",
        }}>
          {/* row containers view */}
          <View style={{
            flexDirection: "row",
          }}>
            {/* Stacked view */}
            <View style={{
              flexDirection: "column",
            }}>
              {/* Button for natigating to general purpose exercises */}
              <CustomButton title="Work Out" onPress={() => navigation.navigate("General Exercises")} />
              {/* <Button title="Powerlifting Exercises" onPress={() => navigation.navigate('Powerlifting Exercises')} /> */}
              <CustomButton title="Fasting Timer" onPress={() => navigation.navigate('Fasting')} />
              <CustomButton title="Track Nutrition" onPress={() => navigation.navigate('Nutrition')} />

            </View>
            {/* View floating to the right */}
            <View style={{
              flex: 1,
            }}>
            {/* Should float to the right of the stacked buttons */}
              <CustomButton style={{height: 100}} title={"Breathing Exercises"} onPress={() => navigation.navigate("Breathing")}/>
            </View>
          </View>
          <Text style={{ position: "relative", borderWidth:1, height: "100%"}}>Calorie tracking</Text>
          
        </View>

      </ScrollView>
      <Button title="Clear All Storage" onPress={() => clearAllAsyncStorage()} />
    </View>
  );  
}


export default Home;
