import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { styles } from './styles';
import { useNavigation } from '@react-navigation/native';
import { powerlifting_exercises, total_exercises_dict } from './_exercises';

export function GeneralExercises() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>All Exercises Available</Text>
        <ScrollView>
            <ShowExercisesGeneral exercises={total_exercises_dict} />
        </ScrollView>
      </View>
    );
  }

 function ShowExercisesGeneral(prop) {
    const exercises = prop.exercises;
    const navigation = useNavigation();
    let output = [];
    for (let i = 0; i < exercises.length; i++) {
      console.log(exercises[i].img)
      output.push(
        <TouchableOpacity
          key={exercises[i].name}
          onPress={() => navigation.navigate(exercises[i].name)}
        >
          <Image
            source={exercises[i].img }
            style={{ width: 200, height: 200}}
            />
          <Text>{exercises[i].name}</Text>
        </TouchableOpacity>
      );
    }
    return output;
  }