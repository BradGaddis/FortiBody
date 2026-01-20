import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise } from '../exercise/exerciseLibrary';

interface Set {
  reps: number;
  weight: number;
}

interface WorkoutSession {
  exerciseId: string;
  date: Date;
  sets: Set[];
  totalVolume: number; // weight × reps × sets
  duration: number; // minutes
  perceivedExertion?: number;
}

interface ProgressionPlan {
  targetSets: number;
  targetReps: number;
  targetWeight: number;
  progressionType: 'linear' | 'double' | 'wave' | 'deload';
  weekNumber: number;
}

interface PersonalRecord {
  date: Date;
  oneRepMax: number;
  sets: Set[];
  totalVolume: number;
}

class ProgressiveOverloadEngine {
  private PROGRESSION_KEY = '@progression_data';
  private PR_KEY = '@personal_records';

  async getProgressionData(): Promise<{
    currentPlan: ProgressionPlan | null;
    history: ProgressionPlan[];
    prs: PersonalRecord[];
  }> {
    try {
      const stored = await AsyncStorage.getItem(this.PROGRESSION_KEY);
      return stored ? JSON.parse(stored) : {
        currentPlan: null,
        history: [],
        prs: []
      };
    } catch (error) {
      console.error('Error loading progression data:', error);
      return { currentPlan: null, history: [], prs: [] };
    }
  }

  async saveWorkoutSession(session: WorkoutSession): Promise<void> {
    try {
      const progressionData = await this.getProgressionData();
      const updatedPRs = await this.updatePersonalRecords(session, progressionData.prs);
      
      // Save session
      const sessionsKey = `${session.exerciseId}_sessions`;
      const existingSessions = await AsyncStorage.getItem(sessionsKey);
      const sessions = existingSessions ? JSON.parse(existingSessions) : [];
      sessions.push(session);
      await AsyncStorage.setItem(sessionsKey, JSON.stringify(sessions));

      // Update progression plan
      const newPlan = await this.generateNextPlan(session, progressionData.currentPlan);
      progressionData.history.push(newPlan);
      await AsyncStorage.setItem(this.PROGRESSION_KEY, JSON.stringify({
        ...progressionData,
        currentPlan: newPlan,
        prs: updatedPRs
      }));

    } catch (error) {
      console.error('Error saving workout session:', error);
    }
  }

  private async updatePersonalRecords(
    currentSession: WorkoutSession,
    existingPRs: PersonalRecord[]
  ): Promise<PersonalRecord[]> {
    const exercisePRs = existingPRs.filter(pr => pr.exerciseId === currentSession.exerciseId);
    
    // Calculate new records
    const newPR: PersonalRecord = {
      date: currentSession.date,
      oneRepMax: this.calculate1RM(currentSession),
      sets: currentSession.sets,
      totalVolume: currentSession.totalVolume
    };

    // Update PRs if new record is better
    if (exercisePRs.length === 0 || newPR.oneRepMax > Math.max(...exercisePRs.map(pr => pr.oneRepMax))) {
      exercisePRs.push(newPR);
    }

    return existingPRs;
  }

  private calculate1RM(session: WorkoutSession): number {
    // Calculate estimated 1RM using Epley formula or best actual 1RM set
    const bestSet = session.sets.reduce((best, set) => {
      const set1RM = this.calculateSet1RM(set);
      return set1RM > (best ? this.calculateSet1RM(best) : 0) ? set : best;
    }, null as Set | null);

    return bestSet ? this.calculateSet1RM(bestSet) : 0;
  }

  private calculateSet1RM(set: Set): number {
    if (set.reps <= 1) {
      return set.weight;
    }
    // Epley formula: 1RM = weight × (1 + reps/30)
    return Math.round(set.weight * (1 + set.reps / 30));
  }

  private async generateNextPlan(
    currentSession: WorkoutSession,
    currentPlan: ProgressionPlan | null
  ): Promise<ProgressionPlan> {
    const history = await this.getProgressionData();
    const weekNumber = currentPlan ? currentPlan.weekNumber + 1 : 1;
    
    // Determine progression type based on performance
    let progressionType: ProgressionPlan['progressionType'] = 'linear';
    
    if (currentSession.perceivedExertion) {
      if (currentSession.perceivedExertion <= 4) {
        progressionType = 'wave'; // Increase next week
      } else if (currentSession.perceivedExertion >= 8) {
        progressionType = 'deload'; // Reduce intensity next week
      }
    }

    // Calculate next targets
    const bestSet = currentSession.sets.reduce((best, set) => {
      const set1RM = this.calculateSet1RM(set);
      return set1RM > (best ? this.calculateSet1RM(best) : 0) ? set : best;
    }, null as Set | null);

    const baseWeight = bestSet ? bestSet.weight : 0;
    const baseReps = bestSet ? bestSet.reps : 1;

    let targetWeight = baseWeight;
    let targetReps = baseReps;

    switch (progressionType) {
      case 'linear':
        targetWeight = baseWeight + 2.5; // 5lb increase
        targetReps = baseReps;
        break;
      case 'double':
        targetWeight = baseWeight;
        targetReps = Math.min(baseReps + 2, 12);
        break;
      case 'wave':
        targetWeight = baseWeight + 5; // 10lb increase
        targetReps = baseReps;
        break;
      case 'deload':
        targetWeight = baseWeight * 0.8; // 20% reduction
        targetReps = baseReps;
        break;
    }

    return {
      weekNumber,
      targetSets: currentSession.sets.length,
      targetReps,
      targetWeight,
      progressionType
    };
  }

  async getProgressionRecommendation(exerciseId: string): Promise<{
    currentPlan: ProgressionPlan | null;
    recommendation: string;
    targetWeight: number;
    targetReps: number;
  }> {
    const progressionData = await this.getProgressionData();
    const currentPlan = progressionData.currentPlan;
    const exercisePRs = progressionData.prs.filter(pr => pr.exerciseId === exerciseId);
    const currentPR = exercisePRs.length > 0 ? Math.max(...exercisePRs.map(pr => pr.oneRepMax)) : 0;

    let recommendation = 'No current plan';
    let targetWeight = 0;
    let targetReps = 8;

    if (currentPlan) {
      targetWeight = currentPlan.targetWeight;
      targetReps = currentPlan.targetReps;
      
      switch (currentPlan.progressionType) {
        case 'linear':
          recommendation = `Continue linear progression: ${targetWeight}lbs for ${targetReps} reps`;
          break;
        case 'double':
          recommendation = `Double progression: Target ${targetReps} reps at ${targetWeight}lbs`;
          break;
        case 'wave':
          recommendation = `Wave loading week: Increase to ${targetWeight}lbs`;
          break;
        case 'deload':
          recommendation = `Deload week: Reduce to ${targetWeight}lbs for recovery`;
          break;
      }
    } else if (currentPR > 0) {
      targetWeight = currentPR * 0.8; // Start at 80% of PR
      recommendation = `Start with ${targetWeight}lbs (${targetReps} reps) - 80% of your PR`;
    }

    return {
      currentPlan,
      recommendation,
      targetWeight,
      targetReps
    };
  }

  async generateWorkoutPlan(
    exerciseId: string,
    weeks: number = 8,
    startingWeight?: number
  ): Promise<ProgressionPlan[]> {
    const progressionData = await this.getProgressionData();
    const exercisePRs = progressionData.prs.filter(pr => pr.exerciseId === exerciseId);
    const currentPR = exercisePRs.length > 0 ? Math.max(...exercisePRs.map(pr => pr.oneRepMax)) : 0;
    
    const baseWeight = startingWeight || (currentPR > 0 ? currentPR * 0.7 : 50); // Start at 70% of PR or 50lbs default
    const plans: ProgressionPlan[] = [];

    for (let week = 1; week <= weeks; week++) {
      let progressionType: ProgressionPlan['progressionType'] = 'linear';
      let targetWeight = baseWeight + (week - 1) * 2.5; // 2.5lb per week
      
      // Insert deload week every 4th week
      if (week % 4 === 0) {
        progressionType = 'deload';
        targetWeight = (baseWeight + (week - 2) * 2.5) * 0.8; // 20% reduction
      }
      
      // Wave loading every 6th week
      if (week % 6 === 0 && progressionType !== 'deload') {
        progressionType = 'wave';
        targetWeight = (baseWeight + (week - 1) * 2.5) + 5; // Extra 5lb for wave
      }

      plans.push({
        weekNumber: week,
        targetSets: 3,
        targetReps: 8,
        targetWeight: Math.round(targetWeight),
        progressionType
      });
    }

    return plans;
  }
}

export default ProgressiveOverloadEngine;