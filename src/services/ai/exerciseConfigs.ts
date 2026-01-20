import type { ExerciseConfig, FormRule, BodyAngles, Keypoint, Point } from '../../types/pose';

const getPointValue = (val: number | Point | undefined): Point | null => {
  if (val === undefined) return null;
  if (typeof val === 'number') return null;
  return val;
};

const createElbowRangeRule = (): FormRule => ({
  name: 'elbow_range',
  check: (angles: BodyAngles): boolean => {
    const elbow = angles.rightElbow ?? angles.leftElbow;
    return elbow !== undefined && elbow > 70 && elbow < 100;
  },
  message: 'Go lower (aim for 90° at bottom)',
  type: 'warning',
});

const createKneeDepthRule = (): FormRule => ({
  name: 'knee_depth',
  check: (angles: BodyAngles): boolean => {
    const knee = angles.rightKnee ?? angles.leftKnee;
    return knee !== undefined && knee > 100;
  },
  message: 'Go deeper (aim for thighs parallel)',
  type: 'warning',
});

const createBodyAlignmentRule = (): FormRule => ({
  name: 'body_alignment',
  check: (angles: BodyAngles, keypoints: Keypoint[]): boolean => {
    const shoulder = angles.rightShoulder ?? angles.leftShoulder;
    const hip = angles.rightHip ?? angles.leftHip;
    const knee = angles.rightKnee ?? angles.leftKnee;
    if (typeof shoulder !== 'number' || typeof hip !== 'number' || typeof knee !== 'number') {
      return false;
    }
    const hipAngle = Math.abs(hip - (shoulder + knee) / 2);
    return hipAngle > 15;
  },
  message: 'Straighten your body - hips too high or low',
  type: 'warning',
});

const createKneeTrackingRule = (): FormRule => ({
  name: 'knee_tracking',
  check: (angles: BodyAngles, keypoints: Keypoint[]): boolean => {
    const leftKnee = keypoints[13];
    const rightKnee = keypoints[14];
    const leftAnkle = keypoints[15];
    const rightAnkle = keypoints[16];
    if (!leftKnee || !rightKnee || !leftAnkle || !rightAnkle) return false;
    const leftKneeX = leftKnee.x - leftAnkle.x;
    const rightKneeX = rightKnee.x - rightAnkle.x;
    return Math.abs(leftKneeX) > 0.1 || Math.abs(rightKneeX) > 0.1;
  },
  message: 'Knees caving inward - push them out',
  type: 'error',
});

const createChestUpRule = (): FormRule => ({
  name: 'chest_up',
  check: (angles: BodyAngles, keypoints: Keypoint[]): boolean => {
    const shoulder = angles.rightShoulder ?? angles.leftShoulder;
    const hip = angles.rightHip ?? angles.leftHip;
    if (typeof shoulder !== 'number' || typeof hip !== 'number') return false;
    const minY = Math.min(shoulder, hip);
    const maxY = Math.max(shoulder, hip);
    return minY > maxY - 0.15;
  },
  message: 'Keep chest up - lean forward slightly',
  type: 'warning',
});

const createFrontKneeDepthRule = (): FormRule => ({
  name: 'front_knee_depth',
  check: (angles: BodyAngles): boolean => {
    const knee = angles.rightKnee ?? angles.leftKnee;
    return knee !== undefined && knee > 100;
  },
  message: 'Front knee at 90° - go deeper',
  type: 'warning',
});

const createKneeOverAnkleRule = (): FormRule => ({
  name: 'knee_over_ankle',
  check: (angles: BodyAngles, keypoints: Keypoint[]): boolean => {
    const knee = angles.rightKnee ?? angles.leftKnee;
    const ankle = angles.rightAnkle ?? angles.leftAnkle;
    if (typeof knee !== 'number' || typeof ankle !== 'number') return false;
    return knee > ankle + 0.05;
  },
  message: 'Keep front knee over ankle',
  type: 'error',
});

const formRules: Record<string, FormRule[]> = {
  pushup: [createElbowRangeRule()],
  squat: [createKneeDepthRule(), createKneeTrackingRule(), createChestUpRule()],
  plank: [createBodyAlignmentRule()],
  lunge: [createFrontKneeDepthRule(), createKneeOverAnkleRule()],
  'pull-up': [],
  'sit-up': [],
};

export const EXERCISE_CONFIGS: Record<string, ExerciseConfig> = {
  pushup: {
    name: 'Push-ups',
    keypoints: [6, 8, 10],
    upAngle: 160,
    downAngle: 90,
    upAngleTolerance: 15,
    downAngleTolerance: 15,
    formRules: formRules.pushup || [],
  },
  squat: {
    name: 'Squats',
    keypoints: [11, 13, 15],
    upAngle: 160,
    downAngle: 90,
    upAngleTolerance: 15,
    downAngleTolerance: 20,
    formRules: formRules.squat || [],
  },
  plank: {
    name: 'Plank',
    keypoints: [5, 11, 13],
    upAngle: 180,
    downAngle: 170,
    upAngleTolerance: 10,
    downAngleTolerance: 15,
    formRules: formRules.plank || [],
  },
  lunge: {
    name: 'Lunges',
    keypoints: [11, 13, 15],
    upAngle: 160,
    downAngle: 90,
    upAngleTolerance: 15,
    downAngleTolerance: 15,
    formRules: formRules.lunge || [],
  },
  'pull-up': {
    name: 'Pull-ups',
    keypoints: [6, 8, 10],
    upAngle: 170,
    downAngle: 90,
    upAngleTolerance: 15,
    downAngleTolerance: 20,
    formRules: formRules['pull-up'] || [],
  },
  'sit-up': {
    name: 'Sit-ups',
    keypoints: [5, 11, 12],
    upAngle: 90,
    downAngle: 180,
    upAngleTolerance: 20,
    downAngleTolerance: 15,
    formRules: formRules['sit-up'] || [],
  },
};

export type SupportedExercise = keyof typeof EXERCISE_CONFIGS;

export function getExerciseConfig(exercise: string): ExerciseConfig | undefined {
  const key = exercise.toLowerCase().replace(' ', '-') as SupportedExercise;
  return EXERCISE_CONFIGS[key];
}

export function getAvailableExercises(): string[] {
  return Object.values(EXERCISE_CONFIGS).map((config) => config.name);
}
