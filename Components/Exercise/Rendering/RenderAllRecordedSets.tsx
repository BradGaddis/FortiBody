import React from 'react';
import { Text, View, SafeAreaView, ScrollView } from 'react-native';
import { EpleyConversion } from '../../../Utils';


function renderAllRecordedSets(saved) {
    if (saved == null) {
      return <Text>No sets recorded</Text>
    }
    const listedSets = saved.map((item, index) => {
      return (
        <View key={index} style={{
          borderWidth: 1,
          borderColor: "black",
          alignContent: "center",
          flexShrink: 1,
          }}>
            <View style={{
              flex: 1,
              flexDirection: "row",
              flexWrap: "nowrap",
            }}>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "black",
                  alignContent: "center",
                }}
          >
                  <Text numberOfLines={1} >Reps: {item.reps},</Text>
                  <Text numberOfLines={1} >Weight: {item.weight}</Text>
              </View>
              <View style={{
                flex: 1,
              }}>
              <Text style={{flexWrap: 'wrap'}}>
                  Est 1-rep for this set: {EpleyConversion(item.reps, item.weight)}
                  </Text>
              </View>
            </View>
        </View>
          )
        });
  
        return (
          <SafeAreaView style={{
            flex: 1,
            flexDirection: "row",
          }}>
            <Text style={{
              borderWidth: 1,
              borderColor: "black",
              alignContent: "center",
              height: "100%",
              maxHeight: "100%",
              }}
              >Previous Reps and Sets</Text>
            <ScrollView style={{
              borderWidth: 1,
              borderColor: "black",
              alignContent: "center",
              }}>
                {listedSets}
            </ScrollView>
          </SafeAreaView>
            ) 
    }
  

    export default renderAllRecordedSets;