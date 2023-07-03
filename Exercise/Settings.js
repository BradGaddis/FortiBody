import React from 'react';
import { Text, Button, View } from 'react-native';
import { clearExerciseData } from '../utils';
import CustomButton from '../Components/CustomButton';


export function ExerciseSettings({route}) {
    const { name, listedKey, groupedKey } = route.params;
    return (
        <View>
            <CustomButton title={`Clear ${name} Data?`} onPress={() => {
                clearExerciseData(listedKey)
                clearExerciseData(groupedKey)
            }
                } />
        </View>
    )
}