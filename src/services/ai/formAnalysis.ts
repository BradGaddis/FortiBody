import type { Keypoint, BodyAngles, Point } from '../../types/pose';

export function calculateAngle(a: Point, b: Point, c: Point): number {
  const ab = { x: b.x - a.x, y: b.y - a.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };
  
  const dotProduct = ab.x * bc.x + ab.y * bc.y;
  const magnitudeAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
  const magnitudeBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y);
  
  if (magnitudeAB === 0 || magnitudeBC === 0) return 0;
  
  const cosAngle = dotProduct / (magnitudeAB * magnitudeBC);
  const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
  
  return (angle * 180) / Math.PI;
}

export function extractBodyAngles(keypoints: Keypoint[]): BodyAngles {
  const angles: BodyAngles = {};
  
  const getPoint = (index: number): Point | null => {
    const kp = keypoints[index];
    if (!kp || kp.score < 0.3) return null;
    return { x: kp.x, y: kp.y };
  };
  
  const leftShoulder = getPoint(5);
  const rightShoulder = getPoint(6);
  const leftElbow = getPoint(7);
  const rightElbow = getPoint(8);
  const leftWrist = getPoint(9);
  const rightWrist = getPoint(10);
  const leftHip = getPoint(11);
  const rightHip = getPoint(12);
  const leftKnee = getPoint(13);
  const rightKnee = getPoint(14);
  const leftAnkle = getPoint(15);
  const rightAnkle = getPoint(16);
  
  if (leftShoulder && rightShoulder && leftElbow) {
    angles.leftShoulder = leftShoulder.y;
    angles.leftElbow = calculateAngle(leftShoulder, leftElbow, leftWrist || { x: leftElbow.x + 0.1, y: leftElbow.y });
  }
  
  if (rightShoulder && rightElbow && rightWrist) {
    angles.rightShoulder = rightShoulder.y;
    angles.rightElbow = calculateAngle(rightShoulder, rightElbow, rightWrist);
  }
  
  if (leftHip && leftKnee && leftAnkle) {
    angles.leftHip = leftHip.y;
    angles.leftKnee = calculateAngle(leftHip, leftKnee, leftAnkle);
  }
  
  if (rightHip && rightKnee && rightAnkle) {
    angles.rightHip = rightHip.y;
    angles.rightKnee = calculateAngle(rightHip, rightKnee, rightAnkle);
  }
  
  if (leftShoulder && leftHip && leftKnee) {
    angles.leftHip = leftHip.y;
    angles.hipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
  }
  
  if (rightShoulder && rightHip && rightKnee) {
    angles.rightHip = rightHip.y;
    if (!angles.hipAngle) {
      angles.hipAngle = calculateAngle(rightShoulder, rightHip, rightKnee);
    }
  }
  
  if (leftWrist && leftElbow && leftShoulder) {
    angles.leftWrist = leftWrist.x;
  }
  
  if (rightWrist && rightElbow && rightShoulder) {
    angles.rightWrist = rightWrist.x;
  }
  
  if (leftAnkle && leftKnee && leftHip) {
    angles.leftAnkle = leftAnkle.x;
  }
  
  if (rightAnkle && rightKnee && rightHip) {
    angles.rightAnkle = rightAnkle.x;
  }
  
  return angles;
}

export function getExerciseAngles(keypoints: Keypoint[], exerciseKeypoints: [number, number, number]): {
  angle: number;
  confidence: number;
} | null {
  const [p1Idx, p2Idx, p3Idx] = exerciseKeypoints;
  
  const p1 = keypoints[p1Idx];
  const p2 = keypoints[p2Idx];
  const p3 = keypoints[p3Idx];
  
  if (!p1 || !p2 || !p3) return null;
  if (p1.score < 0.3 || p2.score < 0.3 || p3.score < 0.3) return null;
  
  const confidence = (p1.score + p2.score + p3.score) / 3;
  const angle = calculateAngle(
    { x: p1.x, y: p1.y },
    { x: p2.x, y: p2.y },
    { x: p3.x, y: p3.y }
  );
  
  return { angle, confidence };
}

export function isInAngleRange(
  currentAngle: number,
  targetAngle: number,
  tolerance: number
): boolean {
  return Math.abs(currentAngle - targetAngle) <= tolerance;
}

export function normalizeKeypoints(keypoints: Keypoint[], imageWidth: number, imageHeight: number): Keypoint[] {
  return keypoints.map((kp) => ({
    ...kp,
    x: kp.x / imageWidth,
    y: kp.y / imageHeight,
  }));
}
