import React, { useState, useEffect } from 'react';
import { RenderExerciseDefault } from './Rendering/RenderExercise';
import renderAllRecordedSets from './Rendering/RenderAllRecordedSets';
import RenderSession from './Rendering/RenderSession';
import { recordSession } from './Helpers/Recording';
import goToSettings  from './Helpers/GoToSettings';
import { testError, 
  getSavedSets,
  getSavedSessions,
  saveSets,
  saveSessions,
  combineSets } from "./Helpers/Helpers";

let startSessionNum = 0;

// This is designed to be a generic exercise screen
export function Exercise({name, navigation, type="default"}) {
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

  if (type == "default")
  {
    return (
      RenderExerciseDefault(
        name,
        reps,
        weight, 
        setReps, 
        setWeight, 
        handleFullSetSubmit, 
        toggleSession, 
        sessionActive, 
        savedSessions, 
        saved, 
        toggleShowReps,
        showReps,
        navigation,
        goToSettings, 
        listedKey,
        groupedKey, 
        recordSession, 
        RenderSession, 
        renderAllRecordedSets,
        )
    );

  }
  
  // todo
  if (type == "body weight")
  return

  // todo
  if (type == "cardio")
  return

}

