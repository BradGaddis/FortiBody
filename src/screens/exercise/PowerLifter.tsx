import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  powerlifting_exercises,
  total_exercises_dict,
} from '@/services/exercise/exercise_store';
import { styles } from '@/utils/Styles';

interface ShowPowerLiftExercisesProps {
  exercises: string[];
}

// A screen for powerlifting exercises
export const PowerLiftingExercises = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Powerlifting Exercises</Text>
      <ScrollView>
        <ShowPowerLiftExercises exercises={powerlifting_exercises} />
      </ScrollView>
    </View>
  );
};

const ShowPowerLiftExercises = ({ exercises }: ShowPowerLiftExercisesProps) => {
  const navigation = useNavigation();

  return exercises.map(exerciseName => {
    const exercise = total_exercises_dict.find(e => e.name === exerciseName);
    if (!exercise) return null;

    return (
      <TouchableOpacity
        key={exercise.name}
        onPress={() => navigation.navigate(exercise.name)}
      >
        <Image source={exercise.img} style={{ width: 200, height: 200 }} />
        <Text>{exercise.name}</Text>
      </TouchableOpacity>
    );
  });
};
