export type BodyPart = 
  | 'ankle' 
  | 'knee' 
  | 'hip' 
  | 'spine' 
  | 'shoulder' 
  | 'elbow' 
  | 'wrist';

export type Side = 'left' | 'right' | 'center';

export type FlexibilityGrade = 'excellent' | 'good' | 'fair' | 'limited' | 'restricted';

export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseResult {
  landmarks: Landmark[];
  timestamp: number;
}

export interface FlexibilityTest {
  id: string;
  name: string;
  bodyPart: BodyPart;
  side: Side;
  landmarks: [number, number, number];
  targetAngle: number;
  minAcceptable: number;
  instructions: string;
  holdDuration: number; // seconds
}

export interface FlexibilityScore {
  testId: string;
  timestamp: Date;
  maxAngle: number;
  minAngle?: number;
  symmetry?: number;
  score: number; // 0-100
  grade: FlexibilityGrade;
}

export interface FlexibilityAssessment {
  id: string;
  date: Date;
  duration: number; // minutes
  scores: FlexibilityScore[];
  flexindex: number; // weighted composite 0-100
  overallGrade: FlexibilityGrade;
  weakAreas: string[];
  strongAreas: string[];
  recommendations: string[];
}

export interface FlexibilityProfile {
  userId: string;
  assessments: FlexibilityAssessment[];
  baseline: FlexibilityAssessment | null;
  trend: 'improving' | 'stable' | 'declining';
  weakAreas: string[];
  strongAreas: string[];
}

export interface AngleResult {
  angle: number;
  confidence: number;
  isStable: boolean;
}

export interface TestSessionState {
  currentTestIndex: number;
  isRecording: boolean;
  angleHistory: number[];
  maxAngle: number;
  minAngle: number;
  startTime: number;
}

export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

export type PoseLandmarkKey = typeof POSE_LANDMARKS[keyof typeof POSE_LANDMARKS];
