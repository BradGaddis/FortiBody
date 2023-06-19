import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { powerlifting_exercises, total_exercises_dict } from './exercise_store';

export function GeneralExercises() : any {
    return (
      <View>
        <Text>All Exercises Available</Text>
        <ScrollView>
            <ShowExercisesGeneral exercises={total_exercises_dict} />
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
  
  function ShowExercisesGeneral(props: Props) {
    const exercises = props.exercises;
    const navigation = useNavigation();

    return exercises.map((exercise) => (
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
    ));
  }