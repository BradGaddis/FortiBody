import {  Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { powerlifting_exercises, total_exercises_dict } from './exercise_store';
import React from 'react';
import styles from '../../Styles';

export function GeneralExercises({ navigation } : { navigation: any }) {
    return (
      <View style={styles.generalExerciseContainer}>
        <Text>All Exercises Available At This Time</Text>
        <ScrollView>
            <ShowExercisesGeneral exercises={total_exercises_dict} navigation={navigation}/>
        </ScrollView>
      </View>
    );
  }
  
function ShowExercisesGeneral({ exercises, navigation }) {
  return (
    <View style={
      styles.showGeneralExerciseContainer
            }>
      {
        exercises.map((exercise : any) => (
          <TouchableOpacity
            key={exercise.id}
            onPress={() => navigation.navigate(exercise.name)}
            style={styles.generalExerciseButton}
          >
            <Image
              source={exercise.img}
              style={styles.generalExerciseImage}
            />
            <Text style={
              styles.generalExerciseText
            }>{exercise.name}</Text>
          </TouchableOpacity>
        ))
      }
    </View>
  )
  
  
} 