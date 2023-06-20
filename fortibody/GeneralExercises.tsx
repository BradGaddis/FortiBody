import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { powerlifting_exercises, total_exercises_dict } from './exercise_store';

export function GeneralExercises({ navigation } : { navigation: any }) {
    return (
      <View>
        <Text>All Exercises Available</Text>
        <ScrollView>
            <ShowExercisesGeneral exercises={total_exercises_dict} navigation={navigation}/>
        </ScrollView>
      </View>
    );
  }

  type Exercise = {
    name: string;
    img: any;
    id: string;
  };
  
  type Props = {
    exercises: Exercise[];
  };
  
  function ShowExercisesGeneral(props: any) {
    const { exercises, navigation } = props;
    
    return exercises.map((exercise : any) => (
              <TouchableOpacity
                key={exercise.id}
                onPress={() => navigation.navigate(exercise.name)}
              >
                <Image
                  source={exercise.img}
                  style={{ width: 200, height: 200 }}
                />
                <Text>{exercise.name}</Text>
              </TouchableOpacity>
    ))
  }