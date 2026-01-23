import 'react-native-get-random-values';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import userStatsService from '../user/UserStatsService';
import streakService from '../streak/StreakService';
import {
  ExerciseSet,
  ExerciseSession,
  PersonalRecord,
  WorkoutTemplate,
  WorkoutHistory,
  PRType,
  TemplateExercise,
  calculateOneRepMax,
  calculateVolume,
} from './types';

const SESSIONS_KEY = '@fortibody_exercise_sessions';
const RECORDS_KEY = '@fortibody_personal_records';
const TEMPLATES_KEY = '@fortibody_workout_templates';
const HISTORY_KEY = '@fortibody_workout_history';

class ExerciseTrackingService {
  private static instance: ExerciseTrackingService;

  private constructor() {}

  static getInstance(): ExerciseTrackingService {
    if (!ExerciseTrackingService.instance) {
      ExerciseTrackingService.instance = new ExerciseTrackingService();
    }
    return ExerciseTrackingService.instance;
  }

  async startSession(
    exerciseId: string,
    exerciseName: string
  ): Promise<ExerciseSession> {
    const session: ExerciseSession = {
      id: uuidv4(),
      exerciseId,
      exerciseName,
      date: new Date(),
      sets: [],
      duration: 0,
      volume: 0,
      maxWeight: 0,
      totalReps: 0,
    };

    try {
      const sessions = await this.getSessions();
      sessions.push(session);
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
      return session;
    } catch (error) {
      console.error('Failed to start session:', error);
      throw error;
    }
  }

  async addSet(
    sessionId: string,
    set: Omit<ExerciseSet, 'id'>
  ): Promise<ExerciseSession | null> {
    try {
      const sessions = await this.getSessions();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);

      if (sessionIndex === -1) return null;

      const newSet: ExerciseSet = { ...set, id: uuidv4() };
      sessions[sessionIndex].sets.push(newSet);

      const completedSets = sessions[sessionIndex].sets.filter(
        s => s.isCompleted
      );
      sessions[sessionIndex].volume = calculateVolume(completedSets);
      sessions[sessionIndex].maxWeight = Math.max(
        ...completedSets.map(s => s.weight),
        0
      );
      sessions[sessionIndex].totalReps = completedSets.reduce(
        (sum, s) => sum + s.reps,
        0
      );

      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));

      const pr = await this.checkAndUpdatePR(sessions[sessionIndex]);
      if (pr) {
        sessions[sessionIndex].notes =
          (sessions[sessionIndex].notes || '') + `\nNew PR: ${pr.type}`;
      }

      return sessions[sessionIndex];
    } catch (error) {
      console.error('Failed to add set:', error);
      throw error;
    }
  }

  async completeSet(
    sessionId: string,
    setId: string,
    reps: number,
    weight: number
  ): Promise<ExerciseSession | null> {
    try {
      const sessions = await this.getSessions();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);

      if (sessionIndex === -1) return null;

      const setIndex = sessions[sessionIndex].sets.findIndex(
        set => set.id === setId
      );
      if (setIndex === -1) return null;

      sessions[sessionIndex].sets[setIndex] = {
        ...sessions[sessionIndex].sets[setIndex],
        reps,
        weight,
        isCompleted: true,
        timestamp: new Date(),
      };

      await this.updateSessionMetrics(sessions[sessionIndex]);
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));

      return sessions[sessionIndex];
    } catch (error) {
      console.error('Failed to complete set:', error);
      throw error;
    }
  }

  async endSession(
    sessionId: string,
    notes?: string,
    perceivedExertion?: number
  ): Promise<ExerciseSession | null> {
    try {
      const sessions = await this.getSessions();
      const sessionIndex = sessions.findIndex(s => s.id === sessionId);

      if (sessionIndex === -1) return null;

      const startTime = new Date(sessions[sessionIndex].date).getTime();
      const endTime = Date.now();
      sessions[sessionIndex].duration = Math.round(
        (endTime - startTime) / 1000
      );
      sessions[sessionIndex].notes = notes;
      sessions[sessionIndex].perceivedExertion = perceivedExertion;

      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));

      await this.addToHistory(sessions[sessionIndex]);
      return sessions[sessionIndex];
    } catch (error) {
      console.error('Failed to end session:', error);
      throw error;
    }
  }

  async getSessions(): Promise<ExerciseSession[]> {
    try {
      const data = await AsyncStorage.getItem(SESSIONS_KEY);
      const parsed = data ? JSON.parse(data) : [];
      return parsed.map((session: any) => ({
        ...session,
        date: new Date(session.date),
        sets: session.sets.map((set: any) => ({
          ...set,
          timestamp: set.timestamp ? new Date(set.timestamp) : undefined,
        })),
      }));
    } catch {
      return [];
    }
  }

  async getExerciseSessions(exerciseId: string): Promise<ExerciseSession[]> {
    const sessions = await this.getSessions();
    return sessions.filter(s => s.exerciseId === exerciseId);
  }

  async getRecentSessions(limit: number = 10): Promise<ExerciseSession[]> {
    const sessions = await this.getSessions();
    return sessions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async getPersonalRecords(): Promise<PersonalRecord[]> {
    try {
      const data = await AsyncStorage.getItem(RECORDS_KEY);
      const parsed = data ? JSON.parse(data) : [];
      return parsed.map((record: any) => ({
        ...record,
        date: new Date(record.date),
      }));
    } catch {
      return [];
    }
  }

  async getExercisePRs(exerciseId: string): Promise<PersonalRecord[]> {
    const records = await this.getPersonalRecords();
    return records.filter(r => r.exerciseId === exerciseId);
  }

  async checkAndUpdatePR(
    session: ExerciseSession
  ): Promise<PersonalRecord | null> {
    const completedSets = session.sets.filter(s => s.isCompleted);
    if (completedSets.length === 0) return null;

    const maxWeight = Math.max(...completedSets.map(s => s.weight));
    const totalReps = completedSets.reduce((sum, s) => sum + s.reps, 0);
    const volume = calculateVolume(completedSets);
    const oneRM = calculateOneRepMax(maxWeight, completedSets[0].reps);

    const existingPRs = await this.getExercisePRs(session.exerciseId);
    let newPR: PersonalRecord | null = null;

    const prTypes: { type: PRType; value: number; unit: string }[] = [
      { type: 'max_weight', value: maxWeight, unit: 'kg' },
      { type: 'max_reps', value: totalReps, unit: 'reps' },
      { type: 'max_volume', value: volume, unit: 'kg' },
      { type: 'one_rm', value: oneRM, unit: 'kg' },
    ];

    for (const pr of prTypes) {
      const existing = existingPRs.find(r => r.type === pr.type);
      if (!existing || pr.value > existing.value) {
        const newRecord: PersonalRecord = {
          id: uuidv4(),
          exerciseId: session.exerciseId,
          exerciseName: session.exerciseName,
          type: pr.type,
          value: pr.value,
          unit: pr.unit,
          date: new Date(),
          previousRecord: existing?.value,
          improvement: existing ? pr.value - existing.value : pr.value,
        };

        await this.savePersonalRecord(newRecord);
        newPR = newRecord;
        break;
      }
    }

    return newPR;
  }

  async savePersonalRecord(record: PersonalRecord): Promise<void> {
    try {
      const records = await this.getPersonalRecords();

      const existingIndex = records.findIndex(
        r => r.exerciseId === record.exerciseId && r.type === record.type
      );

      if (existingIndex !== -1) {
        records[existingIndex] = record;
      } else {
        records.push(record);
      }

      await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Failed to save personal record:', error);
      throw error;
    }
  }

  async createTemplate(
    template: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'usageCount'>
  ): Promise<WorkoutTemplate> {
    const newTemplate: WorkoutTemplate = {
      ...template,
      id: uuidv4(),
      createdAt: new Date(),
      usageCount: 0,
    };

    try {
      const templates = await this.getTemplates();
      templates.push(newTemplate);
      await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
      return newTemplate;
    } catch (error) {
      console.error('Failed to create template:', error);
      throw error;
    }
  }

  async getTemplates(): Promise<WorkoutTemplate[]> {
    try {
      const data = await AsyncStorage.getItem(TEMPLATES_KEY);
      const parsed = data ? JSON.parse(data) : [];
      return parsed.map((template: any) => ({
        ...template,
        createdAt: new Date(template.createdAt),
        lastUsed: template.lastUsed ? new Date(template.lastUsed) : undefined,
      }));
    } catch {
      return [];
    }
  }

  async getFavoriteTemplates(): Promise<WorkoutTemplate[]> {
    const templates = await this.getTemplates();
    return templates.filter(t => t.isFavorite);
  }

  async updateTemplate(
    id: string,
    updates: Partial<WorkoutTemplate>
  ): Promise<WorkoutTemplate | null> {
    try {
      const templates = await this.getTemplates();
      const index = templates.findIndex(t => t.id === id);
      if (index === -1) return null;

      templates[index] = { ...templates[index], ...updates };
      await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
      return templates[index];
    } catch (error) {
      console.error('Failed to update template:', error);
      throw error;
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    try {
      const templates = await this.getTemplates();
      const filtered = templates.filter(t => t.id !== id);
      await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete template:', error);
      throw error;
    }
  }

  async useTemplate(templateId: string): Promise<WorkoutTemplate | null> {
    try {
      const templates = await this.getTemplates();
      const index = templates.findIndex(t => t.id === templateId);
      if (index === -1) return null;

      templates[index] = {
        ...templates[index],
        lastUsed: new Date(),
        usageCount: templates[index].usageCount + 1,
      };

      await AsyncStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
      return templates[index];
    } catch (error) {
      console.error('Failed to use template:', error);
      throw error;
    }
  }

  async addToHistory(session: ExerciseSession): Promise<void> {
    try {
      const history = await this.getWorkoutHistory();
      const historyEntry: WorkoutHistory = {
        id: uuidv4(),
        templateId: undefined,
        templateName: undefined,
        date: session.date,
        duration: session.duration,
        totalVolume: session.volume,
        exercises: [session],
      };

      history.push(historyEntry);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));

      // Record streak activity for workout completion
      await streakService.recordActivity();

      // Also update user stats with workout
      await userStatsService.incrementWorkout(session.duration, session.volume);
    } catch (error) {
      console.error('Failed to add to history:', error);
      throw error;
    }
  }

  async getWorkoutHistory(): Promise<WorkoutHistory[]> {
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      const parsed = data ? JSON.parse(data) : [];
      return parsed.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
        exercises: entry.exercises.map((ex: any) => ({
          ...ex,
          date: new Date(ex.date),
          sets: ex.sets.map((set: any) => ({
            ...set,
            timestamp: set.timestamp ? new Date(set.timestamp) : undefined,
          })),
        })),
      }));
    } catch {
      return [];
    }
  }

  async getRecentWorkouts(limit: number = 7): Promise<WorkoutHistory[]> {
    const history = await this.getWorkoutHistory();
    return history
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  private async updateSessionMetrics(session: ExerciseSession): Promise<void> {
    const completedSets = session.sets.filter(s => s.isCompleted);
    session.volume = calculateVolume(completedSets);
    session.maxWeight = Math.max(...completedSets.map(s => s.weight), 0);
    session.totalReps = completedSets.reduce((sum, s) => sum + s.reps, 0);
  }
}

export const exerciseTrackingService = ExerciseTrackingService.getInstance();
export default exerciseTrackingService;
