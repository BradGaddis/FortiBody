import type { RepState, FormFeedback, RepData, ExerciseConfig, Keypoint, BodyAngles } from '../../types/pose';
import { extractBodyAngles } from './formAnalysis';
import { getExerciseConfig } from './exerciseConfigs';

const REP_DEBOUNCE_MS = 500;
const PHASE_CHANGE_COOLDOWN = 300;

export function createInitialRepState(): RepState {
  return {
    phase: 'IDLE',
    repCount: 0,
    lastPhaseChangeTime: 0,
    consecutiveGoodForm: 0,
  };
}

export function updateRepState(
  currentState: RepState,
  exercise: string,
  currentAngle: number,
  angles: BodyAngles,
  keypoints: Keypoint[],
  formFeedback: FormFeedback[]
): {
  newState: RepState;
  repCompleted: boolean;
  feedback: FormFeedback[];
} {
  const config = getExerciseConfig(exercise);
  if (!config) {
    return { newState: currentState, repCompleted: false, feedback: [] };
  }

  const now = Date.now();
  const timeSinceLastChange = now - currentState.lastPhaseChangeTime;
  
  if (timeSinceLastChange < PHASE_CHANGE_COOLDOWN) {
    return { newState: currentState, repCompleted: false, feedback: [] };
  }

  const isUp = isInAngleRange(currentAngle, config.upAngle, config.upAngleTolerance);
  const isDown = isInAngleRange(currentAngle, config.downAngle, config.downAngleTolerance);
  
  let newState = { ...currentState };
  let repCompleted = false;
  let newFeedback: FormFeedback[] = [];
  
  switch (currentState.phase) {
    case 'IDLE':
      if (isDown) {
        newState = {
          ...currentState,
          phase: 'DOWN',
          lastPhaseChangeTime: now,
        };
      } else if (isUp) {
        newState = {
          ...currentState,
          phase: 'UP',
          lastPhaseChangeTime: now,
        };
      }
      break;
      
    case 'DOWN':
      if (isUp) {
        newState = {
          ...currentState,
          phase: 'UP',
          lastPhaseChangeTime: now,
        };
      }
      break;
      
    case 'UP':
      if (isDown) {
        newState = {
          ...currentState,
          phase: 'DOWN',
          lastPhaseChangeTime: now,
        };
      } else if (timeSinceLastChange > REP_DEBOUNCE_MS) {
        repCompleted = true;
        const goodFormCount = formFeedback.filter(f => f.type === 'success').length;
        const totalFeedback = formFeedback.length || 1;
        const formAccuracy = Math.round((goodFormCount / totalFeedback) * 100);
        
        newState = {
          ...currentState,
          phase: 'IDLE',
          repCount: currentState.repCount + 1,
          lastPhaseChangeTime: now,
          consecutiveGoodForm: formAccuracy > 70 ? currentState.consecutiveGoodForm + 1 : 0,
        };
        
        newFeedback = [{ type: 'success', message: `Rep ${currentState.repCount + 1} completed!` }];
      }
      break;
      
    case 'COMPLETE':
      newState = {
        ...currentState,
        phase: 'IDLE',
        lastPhaseChangeTime: now,
      };
      break;
  }
  
  return { newState, repCompleted, feedback: newFeedback };
}

export function checkForm(
  exercise: string,
  angles: BodyAngles,
  keypoints: Keypoint[]
): FormFeedback[] {
  const config = getExerciseConfig(exercise);
  if (!config) return [];
  
  const feedback: FormFeedback[] = [];
  
  for (const rule of config.formRules) {
    if (rule.check(angles, keypoints)) {
      feedback.push({
        type: rule.type,
        message: rule.message,
      });
    }
  }
  
  return feedback;
}

export function createRepData(
  repNumber: number,
  upAngle: number,
  downAngle: number,
  duration: number,
  feedback: FormFeedback[]
): RepData {
  const goodFormCount = feedback.filter(f => f.type === 'success').length;
  const totalFeedback = feedback.length || 1;
  
  return {
    repNumber,
    upAngle,
    downAngle,
    duration,
    formAccuracy: Math.round((goodFormCount / totalFeedback) * 100),
    feedback,
  };
}

export function calculateRepQuality(
  rep: RepData,
  targetUpAngle: number,
  targetDownAngle: number
): number {
  const upAccuracy = 100 - Math.abs(rep.upAngle - targetUpAngle);
  const downAccuracy = 100 - Math.abs(rep.downAngle - targetDownAngle);
  
  const avgAccuracy = (upAccuracy + downAccuracy) / 2;
  const formBonus = rep.formAccuracy * 0.2;
  
  return Math.min(100, Math.max(0, avgAccuracy + formBonus));
}

export function getPhaseDisplayName(phase: RepState['phase']): string {
  switch (phase) {
    case 'IDLE':
      return 'Get Ready';
    case 'DOWN':
      return 'Going Down';
    case 'UP':
      return 'Going Up';
    case 'COMPLETE':
      return 'Complete!';
    default:
      return '';
  }
}

function isInAngleRange(currentAngle: number, targetAngle: number, tolerance: number): boolean {
  return Math.abs(currentAngle - targetAngle) <= tolerance;
}
