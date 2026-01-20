import { useState, useEffect, useRef, useCallback } from 'react';
import type { Pose, Keypoint, BodyAngles, FormFeedback, RepState } from '../types/pose';
import { initializePoseDetector, detectPose, isPersonVisible } from '../services/ai/PoseDetectionService';
import { getExerciseAngles, extractBodyAngles } from '../services/ai/formAnalysis';
import { updateRepState, checkForm, createInitialRepState, getPhaseDisplayName } from '../services/ai/repCounter';
import { getExerciseConfig } from '../services/ai/exerciseConfigs';

interface UsePoseDetectionOptions {
  exercise: string;
  onRepComplete?: (repNumber: number) => void;
  onFormFeedback?: (feedback: FormFeedback[]) => void;
  onStateChange?: (state: RepState) => void;
}

interface UsePoseDetectionReturn {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  pose: Pose | null;
  repState: RepState;
  currentAngle: number | null;
  formFeedback: FormFeedback[];
  phaseDisplay: string;
  startDetection: () => Promise<void>;
  stopDetection: () => void;
  switchExercise: (exercise: string) => void;
}

export function usePoseDetection(options: UsePoseDetectionOptions): UsePoseDetectionReturn {
  const { exercise, onRepComplete, onFormFeedback, onStateChange } = options;
  
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pose, setPose] = useState<Pose | null>(null);
  const [repState, setRepState] = useState<RepState>(createInitialRepState());
  const [currentAngle, setCurrentAngle] = useState<number | null>(null);
  const [formFeedback, setFormFeedback] = useState<FormFeedback[]>([]);
  const [currentExercise, setCurrentExercise] = useState(exercise);

  const animationFrameRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);
  const lastProcessTimeRef = useRef(0);
  const processInterval = 100;

  const processPose = useCallback(async (imageSource: HTMLImageElement | ImageBitmap) => {
    const detectedPose = await detectPose(imageSource);
    
    if (!detectedPose || !isPersonVisible(detectedPose, 0.25)) {
      setPose(null);
      return;
    }

    setPose(detectedPose);

    const config = getExerciseConfig(currentExercise);
    if (!config) return;

    const exerciseData = getExerciseAngles(detectedPose.keypoints, config.keypoints as [number, number, number]);
    if (!exerciseData) return;

    setCurrentAngle(exerciseData.angle);

    const angles = extractBodyAngles(detectedPose.keypoints);
    const feedback = checkForm(currentExercise, angles, detectedPose.keypoints);
    setFormFeedback(feedback);
    onFormFeedback?.(feedback);

    const result = updateRepState(
      repState,
      currentExercise,
      exerciseData.angle,
      angles,
      detectedPose.keypoints,
      feedback
    );

    setRepState(result.newState);
    onStateChange?.(result.newState);

    if (result.repCompleted) {
      onRepComplete?.(result.newState.repCount);
    }

    setFormFeedback(result.feedback);
  }, [currentExercise, repState, onRepComplete, onFormFeedback, onStateChange]);

  const processFrame = useCallback(async (imageElement: HTMLImageElement) => {
    const now = Date.now();
    if (now - lastProcessTimeRef.current < processInterval) {
      return;
    }
    lastProcessTimeRef.current = now;

    if (!isRunningRef.current) return;

    try {
      await processPose(imageElement);
    } catch (err) {
      console.error('Frame processing error:', err);
    }
  }, [processPose]);

  const startDetection = useCallback(async () => {
    if (isRunningRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const initialized = await initializePoseDetector();
      if (!initialized) {
        setError('Failed to initialize pose detector');
        setIsLoading(false);
        return;
      }

      setIsReady(true);
      isRunningRef.current = true;
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
    }
  }, []);

  const stopDetection = useCallback(() => {
    isRunningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setPose(null);
  }, []);

  const switchExercise = useCallback((newExercise: string) => {
    setCurrentExercise(newExercise);
    setRepState(createInitialRepState());
    setCurrentAngle(null);
    setFormFeedback([]);
  }, []);

  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return {
    isReady,
    isLoading,
    error,
    pose,
    repState,
    currentAngle,
    formFeedback,
    phaseDisplay: getPhaseDisplayName(repState.phase),
    startDetection,
    stopDetection,
    switchExercise,
  };
}
