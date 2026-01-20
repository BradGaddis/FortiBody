import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

interface TimerDisplayProps {
  elapsedTime: string;
}

interface TimerControlsProps {
  isTimerActive: boolean;
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ elapsedTime }) => {
  return (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      <Text
        style={{ fontSize: 48, fontWeight: 'bold', fontFamily: 'monospace' }}
      >
        {elapsedTime}
      </Text>
      <Text style={{ fontSize: 16, color: '#666', marginTop: 5 }}>
        Fasting Timer
      </Text>
    </View>
  );
};

const TimerControls: React.FC<TimerControlsProps> = ({
  isTimerActive,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
}) => {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
      {!isTimerActive ? (
        <TouchableOpacity
          onPress={onStartTimer}
          style={{
            backgroundColor: '#44ff44',
            padding: 15,
            borderRadius: 10,
            alignItems: 'center',
            minWidth: 100,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            Start
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={onPauseTimer}
          style={{
            backgroundColor: '#ff9800',
            padding: 15,
            borderRadius: 10,
            alignItems: 'center',
            minWidth: 100,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            Pause
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={onResetTimer}
        style={{
          backgroundColor: '#6c757d',
          padding: 15,
          borderRadius: 10,
          alignItems: 'center',
          minWidth: 100,
        }}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          Reset
        </Text>
      </TouchableOpacity>
    </View>
  );
};

interface FastingStatsProps {
  startTime: Date | null;
  isTimerActive: boolean;
}

const FastingStats: React.FC<FastingStatsProps> = ({
  startTime,
  isTimerActive,
}) => {
  if (!startTime) {
    return (
      <View style={{ alignItems: 'center', marginVertical: 20 }}>
        <Text style={{ fontSize: 18, color: '#666' }}>No active fast</Text>
      </View>
    );
  }

  const duration = isTimerActive
    ? moment().diff(moment(startTime), 'hours')
    : moment(startTime).diff(moment(startTime), 'hours');

  return (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        Fast Duration: {duration.toFixed(1)} hours
      </Text>
      <Text style={{ fontSize: 16, color: '#666' }}>
        Started: {moment(startTime).format('h:mm a')}
      </Text>
    </View>
  );
};

export {
  TimerDisplay,
  TimerControls,
  FastingStats,
  FastingStatsProps,
  TimerDisplayProps,
  TimerControlsProps,
};
