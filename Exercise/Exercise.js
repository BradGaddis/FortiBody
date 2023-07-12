import React, { useState, useEffect } from 'react';
import { Text, Button, View, Alert, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
import { EpleyConversion, clearExerciseData, generateExerciseId } from '../utils';
import CustomButton from '../Components/CustomButton';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cog: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    zIndex: 1,
  },
});

let startSessionNum = 0;

//TODO separate the rendering functions into their own components in a separate file

// This is designed to be a generic exercise screen
export function Exercise({name, navigation}) {
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  const [showReps , setShowReps] = useState(false);

  // State variable to store the reps input by the user
  const [saved, setSaved] = useState(null);
  const [savedSessions, setSavedSessions] = useState(null);
  
  const [toggleRounded, setToggleRounded] = useState(true);

  // Use the name of the exercise as the key for storing and retrieving the sets from storage
  const listedKey = name + '-keylist';
  const groupedKey = name + '-keygroup';
  // const clearButtonTitle = 'Clear ' + name + ' Session';

  useEffect(() => {
     (async () => {
      try {
        const savedSessVal = await (getSavedSessions(groupedKey));
        
        if (savedSessVal != null) {
          setSavedSessions(JSON.parse(savedSessVal));
          // console.log("value was saved to inital state", savedSessVal)
        } 

      } catch (error) {
        // Error retrieving data
        console.log("no data", error);
      }
    })();
  }, []);



  useEffect(() => {
    (async () => {
     try {
       const savedListVal = await (getSavedSets(listedKey));
       if (savedListVal != null) {
         setSaved(JSON.parse(savedListVal));
         console.log("value was saved to inital state", savedListVal)
       }
     } catch (error) {
       // Error retrieving data
       console.log("no data", error);
     }
   })();
 }, []);

  useEffect(() => {
    (async () => {
      try {
        if (sessionActive) {
          startSessionNum = saved ? saved.length : 0;
        } else {
          const currentSession = saved.slice(startSessionNum, saved.length); // should throw an error on first pass
          
          if (currentSession.length == 0) {
            console.log("nothing to add")
            return;
          }
          setSavedSessions((prev) => {
            if (!prev) {
              // console.log("no prev")
              return [currentSession];
            } else{
              // console.log("prev", prev)
              return [...prev, currentSession];
            }
          });
        }
      } catch (error) {
        // Error saving data
        console.log("no data in sessionActive useEffect", error);
      }
    })()
  }, [sessionActive]);
  
  
    useEffect(() => {
      (async () => {
        try {
          // console.log("saving sets to storage", saved)
          if (saved != null)  await saveSets(listedKey, saved);
        } catch (error) {
          // Error saving data
          console.log("no data saved", error);
          alert("Error saving data in saved useEffect", error);
        } 
      try {
        console.log("saving sets to storage", savedSessions)
        await saveSessions(groupedKey, savedSessions);
      } catch (error) {
        // Error saving data
        console.log("no data saved in savedSession useEffect", error);
      }
    })()
  }, [savedSessions]);
        

  
  // Handler function to save the full set to storage when the submit button is pressed
  const handleFullSetSubmit = () => {
    // Add warning alert with continue button if Alertreps is more than weight
    if (testError(reps, weight, setReps, setWeight)) return

    const full = combineSets(reps, weight);

    setSaved((prev) => {
      if (!prev) {
        return [full];
      } else {
        return [...prev, full];
      }
    });

    setReps(0);
    setWeight(0);
  };

  function toggleSession() {
    setSessionActive(!sessionActive);
    return sessionActive;
  }

  function toggleShowReps() {
    setShowReps(!showReps);
    return showReps;
  }

  function displayAllSessions() {

  }

  
  return (
    <SafeAreaView style={styles.container}>
        {sessionActive ? recordSession(name, reps, weight, setReps, setWeight, handleFullSetSubmit ,toggleSession) : ""}


        <CustomButton title={
          sessionActive ? "Finish Session" : "Start Session"
        } onPress={() => {
          console.log("sessionActive", sessionActive)
          toggleSession();
        }} />
        
        <CustomButton 
        title={showReps ? "Hide All Previous Sets and Reps" : "View all Previous Sets and Reps"}
         onPress={toggleShowReps} />

        { RenderSession(savedSessions , saved) }       

        {showReps ? renderAllRecordedSets(saved) : ""}

        <TouchableOpacity style={styles.cog}>
          <Icon 
            size={50}
            name="cog" 
            backgroundColor="#3b5998"
            onPress={()=> {goToSettings(name, listedKey , groupedKey, navigation)}} />

          {/* <CustomButton title={clearButtonTitle}  /> */}
        </TouchableOpacity>
        
    </SafeAreaView>
  );
}

function clearSets(key) {
}

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



function recordSession(name, reps, weight, setReps, setWeight, submitHandler, toggleSession) {
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
function goToSettings(name, listedKey, groupedKey, navigation) {
  // navigate to settings screen and pass arguments
  navigation.navigate('Exercise Settings', {
    name: name,
    listedKey: listedKey,
    groupedKey: groupedKey,
  });
}

async function getSavedSets(key) {
  const items = await AsyncStorage.getItem(key);
  console.log("unparsed ", items)
  // console.log("retriving sets: ", items)
  return items;
}

async function getSavedSessions(key) {
  const items = await AsyncStorage.getItem(key);
  return items;
}

async function saveSets(key, items) {
  // console.log("saving sets ", items)
  return await AsyncStorage.setItem(key, JSON.stringify(items), () => {console.log(items, " saved")});
}

async function saveSessions(key, items) {
  // console.log("saving sets ", items)
  return await AsyncStorage.setItem(key, JSON.stringify(items));
}

function combineSets( reps, weight) {
  const combined = {
    reps: reps,
    weight: weight
  };
  return combined;
}

function testError(reps, weight, setReps, setWeight) {
  const reset = () => {
    setReps(0);
    setWeight(0);
  }
  let test = false
  if (parseFloat(reps) > parseFloat(weight)) {
    alert(
      'Warning\nThe number of reps is greater than the weight.')
      test = true;
  }

  if (reps == '0' || weight == '0' || isNaN(reps) || isNaN(weight)) {
  {
    Alert.alert(
      'Warning \n Please enter a value for reps and weight.'
    )
    test = true;
  }
  if (test) {
    reset();
  }
  return test;
}

}

export default Exercise;
