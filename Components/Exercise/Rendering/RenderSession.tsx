import React from 'react';
import { View, Text } from 'react-native';


function RenderSession(savedSessions, saved) {
    if (savedSessions == null || savedSessions.length == 0 ) {return <Text>No sessions saved</Text>};
    const lastSession = savedSessions[savedSessions.length - 1].map((item, index) => {
      return (
        <View key={index} style={{
          borderWidth: 1,
          borderColor: "black",
          marginRight: 10,
          marginLeft: 10,
          marginBottom: 5,
        }}>
          <Text> Reps: {item.reps} Weight: {item.weight} </Text>
        </View>
      )
    });
    console.log("listed exercises" , saved)
    return (
      <View style={{
      }} >
        <View style={{
          flexDirection: "row",
          alignItems: "center",
        }}>
          <Text style={{
            fontWeight: "bold",
          }}> Last Session </Text>
          <View style={{
            flexDirection: "row",
            flexWrap: "wrap", // set flexWrap to "wrap"
          }}>
            {lastSession}
          </View>
        </View>
          <Text style={{}} >Max 1-Rep for this session: {"TODO"} | Recorded on {"TODO"}</Text>
      </View>
    )
  }

export default RenderSession;