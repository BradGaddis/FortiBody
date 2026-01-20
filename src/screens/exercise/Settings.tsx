import React from 'react';
import { Text, View } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/types/navigation';
import { clearExerciseData } from '@/utils/Utils';
import CustomButton from '@/components/common/CustomButton';

interface ExerciseSettingsRouteParams {
  name: string;
  listedKey: string;
  groupedKey: string;
}

interface ExerciseSettingsProps {
  route: RouteProp<RootStackParamList, 'ExerciseSettings'>;
}

export const ExerciseSettings: React.FC<ExerciseSettingsProps> = ({
  route,
}) => {
  const { name, listedKey, groupedKey } =
    route.params as ExerciseSettingsRouteParams;

  const handleClearData = () => {
    clearExerciseData(listedKey);
    clearExerciseData(groupedKey);
  };

  return (
    <View>
      <Text style={{ fontSize: 18, margin: 16 }}>
        Exercise Settings for {name}
      </Text>
      <CustomButton title={`Clear ${name} Data?`} onPress={handleClearData} />
    </View>
  );
};

export default ExerciseSettings;
