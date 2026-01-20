import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Line, G } from 'react-native-svg';
import type { Pose, Keypoint, FormFeedback, RepState } from '../../types/pose';
import { SKELETON_CONNECTIONS } from '../../types/pose';
import { getPhaseDisplayName } from '../../services/ai/repCounter';

import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AICameraViewProps {
  isActive: boolean;
  pose: Pose | null;
  repState: RepState;
  currentAngle: number | null;
  formFeedback: FormFeedback[];
  exercise: string;
  onClose: () => void;
  onRepAdjust?: (adjustment: number) => void;
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
      {SKELETON_CONNECTIONS.map((connection, idx) => {
        const start = connection[0] as number;
        const end = connection[1] as number;
        const kpStart = keypoints[start];
        const kpEnd = keypoints[end];

        if (!kpStart || !kpEnd) return null;

        if (kpStart.score < 0.3 || kpEnd.score < 0.3) return null;

        renderedPoints.add(start);
        renderedPoints.add(end);

        return (
          <Line
            key={`line-${idx}`}
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

      {keypoints.map((kp, idx) => {
        if (renderedPoints.has(idx)) return null;
        if (kp.score < 0.3) return null;

        return (
          <Circle
            key={`point-${idx}`}
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
  onClose,
  onRepAdjust,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [manualOverride, setManualOverride] = useState(0);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    setManualOverride(0);
  }, [exercise]);

  const handleAddRep = useCallback(() => {
    setManualOverride(prev => prev + 1);
    onRepAdjust?.(1);
  }, [onRepAdjust]);

  const handleSubtractRep = useCallback(() => {
    setManualOverride(prev => prev - 1);
    onRepAdjust?.(-1);
  }, [onRepAdjust]);

  const handleResetOverride = useCallback(() => {
    setManualOverride(0);
  }, []);

  const displayRepCount = repState.repCount + manualOverride;
  const hasOverride = manualOverride !== 0;

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
        <TouchableOpacity style={styles.closeBtnLarge} onPress={onClose}>
          <Text style={styles.closeBtnLargeText}>Go Back</Text>
        </TouchableOpacity>
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

        <View style={styles.headerRow}>
          <View style={styles.exerciseBadge}>
            <Ionicons name="fitness" size={18} color="#4CAF50" />
            <Text style={styles.exerciseName}>{exercise}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Reps</Text>
            <Text style={[styles.statValue, hasOverride && styles.overrideActive]}>
              {displayRepCount}
            </Text>
            {hasOverride && (
              <Text style={styles.overrideText}>
                {manualOverride > 0 ? '+' : ''}{manualOverride} manual
              </Text>
            )}
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

        <View style={styles.manualControls}>
          <Text style={styles.manualControlsTitle}>Manual Override</Text>
          <View style={styles.overrideRow}>
            <TouchableOpacity
              style={[styles.overrideBtn, styles.overrideMinus]}
              onPress={handleSubtractRep}
              disabled={displayRepCount <= 0}
            >
              <Ionicons name="remove" size={24} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.overrideDisplay}>
              <Text style={styles.overrideLabel}>AI: {repState.repCount}</Text>
              <Text style={styles.overrideDivider}>|</Text>
              <Text style={[styles.overrideTotal, hasOverride && styles.overrideActiveText]}>
                Total: {displayRepCount}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.overrideBtn, styles.overridePlus]}
              onPress={handleAddRep}
            >
              <Ionicons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {hasOverride && (
            <TouchableOpacity style={styles.resetBtn} onPress={handleResetOverride}>
              <Ionicons name="refresh" size={16} color="#4CAF50" />
              <Text style={styles.resetBtnText}>Reset to AI count</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.feedbackContainer}>
          {formFeedback.length > 0 ? (
            formFeedback.map((feedback, idx) => (
              <View
                key={idx}
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
          ) : (
            <View style={[styles.feedbackItem, styles.feedbackInfo]}>
              <Ionicons name="information-circle" size={16} color="#FFF" />
              <Text style={styles.feedbackText}>Get in position to start counting</Text>
            </View>
          )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    padding: 16,
    paddingBottom: 32,
  },
  closeBtn: {
    position: 'absolute',
    top: -60,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeBtnLarge: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 24,
  },
  closeBtnLargeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  exerciseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  exerciseName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
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
    fontSize: 28,
    fontWeight: '700',
  },
  overrideActive: {
    color: '#FF9800',
  },
  overrideText: {
    color: '#FF9800',
    fontSize: 10,
    marginTop: 2,
  },
  manualControls: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  manualControlsTitle: {
    color: '#AAA',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  overrideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overrideBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overrideMinus: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  overridePlus: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  overrideDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  overrideLabel: {
    color: '#888',
    fontSize: 14,
  },
  overrideDivider: {
    color: '#555',
    marginHorizontal: 12,
    fontSize: 18,
  },
  overrideTotal: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  overrideActiveText: {
    color: '#FF9800',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 6,
  },
  resetBtnText: {
    color: '#4CAF50',
    fontSize: 13,
    marginLeft: 6,
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
  feedbackInfo: {
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
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

