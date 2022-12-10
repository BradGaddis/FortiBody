import { Text, View, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function ExerciseListScreen() {
  const navigation = useNavigation();

  return (
    <View>
      <Text>Choose an exercise to record:</Text>
      <View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Bench Press')}
        >
          <Image
            source={require('./basketball-placeholder.png')}
            style={{ width: 200, height: 200 }} />
          <Text>Bench Press</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
