import { Landmark, PoseLandmarkKey, POSE_LANDMARKS } from '../../types/flexibility';

export { POSE_LANDMARKS };

export function calculateAngle(p1: Landmark, p2: Landmark, p3: Landmark): number {
  const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - 
                  Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let angle = Math.abs(radians * 180 / Math.PI);
  if (angle > 180) {
    angle = 360 - angle;
  }
  return angle;
}

export function getLandmark(landmarks: Landmark[], index: PoseLandmarkKey): Landmark {
  const landmark = landmarks[index];
  if (!landmark) {
    throw new Error(`Landmark at index ${index} not found`);
  }
  return landmark;
}

export function calculateJointAngle(
  landmarks: Landmark[],
  joint: 'hip' | 'knee' | 'ankle' | 'shoulder' | 'elbow' | 'wrist' | 'spine',
  side: 'left' | 'right'
): number {
  const isLeft = side === 'left';
  
  switch (joint) {
    case 'hip':
      return calculateAngle(
        getLandmark(landmarks, isLeft ? POSE_LANDMARKS.LEFT_SHOULDER : POSE_LANDMARKS.RIGHT_SHOULDER),
        getLandmark(landmarks, isLeft ? POSE_LANDMARKS.LEFT_HIP : POSE_LANDMARKS.RIGHT_HIP),
        getLandmark(landmarks, isLeft ? POSE_LANDMARKS.LEFT_KNEE : POSE_LANDMARKS.RIGHT_KNEE)
      );
    case 'knee':
      return calculateAngle(
        getLandmark(landmarks, isLeft ? POSE_LANDMARKS.LEFT_HIP : POSE_LANDMARKS.RIGHT_HIP),
        getLandmark(landmarks, isLeft ? POSE_LANDMARKS.LEFT_KNEE : POSE_LANDMARKS.RIGHT_KNEE),
        getLandmark(landmarks, isLeft ? POSE_LANDMARKS.LEFT_ANKLE : POSE_LANDMARKS.RIGHT_ANKLE)
      );
    case 'ankle':
      return calculateAngle(
        getLandmark(landmarks, isLeft ? POSE_LANDMARKS.LEFT_KNEE : POSE_LANDMARKS.RIGHT_KNEE),
        getLandmark(landmarks, isLeft ? POSE_LANDMARKS.LEFT_ANKLE : POSE_LANDMARKS.RIGHT_ANKLE),
        getLandmark(landmarks, isLeft ? POSE_LANDMARKS.LEFT_FOOT_INDEX : POSE_LANDMARKS.RIGHT_FOOT_INDEX)
      );
    case 'shoulder':
      return calculateAngle(
        getLandmark(landmarks, isLeft ? POSE_LANDMARKS.LEFT_HIP : POSE_LANDMARKS.RIGHT_HIP),
        getLandmark(landmarks, isLeft ? POSE_LANDMARKS.LEFT_SHOULDER : POSE_LANDMARKS.RIGHT_SHOULDER),
        getLandmark(landmarks, isLeft ? POSE_LANDMARKS.LEFT_ELBOW : POSE_LANDMARKS.RIGHT_ELBOW)
      );
    case 'elbow':
      return calculateAngle(
        getLandmark(landmarks, isLeft ? POSE_LANDMARKS.LEFT_SHOULDER : POSE_LANDMARKS.RIGHT_SHOULDER),
        getLandmark(landmarks, isLeft ? POSE_LANDMARKS.LEFT_ELBOW : POSE_LANDMARKS.RIGHT_ELBOW),
        getLandmark(landmarks, isLeft ? POSE_LANDMARKS.LEFT_WRIST : POSE_LANDMARKS.RIGHT_WRIST)
      );
    case 'wrist':
      return calculateAngle(
        getLandmark(landmarks, isLeft ? POSE_LANDMARKS.LEFT_ELBOW : POSE_LANDMARKS.RIGHT_ELBOW),
        getLandmark(landmarks, isLeft ? POSE_LANDMARKS.LEFT_WRIST : POSE_LANDMARKS.RIGHT_WRIST),
        { x: getLandmark(landmarks, isLeft ? POSE_LANDMARKS.LEFT_WRIST : POSE_LANDMARKS.RIGHT_WRIST).x + 0.1, y: getLandmark(landmarks, isLeft ? POSE_LANDMARKS.LEFT_WRIST : POSE_LANDMARKS.RIGHT_WRIST).y, z: 0, visibility: 1 }
      );
    case 'spine':
      return calculateAngle(
        getLandmark(landmarks, POSE_LANDMARKS.LEFT_SHOULDER),
        getLandmark(landmarks, POSE_LANDMARKS.LEFT_HIP),
        { x: getLandmark(landmarks, POSE_LANDMARKS.LEFT_HIP).x, y: getLandmark(landmarks, POSE_LANDMARKS.LEFT_HIP).y + 0.3, z: 0, visibility: 1 }
      );
    default:
      return 0;
  }
}

export function calculateSymmetry(leftAngle: number, rightAngle: number): number {
  const diff = Math.abs(leftAngle - rightAngle);
  return Math.max(0, 100 - (diff / 10) * 100);
}

export function calculateStability(angles: number[]): number {
  if (angles.length < 2) return 1;
  const mean = angles.reduce((a, b) => a + b, 0) / angles.length;
  const variance = angles.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / angles.length;
  const stdDev = Math.sqrt(variance);
  return stdDev;
}

export function isPoseStable(landmarks: Landmark[], threshold: number = 0.05): boolean {
  const stabilityThreshold = 0.02;
  const keyPoints = [
    POSE_LANDMARKS.LEFT_SHOULDER,
    POSE_LANDMARKS.RIGHT_SHOULDER,
    POSE_LANDMARKS.LEFT_HIP,
    POSE_LANDMARKS.RIGHT_HIP,
    POSE_LANDMARKS.LEFT_KNEE,
    POSE_LANDMARKS.RIGHT_KNEE,
  ];

  for (const pointIndex of keyPoints) {
    const point = landmarks[pointIndex];
    if (!point || point.visibility < 0.5) {
      return false;
    }
  }

  return true;
}

export function normalizeScore(rawAngle: number, minAcceptable: number, target: number): number {
  if (rawAngle >= target) return 100;
  if (rawAngle <= minAcceptable) return 0;
  return ((rawAngle - minAcceptable) / (target - minAcceptable)) * 100;
}

export function getGradeFromScore(score: number): 'excellent' | 'good' | 'fair' | 'limited' | 'restricted' {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  if (score >= 40) return 'limited';
  return 'restricted';
}

export function calculateFlexindex(scores: { score: number; weight: number }[]): number {
  const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
  const weightedSum = scores.reduce((sum, s) => sum + (s.score * s.weight), 0);
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function distance2D(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function distance3D(p1: Landmark, p2: Landmark): number {
  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) + 
    Math.pow(p2.y - p1.y, 2) + 
    Math.pow(p2.z - p1.z, 2)
  );
}
