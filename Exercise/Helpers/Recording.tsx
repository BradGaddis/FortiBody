import React from 'react';
import { View, Text, TextInput } from 'react-native';
import CustomButton from '../../Components/CustomButton';

export function recordSession(name, reps, weight, setReps, setWeight, submitHandler, toggleSession) {
    // start new session
    return (
      <View style = {{
        alignItems: "center",
        justifyContent: "center",
      }}>
        <Text>Record your {name}</Text>
        <TextInput 
        placeholder={`reps as a number`}
        keyboardType='numeric'
        value={reps}
        onChangeText={setReps}
        maxLength={4}
         />
  
        <TextInput 
        placeholder={`weight as a number`} 
        keyboardType='numeric'
        value={weight} 
        onChangeText={setWeight}
        maxLength={4}
        />
        
        <CustomButton style={{width: "60%"}} title="Submit Weights" onPress={() => {
          submitHandler();
        }} />
      </View>
    )
  }