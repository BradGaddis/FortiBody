import { Text, View, Button } from 'react-native';
import React, { useState, useEffect } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';



const STOPWATCH_KEY = '@stopwatch';

function useStopwatch() {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (isRunning) {
      const intervalId = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [isRunning]);

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

  useEffect(() => {
    async function retrieveElapsedTime() {
      try {
        const elapsedTimeString = await AsyncStorage.getItem(STOPWATCH_KEY);
        setElapsedTime(Number(elapsedTimeString));
      } catch (e) {
        console.error(`Error retrieving elapsed time: ${e}`);
      }
    }

    retrieveElapsedTime();
  }, []);

  function start() {
    setIsRunning(true);
  }

  function stop() {
    setIsRunning(false);
  }

  function reset() {
    setElapsedTime(0);
  }

  return { elapsedTime, isRunning, start, stop, reset };
}




function Stopwatch() {
  const { elapsedTime, isRunning, start, stop, reset } = useStopwatch();

  return (
    <View>
      <Text>{elapsedTime}</Text>
      {isRunning ? (
        <Button title="Stop" onPress={stop} />
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