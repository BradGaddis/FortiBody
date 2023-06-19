import { StyleSheet, Text, View, ScrollView, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { clearAsyncStorage } from './utils';
import { GeneralExercises } from './GeneralExercises';

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
      
          <Button title="Clear All Storage" onPress={() => clearAsyncStorage()} />
        </ScrollView>
      </View>
    );
  }

export default Home;