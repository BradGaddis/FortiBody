import { Text, View, Button, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment/moment';

const TIME_KEY = '@start_time'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    },
  button: {
    padding: "20px",
    margin: 100,
    }
  }
);

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
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>

      { isRunning ? (
        <Button style={
          styles.button
        } title="Pause" onPress={stop} />
      ) : (
        <Button
          style={styles.button}
        title="Start" onPress={start} />
      )}
      <Button style={styles.button} title="Reset" onPress={reset} />
      </View>
      <Text style={{fontSize: 20, padding: 50 ,fontWeight: "bold", alignContent: "center"}}>As scripted so far, this is just a timer that you can use to record the last time that you had a meal.</Text>
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