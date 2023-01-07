import { Text, View, Button } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment/moment';
import { BackgroundTask } from 'expo';

const STOPWATCH_KEY = '@stopwatch';
const TIME_KEY = '@timekey'

// Define a background task that increments the elapsed time every second
const backgroundTask = async () => {
  console.log('Background task started');
  // Run the task every second
  const intervalId = setInterval(async () => {
    try {
      // Retrieve the elapsed time from storage
      const elapsedTimeString = await AsyncStorage.getItem(STOPWATCH_KEY);
      let elapsedTime = Number(elapsedTimeString);
      // Increment the elapsed time by 1
      elapsedTime++;
      // Save the new elapsed time to storage
      await AsyncStorage.setItem(STOPWATCH_KEY, String(elapsedTime));
      console.log(`Elapsed time incremented to: ${elapsedTime}`);
    } catch (e) {
      console.error(`Error in background task: ${e}`);
    }
  }, 1000);
};

async function SaveTime() {
  const time = Date(Date.now()).toString()
  await AsyncStorage.setItem(TIME_KEY, time);
  console.log("starting timer at: ", time)
}
async function ClearTime(){
  await AsyncStorage.removeItem(TIME_KEY);
}

function useStopwatch() {
  const [elapsedTime, setElapsedTime] = useState(0);

  // Saves the time to memory that timer started
  const [savedTime, setSavedTime] = useState(0)

  // Retrieve the elapsed time from storage when the component mounts
  useEffect(() => {
    async function retrieveElapsedTime() {
      try {
        let elapsedTimeString = await AsyncStorage.getItem(STOPWATCH_KEY);
        if (parseFloat(elapsedTimeString) > 0) {
          setIsRunning(true);
          const prevTime = await AsyncStorage.getItem(TIME_KEY)
          const curTime = Date(Date.now())
          elapsedTimeString = moment(curTime).diff(moment(prevTime), "seconds").toString()
          // print everything for debug
          console.log("prev: ", prevTime, " cur ", curTime)
          console.log(elapsedTimeString)
        }
        setElapsedTime(Number(elapsedTimeString));
      } catch (e) {
        console.error(`Error retrieving elapsed time: ${e}`);
      }
    }

    retrieveElapsedTime();
  }, []);
  const [isRunning, setIsRunning] = useState(false);

  // Update the elapsed time every second when the stopwatch is running  
  useEffect(() => {
    if (isRunning) {
      const intervalId = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [isRunning]);

  // Save the elapsed time to storage whenever it changes
  useEffect(() => {
    async function saveElapsedTime() {
      try {
        await AsyncStorage.setItem(STOPWATCH_KEY, String(elapsedTime));
      } catch (e) {
        console.error(`Error saving elapsed time: ${e}`);
      }
    }

    saveElapsedTime();
  }, [elapsedTime]);


  function start() {
    setIsRunning(true);
    SaveTime()
  }

  function stop() {
    setIsRunning(false);
    ClearTime();
  }

  function reset() {
    setElapsedTime(0);
    stop();
  }

  return { elapsedTime, isRunning, start, stop, reset };
}


function Stopwatch() {
  const { elapsedTime, isRunning, start, stop, reset } = useStopwatch();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isBackgroundTaskRunning, setIsBackgroundTaskRunning] = useState(false);
  const [backgroundTaskName, setBackgroundTaskName] = useState(null);
  const [backgroundTaskError, setBackgroundTaskError] = useState(null);

  const elapsedTimeString = moment.utc(elapsedTime * 1000).format('HH:mm:ss');

  return (
    <View>
      <Text>{elapsedTimeString}</Text>
      {isRunning ? (
        <Button title="Pause" onPress={stop} />
      ) : (
        <Button title="Start" onPress={start} />
      )}
      <Button title="Reset" onPress={reset} />
    </View>
  );
}


export function Fasting() {
  return (
    <View>
      <Stopwatch />
    </View>
  );
}