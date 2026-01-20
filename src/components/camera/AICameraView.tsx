import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Line, G } from 'react-native-svg';
import type { Pose, Keypoint, FormFeedback, RepState } from '../../types/pose';
import { SKELETON_CONNECTIONS } from '../../types/pose';
import { getPhaseDisplayName } from '../../services/ai/repCounter';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const EXERCISES = [
  'Push-ups',
  'Squats',
  'Plank',
  'Lunges',
  'Pull-ups',
  'Sit-ups',
];

interface AICameraViewProps {
  isActive: boolean;
  pose: Pose | null;
  repState: RepState;
  currentAngle: number | null;
  formFeedback: FormFeedback[];
  exercise: string;
  onExerciseChange: (exercise: string) => void;
  onClose: () => void;
}

const getKeypointColor = (score: number): string => {
  if (score > 0.7) return '#4CAF50';
  if (score > 0.4) return '#FF9800';
  return '#F44336';
};

const renderSkeleton = (keypoints: Keypoint[], scaleX: number, scaleY: number) => {
  const renderedPoints = new Set<number>();

  return (
    <G>
      {SKELETON_CONNECTIONS.map(([start, end], index) => {
        const kpStart = keypoints[start];
        const kpEnd = keypoints[end];

        if (!kpStart || !kpEnd) return null;

        if (kpStart.score < 0.3 || kpEnd.score < 0.3) return null;

        renderedPoints.add(start);
        renderedPoints.add(end);

        return (
          <Line
            key={`line-${index}`}
            x1={kpStart.x * SCREEN_WIDTH * scaleX}
            y1={kpStart.y * 350 * scaleY}
            x2={kpEnd.x * SCREEN_WIDTH * scaleX}
            y2={kpEnd.y * 350 * scaleY}
            stroke={getKeypointColor(Math.min(kpStart.score, kpEnd.score))}
            strokeWidth={3}
            strokeLinecap="round"
          />
        );
      })}

      {keypoints.map((kp, index) => {
        if (renderedPoints.has(index)) return null;
        if (kp.score < 0.3) return null;

        return (
          <Circle
            key={`point-${index}`}
            cx={kp.x * SCREEN_WIDTH * scaleX}
            cy={kp.y * 350 * scaleY}
            r={6}
            fill={getKeypointColor(kp.score)}
          />
        );
      })}
    </G>
  );
};

const AICameraView: React.FC<AICameraViewProps> = ({
  isActive,
  pose,
  repState,
  currentAngle,
  formFeedback,
  exercise,
  onExerciseChange,
  onClose,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (!exercise) return;
    for (let i = 0; i < EXERCISES.length; i++) {
      if (EXERCISES[i].toLowerCase().includes(exercise.toLowerCase())) {
        setSelectedExerciseIndex(i);
        return;
      }
    }
  }, [exercise]);

  const handleExerciseSelect = (index: number) => {
    if (index >= 0 && index < EXERCISES.length) {
      setSelectedExerciseIndex(index);
      onExerciseChange(EXERCISES[index]);
    }
  };

  const handleNextExercise = () => {
    handleExerciseSelect((selectedExerciseIndex + 1) % EXERCISES.length);
  };

  const handlePrevExercise = () => {
    handleExerciseSelect((selectedExerciseIndex - 1 + EXERCISES.length) % EXERCISES.length);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera" size={64} color="#F44336" />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          Please enable camera access in your device settings to use AI workout tracking.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={1}>
        <View style={styles.overlay}>
          {pose && pose.keypoints && (
            <Svg
              width={SCREEN_WIDTH}
              height={350}
              viewBox={`0 0 ${SCREEN_WIDTH} 350`}
              style={styles.skeletonSvg}
            >
              {renderSkeleton(pose.keypoints, 1, 1)}
            </Svg>
          )}

          {!pose && isActive && (
            <View style={styles.noPoseOverlay}>
              <Ionicons name="person" size={48} color="#FFF" />
              <Text style={styles.noPoseText}>Position yourself in frame</Text>
            </View>
          )}
        </View>
      </Camera>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.exerciseSelector}>
          <TouchableOpacity style={styles.exerciseNavBtn} onPress={handlePrevExercise}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.exerciseName}>{EXERCISES[selectedExerciseIndex]}</Text>
          <TouchableOpacity style={styles.exerciseNavBtn} onPress={handleNextExercise}>
            <Ionicons name="chevron-forward" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Reps</Text>
            <Text style={styles.statValue}>{repState.repCount}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Phase</Text>
            <Text style={styles.statValue}>{getPhaseDisplayName(repState.phase)}</Text>
          </View>
          {currentAngle !== null && (
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Angle</Text>
              <Text style={styles.statValue}>{Math.round(currentAngle)}°</Text>
            </View>
          )}
        </View>

        <View style={styles.feedbackContainer}>
          {formFeedback.length > 0 ? (
            formFeedback.map((feedback, index) => (
              <View
                key={index}
                style={[
                  styles.feedbackItem,
                  feedback.type === 'error' && styles.feedbackError,
                  feedback.type === 'warning' && styles.feedbackWarning,
                  feedback.type === 'success' && styles.feedbackSuccess,
                ]}
              >
                <Ionicons
                  name={feedback.type === 'error' ? 'close-circle' : feedback.type === 'warning' ? 'warning' : 'checkmark-circle'}
                  size={16}
                  color="#FFF"
                />
                <Text style={styles.feedbackText}>{feedback.message}</Text>
              </View>
            ))
          ) : repState.phase === 'UP' ? (
            <View style={[styles.feedbackItem, styles.feedbackSuccess]}>
              <Ionicons name="arrow-up-circle" size={16} color="#FFF" />
              <Text style={styles.feedbackText}>Going up...</Text>
            </View>
          ) : repState.phase === 'DOWN' ? (
            <View style={[styles.feedbackItem, styles.feedbackSuccess]}>
              <Ionicons name="arrow-down-circle" size={16} color="#FFF" />
              <Text style={styles.feedbackText}>Going down...</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonSvg: {
    position: 'absolute',
  },
  noPoseOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: 24,
  },
  noPoseText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 12,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: -50,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  exerciseNavBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginHorizontal: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  statLabel: {
    color: '#AAA',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  feedbackContainer: {
    minHeight: 60,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  feedbackError: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  feedbackWarning: {
    backgroundColor: 'rgba(255, 152, 0, 0.8)',
  },
  feedbackSuccess: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  feedbackText: {
    color: '#FFF',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 16,
  },
  permissionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    color: '#AAA',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
});

export default AICameraView;
