import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Exercise } from '@/types/exercise';

interface ExerciseTimerProps {
  exercise: Exercise;
  onSetComplete: (sets: ExerciseSet[]) => void;
}

interface ExerciseSet {
  reps: number;
  weight: number;
  completed: boolean;
}

interface RepCounterProps {
  reps: number;
  setReps: (reps: number) => void;
  showReps: boolean;
  toggleRounded: boolean;
}

interface WeightInputProps {
  weight: number;
  setWeight: (weight: number) => void;
  label?: string;
}

interface SessionControlsProps {
  sessionActive: boolean;
  onStartSession: () => void;
  onEndSession: () => void;
  exerciseName: string;
}

const RepCounter: React.FC<RepCounterProps> = ({
  reps,
  setReps,
  showReps,
  toggleRounded,
}) => {
  const incrementReps = () => {
    if (toggleRounded) {
      setReps(reps + 5);
    } else {
      setReps(reps + 1);
    }
  };

  const decrementReps = () => {
    if (reps > 0) {
      setReps(reps - 1);
    }
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 }}>
      <TouchableOpacity
        onPress={decrementReps}
        style={{ padding: 10, backgroundColor: '#ff4444', borderRadius: 5 }}
      >
        <Text style={{ color: 'white', fontSize: 18 }}>-</Text>
      </TouchableOpacity>
      <View style={{ alignItems: 'center', minWidth: 60 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
          {showReps ? reps : '?'}
        </Text>
      </View>
      <TouchableOpacity
        onPress={incrementReps}
        style={{ padding: 10, backgroundColor: '#44ff44', borderRadius: 5 }}
      >
        <Text style={{ color: 'white', fontSize: 18 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const WeightInput: React.FC<WeightInputProps> = ({
  weight,
  setWeight,
  label,
}) => {
  return (
    <View style={{ alignItems: 'center', marginVertical: 10 }}>
      <Text style={{ fontSize: 16, marginBottom: 5 }}>
        {label || 'Weight (kg)'}
      </Text>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#f0f0f0',
          padding: 15,
          borderRadius: 10,
          marginHorizontal: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => setWeight(Math.max(0, weight - 5))}
          style={{ padding: 10, backgroundColor: '#ff4444', borderRadius: 5 }}
        >
          <Text style={{ color: 'white', fontSize: 18 }}>-</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', minWidth: 50 }}>
          {weight}
        </Text>
        <TouchableOpacity
          onPress={() => setWeight(weight + 5)}
          style={{ padding: 10, backgroundColor: '#44ff44', borderRadius: 5 }}
        >
          <Text style={{ color: 'white', fontSize: 18 }}>+</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const SessionControls: React.FC<SessionControlsProps> = ({
  sessionActive,
  onStartSession,
  onEndSession,
  exerciseName,
}) => {
  return (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      {!sessionActive ? (
        <TouchableOpacity
          onPress={onStartSession}
          style={{
            backgroundColor: '#44ff44',
            padding: 15,
            borderRadius: 10,
            alignItems: 'center',
            minWidth: 150,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            Start {exerciseName} Session
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={onEndSession}
          style={{
            backgroundColor: '#ff4444',
            padding: 15,
            borderRadius: 10,
            alignItems: 'center',
            minWidth: 150,
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            End Session
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export {
  RepCounter,
  WeightInput,
  SessionControls,
  ExerciseTimerProps,
  ExerciseSet,
};
