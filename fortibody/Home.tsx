import { StyleSheet, Text, View, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { clearAllAsyncStorage } from './utils';
import { GeneralExercises } from './GeneralExercises';
import { ScrollView } from 'react-native-gesture-handler';


function Home() {
    const navigation = useNavigation();
    return (
      <View>
        <Text>Choose an exercise to record:</Text>
        <ScrollView>
          {/* Button for natigating to general purpose exercises */}
          <Button title="General Exercises" onPress={() => navigation.navigate('General Exercises')} />
          {/* {ShowExercisesGeneral(total_exercises_dict)} */}
      
          {/* <PowerLiftingExercises /> */}
          {/* <Button title="Powerlifting Exercises" onPress={() => navigation.navigate('Powerlifting Exercises')} /> */}
      
        </ScrollView>
        <Button style={{bottom: 0}} title="Clear All Storage" onPress={() => clearAllAsyncStorage()} />
      </View>
    );
  }

export default Home;
