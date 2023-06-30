import { Text, View, Button } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment/moment';

const TIME_KEY = '@start_time'


async function SaveTime() {
  let time = new Date(Date.now())
  time = time.toUTCString()
  await AsyncStorage.setItem(TIME_KEY, time);
  console.log("starting timer at: ", time)
}

async function ClearTime(){
  await AsyncStorage.removeItem(TIME_KEY);
}

async function GetStartTime(){
  let time = await AsyncStorage.getItem(TIME_KEY);
  return time
}

async function GetTimeDiff() {
  const prevTime = await GetStartTime();
  const curTime = moment.parseZone(Date(Date.now()));
  const timeDiff = Number(curTime.diff(moment(prevTime), "seconds").toString());
  return isNaN(timeDiff) ? 0 : timeDiff;
}


function useStopwatch() {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [savedTime, setSavedTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false);

  // Retrieve the elapsed time from storage when the component mounts
  useEffect(() => {
    (async () => {
      try {
        const storedTime = await GetStartTime();
        GetTimeDiff()
        if (storedTime != null) {
          setIsRunning(true);
          setSavedTime(storedTime)
          const diff = GetTimeDiff()
          setElapsedTime(diff);
        }
      } catch (e) {
        console.error(`Error retrieving elapsed time: ${e}`);
      }
    }
    )();
  }, []);

  // Update the elapsed time every second when the stopwatch is running  
  useEffect(() => {
    let intervalId
    (async () => { 
      if (isRunning) {
        intervalId = setInterval(async () => {
          const diff = await GetTimeDiff();
          setElapsedTime(diff);
        }, 1000);
      }
    }
    )();
    return () => clearInterval(intervalId);
  }, [isRunning]);


  function start() {
    setIsRunning(true);
    SaveTime()
    if (elapsedTime === 0) {
      setSavedTime(new Date(Date.now()).toUTCString())
    }
  }

  function stop() {
    setIsRunning(false);
    ClearTime();
  }

  function reset() {
    setElapsedTime(0);
    stop();
    setSavedTime("")
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