import {  Text, View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { powerlifting_exercises, total_exercises_dict } from './exercise_store';
import React from 'react';

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


  
  function ShowExercisesGeneral({ exercises, navigation }) {
    return (
      <View style={{
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
      }}>
        {
          exercises.map((exercise : any) => (
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
      </View>
    )
    
    
  } 