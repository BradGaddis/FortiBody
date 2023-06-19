import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { styles } from './styles';
import { useNavigation } from '@react-navigation/native';
import { powerlifting_exercises, total_exercises_dict } from './_exercises';

// A screen for the powerlifting exercises

export function PowerLiftingExercises() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Powerlifting Exercises</Text>
    <ScrollView>
        <ShowPowerLiftExercises exercises={powerlifting_exercises} />
    </ScrollView>
    </View>
  );
}

function ShowPowerLiftExercises(props) {
    const exercises = props.exercises;
    const navigation = useNavigation();
    let output = [];
    for (let i = 0; i < exercises.length; i++) {
    const exercise = total_exercises_dict.find(e => e.name === exercises[i]);
    console.log(exercise)
      output.push(
        <TouchableOpacity
          key={exercise.name}
          onPress={() => navigation.navigate(exercise.name)}
        >
          <Image
            source={exercise.img }
            style={{ width: 200, height: 200}}
            />
          <Text>{exercise.name}</Text>
        </TouchableOpacity>
      );
    }
    return output;
  }