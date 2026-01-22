import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FlexibilityAssessment,
  FlexibilityProfile,
  FlexibilityScore,
  FlexibilityTest,
  FlexibilityGrade,
} from '../../types/flexibility';
import { getTestById } from './tests';
import { 
  calculateAngle, 
  getLandmark, 
  POSE_LANDMARKS,
  normalizeScore,
  getGradeFromScore,
  calculateSymmetry,
} from './geometry';

const FLEXIBILITY_PROFILE_KEY = '@flexibility_profile';
const FLEXIBILITY_HISTORY_KEY = '@flexibility_history';

const TEST_WEIGHTS: Record<string, number> = {
  hip_flexion: 1.5,
  spine_flexion: 2.0,
  shoulder_flexion: 1.2,
  ankle_dorsiflexion: 1.0,
  knee_flexion: 1.0,
};

function getTestWeight(testId: string): number {
  for (const [prefix, weight] of Object.entries(TEST_WEIGHTS)) {
    if (testId.startsWith(prefix)) {
      return weight;
    }
  }
  return 1.0;
}

export function calculateFlexindexFromScores(scores: FlexibilityScore[]): number {
  const weightedScores = scores.map(s => ({
    score: s.score,
    weight: getTestWeight(s.testId),
  }));
  
  const totalWeight = weightedScores.reduce((sum, s) => sum + s.weight, 0);
  if (totalWeight === 0) return 0;
  
  const weightedSum = weightedScores.reduce((sum, s) => sum + (s.score * s.weight), 0);
  return weightedSum / totalWeight;
}

export function getOverallGrade(scores: FlexibilityScore[]): FlexibilityGrade {
  if (scores.length === 0) return 'limited';
  
  const flexindex = calculateFlexindexFromScores(scores);
  
  if (flexindex >= 80) return 'excellent';
  if (flexindex >= 65) return 'good';
  if (flexindex >= 50) return 'fair';
  if (flexindex >= 35) return 'limited';
  return 'restricted';
}

export function analyzeWeakAndStrongAreas(scores: FlexibilityScore[]): {
  weakAreas: string[];
  strongAreas: string[];
} {
  const bodyPartScores: Record<string, number[]> = {};
  
  for (const score of scores) {
    const test = getTestById(score.testId);
    if (test) {
      if (!bodyPartScores[test.bodyPart]) {
        bodyPartScores[test.bodyPart] = [];
      }
      const scores = bodyPartScores[test.bodyPart];
      if (scores) {
        scores.push(score.score);
      }
    }
  }
  
  const bodyPartAverages: Record<string, number> = {};
  for (const [part, partScores] of Object.entries(bodyPartScores)) {
    bodyPartAverages[part] = partScores.reduce((a, b) => a + b, 0) / partScores.length;
  }
  
  const sortedParts = Object.entries(bodyPartAverages)
    .sort((a, b) => a[1] - b[1]);
  
  const weakAreas = sortedParts.slice(0, 2).map(([part]) => part);
  const strongAreas = sortedParts.slice(-2).map(([part]) => part);
  
  return { weakAreas, strongAreas };
}

export function generateRecommendations(
  scores: FlexibilityScore[],
  weakAreas: string[]
): string[] {
  const recommendations: string[] = [];
  
  for (const area of weakAreas) {
    switch (area) {
      case 'hip':
        recommendations.push('Incorporate hip circles and leg swings into your warm-up');
        recommendations.push('Try pigeon pose and butterfly stretches daily');
        break;
      case 'spine':
        recommendations.push('Practice cat-cow stretches and child\'s pose');
        recommendations.push('Add daily spinal rotation exercises');
        break;
      case 'shoulder':
        recommendations.push('Use wall slides and doorframe stretches');
        recommendations.push('Incorporate shoulder roll exercises');
        break;
      case 'ankle':
        recommendations.push('Practice ankle dorsiflexion stretches against a wall');
        recommendations.push('Use a foam roller on calf muscles');
        break;
      case 'knee':
        recommendations.push('Include quad and hamstring stretches');
        recommendations.push('Practice seated forward folds');
        break;
    }
  }
  
  return recommendations;
}

export function createAssessment(
  scores: FlexibilityScore[],
  durationMinutes: number
): FlexibilityAssessment {
  const flexindex = calculateFlexindexFromScores(scores);
  const overallGrade = getOverallGrade(scores);
  const { weakAreas, strongAreas } = analyzeWeakAndStrongAreas(scores);
  const recommendations = generateRecommendations(scores, weakAreas);
  
  return {
    id: Date.now().toString(),
    date: new Date(),
    duration: durationMinutes,
    scores,
    flexindex,
    overallGrade,
    weakAreas,
    strongAreas,
    recommendations,
  };
}

export async function saveAssessment(assessment: FlexibilityAssessment): Promise<void> {
  try {
    const existing = await getAssessmentHistory();
    const updated = [assessment, ...existing];
    await AsyncStorage.setItem(FLEXIBILITY_HISTORY_KEY, JSON.stringify(updated));
    await updateProfileWithAssessment(assessment);
  } catch (error) {
    console.error('Failed to save flexibility assessment:', error);
    throw error;
  }
}

export async function getAssessmentHistory(): Promise<FlexibilityAssessment[]> {
  try {
    const stored = await AsyncStorage.getItem(FLEXIBILITY_HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Failed to load flexibility history:', error);
    return [];
  }
}

export async function updateProfileWithAssessment(
  assessment: FlexibilityAssessment
): Promise<void> {
  try {
    const profile = await getProfile();
    
    profile.assessments.push(assessment);
    
    if (!profile.baseline || assessment.scores.length > profile.baseline.scores.length) {
      profile.baseline = assessment;
    }
    
    if (profile.assessments.length >= 2) {
      const recent = profile.assessments[0]!;
      const previous = profile.assessments[1]!;
      const improvement = recent.flexindex - previous.flexindex;
      
      if (improvement > 5) {
        profile.trend = 'improving';
      } else if (improvement < -5) {
        profile.trend = 'declining';
      } else {
        profile.trend = 'stable';
      }
    }
    
    const { weakAreas, strongAreas } = analyzeWeakAndStrongAreas(assessment.scores);
    profile.weakAreas = weakAreas;
    profile.strongAreas = strongAreas;
    
    await AsyncStorage.setItem(FLEXIBILITY_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Failed to update flexibility profile:', error);
  }
}

export async function getProfile(): Promise<FlexibilityProfile> {
  try {
    const stored = await AsyncStorage.getItem(FLEXIBILITY_PROFILE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load flexibility profile:', error);
  }
  
  return {
    userId: 'default',
    assessments: [],
    baseline: null,
    trend: 'stable',
    weakAreas: [],
    strongAreas: [],
  };
}

export async function deleteAssessment(id: string): Promise<void> {
  try {
    const history = await getAssessmentHistory();
    const updated = history.filter(a => a.id !== id);
    await AsyncStorage.setItem(FLEXIBILITY_HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to delete flexibility assessment:', error);
    throw error;
  }
}

export function calculateScoreFromLandmarks(
  test: FlexibilityTest,
  landmarks: any[]
): FlexibilityScore {
  const [p1Idx, p2Idx, p3Idx] = test.landmarks;
  
  const p1 = landmarks[p1Idx];
  const p2 = landmarks[p2Idx];
  const p3 = landmarks[p3Idx];
  
  if (!p1 || !p2 || !p3) {
    return {
      testId: test.id,
      timestamp: new Date(),
      maxAngle: 0,
      score: 0,
      grade: 'restricted',
    };
  }
  
  const maxAngle = calculateAngle(p1, p2, p3);
  const score = normalizeScore(maxAngle, test.minAcceptable, test.targetAngle);
  const grade = getGradeFromScore(score) as FlexibilityGrade;
  
  return {
    testId: test.id,
    timestamp: new Date(),
    maxAngle,
    score,
    grade,
  };
}

export function compareToPreviousAssessment(
  current: FlexibilityAssessment,
  previous: FlexibilityAssessment | null
): {
  improved: string[];
  declined: string[];
  unchanged: string[];
} {
  if (!previous) {
    return { improved: [], declined: [], unchanged: [] };
  }
  
  const currentMap = new Map(current.scores.map(s => [s.testId, s]));
  const previousMap = new Map(previous.scores.map(s => [s.testId, s]));
  
  const improved: string[] = [];
  const declined: string[] = [];
  const unchanged: string[] = [];
  
  for (const [testId, currentScore] of currentMap) {
    const previousScore = previousMap.get(testId);
    if (previousScore) {
      const diff = currentScore.score - previousScore.score;
      if (diff > 10) {
        improved.push(testId);
      } else if (diff < -10) {
        declined.push(testId);
      } else {
        unchanged.push(testId);
      }
    }
  }
  
  return { improved, declined, unchanged };
}
