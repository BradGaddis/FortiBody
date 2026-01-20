import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import type { Pose, Keypoint } from '../../types/pose';

let detector: poseDetection.PoseDetector | null = null;
let isInitialized = false;

export async function initializePoseDetector(): Promise<boolean> {
  if (isInitialized && detector) {
    return true;
  }

  try {
    await tf.ready();
    
    const model = poseDetection.SupportedModels.MoveNet;
    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      enableSmoothing: true,
    };
    
    detector = await poseDetection.createDetector(model, detectorConfig);
    isInitialized = true;
    
    console.log('Pose detector initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize pose detector:', error);
    return false;
  }
}

export async function detectPose(imageSource: HTMLImageElement | ImageBitmap): Promise<Pose | null> {
  if (!detector) {
    const initialized = await initializePoseDetector();
    if (!initialized || !detector) {
      return null;
    }
  }

  try {
    const poses = await detector!.estimatePoses(imageSource);
    
    if (poses.length === 0) {
      return null;
    }

    const pose = poses[0];
    if (!pose) return null;
    
    const keypoints: Keypoint[] = pose.keypoints.map((kp) => ({
      x: kp.x,
      y: kp.y,
      score: kp.score ?? 0,
      name: kp.name || '',
    }));

    return {
      keypoints,
      score: pose.score ?? 0,
    };
  } catch (error) {
    console.error('Pose detection error:', error);
    return null;
  }
}

export async function detectPoses(imageSources: (HTMLImageElement | ImageBitmap)[]): Promise<Pose[]> {
  if (!detector) {
    const initialized = await initializePoseDetector();
    if (!initialized || !detector) {
      return [];
    }
  }

  try {
    const results: Pose[] = [];
    
    for (const imageSource of imageSources) {
      const pose = await detectPose(imageSource);
      if (pose) {
        results.push(pose);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Multi-pose detection error:', error);
    return [];
  }
}

export function getKeypoint(keypoints: Keypoint[], name: string): Keypoint | undefined {
  return keypoints.find((kp) => kp.name === name);
}

export function getKeypointByIndex(keypoints: Keypoint[], index: number): Keypoint | undefined {
  if (index < 0 || index >= keypoints.length) return undefined;
  return keypoints[index];
}

export function isPersonVisible(pose: Pose, minConfidence = 0.3): boolean {
  if (pose.score < minConfidence) return false;
  
  const requiredKeypoints = ['nose', 'left_shoulder', 'right_shoulder', 'left_hip', 'right_hip'];
  const visibleKeypoints = requiredKeypoints.filter(
    (name) => getKeypoint(pose.keypoints, name)?.score ?? 0 >= minConfidence
  );
  
  return visibleKeypoints.length >= 3;
}

export function getPoseOrientation(keypoints: Keypoint[]): 'front' | 'side' | 'back' | 'unknown' {
  const leftShoulder = getKeypoint(keypoints, 'left_shoulder');
  const rightShoulder = getKeypoint(keypoints, 'right_shoulder');
  const leftHip = getKeypoint(keypoints, 'left_hip');
  const rightHip = getKeypoint(keypoints, 'right_hip');
  
  if (!leftShoulder || !rightShoulder) return 'unknown';
  
  const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
  
  if (leftHip && rightHip) {
    const hipWidth = Math.abs(rightHip.x - leftHip.x);
    const ratio = hipWidth / shoulderWidth;
    
    if (ratio > 0.7 && ratio < 1.3) {
      return 'front';
    }
  }
  
  if (shoulderWidth > 0.3) {
    return 'front';
  }
  
  return 'side';
}

export async function disposeDetector(): Promise<void> {
  if (detector) {
    detector.dispose();
    detector = null;
    isInitialized = false;
  }
}

export function isDetectorReady(): boolean {
  return isInitialized && detector !== null;
}
