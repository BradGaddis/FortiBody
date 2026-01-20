import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types/navigation';
import {
  TimerDisplay,
  TimerControls,
  FastingStats,
} from '@/components/nutrition/FastingTimer';

interface FastingScreenProps {
  navigation: StackNavigationProp<RootStackParamList>;
}

const TIME_KEY = '@start_time';

const FastingScreen: React.FC<FastingScreenProps> = ({ navigation }) => {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  useEffect(() => {
    loadStartTime();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerActive && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const difference = now.getTime() - startTime.getTime();
        const hours = Math.floor(difference / 3600000);
        const minutes = Math.floor((difference % 3600000) / 60000);
        const seconds = Math.floor((difference % 60000) / 1000);

        setElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    } else {
      if (interval) {
        clearInterval(interval);
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerActive, startTime]);

  const loadStartTime = async () => {
    try {
      const storedTime = await AsyncStorage.getItem(TIME_KEY);
      if (storedTime) {
        setStartTime(new Date(storedTime));
      }
    } catch (error) {
      console.error('Error loading start time:', error);
    }
  };

  const saveStartTime = async (time: Date) => {
    try {
      await AsyncStorage.setItem(TIME_KEY, time.toISOString());
    } catch (error) {
      console.error('Error saving start time:', error);
    }
  };

  const handleStartTimer = () => {
    if (!startTime) {
      const now = new Date();
      setStartTime(now);
      saveStartTime(now);
    }
    setIsTimerActive(true);
  };

  const handlePauseTimer = () => {
    setIsTimerActive(false);
  };

  const handleResetTimer = () => {
    setIsTimerActive(false);
    setElapsedTime('00:00:00');
    setStartTime(null);
    AsyncStorage.removeItem(TIME_KEY);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ padding: 20, maxWidth: 400 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 30,
            textAlign: 'center',
          }}
        >
          Intermittent Fasting Timer
        </Text>

        <TimerDisplay elapsedTime={elapsedTime} />

        <FastingStats startTime={startTime} isTimerActive={isTimerActive} />

        <TimerControls
          isTimerActive={isTimerActive}
          onStartTimer={handleStartTimer}
          onPauseTimer={handlePauseTimer}
          onResetTimer={handleResetTimer}
        />

        <View style={{ marginTop: 30, alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Enhanced Home')}
            style={{
              backgroundColor: '#007AFF',
              padding: 15,
              borderRadius: 10,
              alignItems: 'center',
              minWidth: 150,
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default FastingScreen;
