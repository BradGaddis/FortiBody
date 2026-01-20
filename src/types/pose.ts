export interface Keypoint {
  x: number;
  y: number;
  score: number;
  name: string;
}

export interface Pose {
  keypoints: Keypoint[];
  score: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface BodyAngles {
  leftElbow?: number;
  rightElbow?: number;
  leftShoulder?: number;
  rightShoulder?: number;
  leftHip?: number;
  rightHip?: number;
  leftKnee?: number;
  rightKnee?: number;
  leftAnkle?: number;
  rightAnkle?: number;
  leftWrist?: number;
  rightWrist?: number;
  hipAngle?: number;
  kneeAngle?: number;
  ankleAngle?: number;
}

export interface FormFeedback {
  type: 'success' | 'warning' | 'error';
  message: string;
  joint?: string;
}

export interface ExerciseConfig {
  name: string;
  keypoints: [number, number, number];
  upAngle: number;
  downAngle: number;
  upAngleTolerance: number;
  downAngleTolerance: number;
  formRules: FormRule[];
}

export interface FormRule {
  name: string;
  check: (angles: BodyAngles, keypoints: Keypoint[]) => boolean;
  message: string;
  type: 'warning' | 'error';
}

export interface RepState {
  phase: 'IDLE' | 'DOWN' | 'UP' | 'COMPLETE';
  repCount: number;
  lastPhaseChangeTime: number;
  consecutiveGoodForm: number;
}

export interface WorkoutSession {
  exercise: string;
  startTime: Date;
  endTime?: Date;
  reps: RepData[];
  totalReps: number;
  averageRepQuality: number;
  formFeedbackHistory: FormFeedback[];
}

export interface RepData {
  repNumber: number;
  upAngle: number;
  downAngle: number;
  duration: number;
  formAccuracy: number;
  feedback: FormFeedback[];
}

export const COCO_KEYPOINT_NAMES = [
  'nose',
  'left_eye',
  'right_eye',
  'left_ear',
  'right_ear',
  'left_shoulder',
  'right_shoulder',
  'left_elbow',
  'right_elbow',
  'left_wrist',
  'right_wrist',
  'left_hip',
  'right_hip',
  'left_knee',
  'right_knee',
  'left_ankle',
  'right_ankle',
];

export const SKELETON_CONNECTIONS = [
  [5, 6],   // shoulders
  [5, 7],   // left shoulder to elbow
  [7, 9],   // left elbow to wrist
  [6, 8],   // right shoulder to elbow
  [8, 10],  // right elbow to wrist
  [5, 11],  // left shoulder to hip
  [6, 12],  // right shoulder to hip
  [11, 12], // hips
  [11, 13], // left hip to knee
  [13, 15], // left knee to ankle
  [12, 14], // right hip to knee
  [14, 16], // right knee to ankle
];
