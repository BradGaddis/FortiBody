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
  let time = new Date(Date.now())
  time = time.toUTCString()
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
  
  const [isRunning, setIsRunning] = useState(false);

  // Retrieve the elapsed time from storage when the component mounts
  useEffect(() => {
    async function retrieveElapsedTime() {
      try {
        let elapsedTimeString = await AsyncStorage.getItem(STOPWATCH_KEY);
        if (parseFloat(elapsedTimeString) > 0) {
          setIsRunning(true);
          const prevTime = await AsyncStorage.getItem(TIME_KEY)
          const curTime = moment.parseZone(Date(Date.now()))
          setSavedTime(prevTime)
          elapsedTimeString = curTime.diff(moment(prevTime), "seconds").toString()
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

  return { elapsedTime, isRunning, start, stop, reset, savedTime};
}


function Stopwatch( ) {
  const { elapsedTime, isRunning, start, stop, reset, savedTime } = useStopwatch();

  let elapsedTimeString;

  switch (true) {
    case elapsedTime < 10:
      elapsedTimeString = moment.utc(elapsedTime * 1000).format('s');
      break;
    case elapsedTime < 60:
      elapsedTimeString = moment.utc(elapsedTime * 1000).format('ss');
      break
    case elapsedTime < 60 * 10:
      elapsedTimeString = moment.utc(elapsedTime * 1000).format('m:ss');
      break
    case elapsedTime < 60 * 60:
      elapsedTimeString = moment.utc(elapsedTime * 1000).format('mm:ss');
      break;
    case elapsedTime < 60 * 60 * 10:
      elapsedTimeString = moment.utc(elapsedTime * 1000).format('H:mm:ss');
      break;
    case elapsedTime < 60 * 60 * 24:
      elapsedTimeString = moment.utc(elapsedTime * 1000).format('HH:mm:ss');
      break;
    default:
      // Pass as many days that have elapsed into moment.utc format string
      const daysPassed = elapsedTime % (60 * 60 * 24)
      let daysArr = [];
      for (let i = 0; i < daysPassed; i++) {
        daysArr.push("D");
      }
      const daysString = daysArr.join("");
      elapsedTimeString = moment.utc(elapsedTime * 1000).format(daysString + ':HH:mm:ss');
  }

  return (
    <View style={{alignItems:"center"}}>
      <Text>{elapsedTimeString}</Text>
      <Text>{savedTime ? "You started at " + savedTime : "Timer Not Started"}</Text>
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
    <View >
      <Stopwatch />
    </View>
  );
}

export default Fasting