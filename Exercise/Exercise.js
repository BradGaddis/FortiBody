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


  // TODO combine the following two functions into one
  
  
  useEffect(() => {
    (async () => {
      try {
        if (sessionActive) {
          // console.log("Session started")
          startSessionNum = saved ? saved.length : 0;
          // console.log("start from index: ", startSessionNum)
        } else {
          // console.log(startSessionNum)

          // create a shallow copy and 

          const currentSession = saved.slice(startSessionNum, saved.length); // should throw an error on first pass
          // console.log("current session useEffect ", currentSession)
          // console.log("Session ended")
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
    if (parseFloat(reps) > parseFloat(weight)) {
      alert(
        'Warning\nThe number of reps is greater than the weight.')
      return;
    }

    if (reps == '0' || weight == '0' || isNaN(reps) || isNaN(weight)) {
      alert("Warning\nPlease enter a value for reps and weight.")
      return;
    }

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
        
        <CustomButton title="View Sessions" onPress={displayAllSessions} />

        { RenderSession(savedSessions , saved) }       

        {renderAllRecordedSets(saved)}
        <TouchableOpacity style={styles.cog}>
          <Icon 
            size={50}
            name="cog" 
            backgroundColor="#3b5998"
            onPress={goToSettings} />

          {/* <CustomButton title={clearButtonTitle}  /> */}
        </TouchableOpacity>
        
    </SafeAreaView>
  );
}

function renderAllRecordedSets(saved) {
  if (saved == null) {
    return <Text>No sets recorded</Text>
  }
  const listedSets = saved.map((item, index) => {
    return (
      <View key={index}>
      <Text>Reps: {item.reps}</Text>
        <Text>Weight: {item.weight}</Text>
      </View>
        )
      });
      return <ScrollView style={{
        borderWidth: 1,
        borderColor: "black",
        width: "100%",
        alignContent: "center",
        }}>
          {listedSets}
      </ScrollView>
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
      <View key={index}>
        <Text>Reps: {item.reps}</Text>
        <Text>Weight: {item.weight}</Text>
        </View>
        )
      });
      console.log("listed exercises" , saved)
  // if (typeof lastSession == 'undefined') {return <Text>No sessions saved [undefined]</Text>};
  // console.log("saved sessions in render ",savedSessions)
  // console.log("the last session in that list ",lastSession)
  return (
    <View>
      <Text style={{
        fontWeight: "bold",
      }}> Last Session
      {lastSession}
      </Text>
    </View>
  )
}


function goToSettings() {
  // navigate to settings screen
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

export default Exercise;