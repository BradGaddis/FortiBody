import AsyncStorage from '@react-native-async-storage/async-storage';
import { Exercise } from './exerciseLibrary';

interface UserProfile {
  age?: number;
  gender?: 'male' | 'female';
  height?: number; // cm
  weight?: number; // kg
  activityLevel?: 1 | 2 | 3 | 4 | 5; // 1=sedentary, 5=very active
  goals?: string[];
}

interface ExercisePerformance {
  exerciseId: string;
  date: Date;
  sets: Array<{ reps: number; weight: number }>;
  duration: number; // minutes
  perceivedExertion?: number; // 1-10 scale
}

interface MLRecommendationInput {
  user: UserProfile;
  exerciseHistory: ExercisePerformance[];
  currentSession?: ExercisePerformance[];
}

interface RecommendationResult {
  exercises: Exercise[];
  reasoning: string;
  confidence: number; // 0-1
}

class MLRecommendationEngine {
  private USER_DATA_KEY = '@user_profile';
  private EXERCISE_HISTORY_KEY = '@exercise_history';

  async getUserData(): Promise<UserProfile> {
    try {
      const stored = await AsyncStorage.getItem(this.USER_DATA_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error loading user data:', error);
      return {};
    }
  }

  async getExerciseHistory(): Promise<ExercisePerformance[]> {
    try {
      const stored = await AsyncStorage.getItem(this.EXERCISE_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading exercise history:', error);
      return [];
    }
  }

  async saveExercisePerformance(performance: ExercisePerformance): Promise<void> {
    try {
      const history = await this.getExerciseHistory();
      history.push(performance);
      
      // Keep only last 100 sessions
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }
      
      await AsyncStorage.setItem(this.EXERCISE_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving exercise performance:', error);
    }
  }

  calculateDifficultyLevel(user: UserProfile): number {
    let difficultyModifier = 0;
    
    // Age adjustment
    if (user.age) {
      if (user.age < 25) difficultyModifier += 0.2;
      else if (user.age > 50) difficultyModifier -= 0.3;
    }
    
    return Math.max(0.1, Math.min(1.0, 0.5 + difficultyModifier));
  }

  recommendExercises(input: MLRecommendationInput): RecommendationResult {
    const { user, exerciseHistory } = input;
    const allExercises = this.getAvailableExercises();
    
    // Rule-based recommendations (simplified ML approach)
    const recommendations = allExercises.map(exercise => {
      let score = 0.5; // Base score
      let reasons = [];

      // User preference matching
      if (user.goals) {
        if (user.goals.includes('strength') && exercise.category === 'strength') {
          score += 0.3;
          reasons.push('Matches strength goals');
        }
        if (user.goals.includes('weight_loss') && exercise.category === 'cardio') {
          score += 0.3;
          reasons.push('Good for weight loss');
        }
        if (user.goals.includes('flexibility') && exercise.category === 'flexibility') {
          score += 0.3;
          reasons.push('Improves flexibility');
        }
      }

      // Equipment availability
      if (exercise.equipment === 'none') {
        score += 0.2;
        reasons.push('No equipment needed');
      }

      // Difficulty appropriateness
      const appropriateDifficulty = this.calculateDifficultyLevel(user, exercise);
      score += appropriateDifficulty * 0.2;
      if (appropriateDifficulty > 0.7) {
        reasons.push('Appropriate difficulty level');
      }

      // Recent exercise performance (avoid overtraining same muscles)
      const recentSameCategory = exerciseHistory
        .filter(session => Date.now() - new Date(session.date).getTime() < 7 * 24 * 60 * 60 * 1000) // Last 7 days
        .filter(session => {
          const sessionExercise = allExercises.find(ex => ex.id === session.exerciseId);
          return sessionExercise && sessionExercise.category === exercise.category;
        });
      
      if (recentSameCategory.length < 3) {
        score += 0.15;
        reasons.push('Muscle group well-rested');
      }

      // Activity level adjustment
      if (user.activityLevel) {
        if (user.activityLevel >= 4 && exercise.category === 'cardio') {
          score += 0.25;
          reasons.push('Good for active lifestyle');
        }
        if (user.activityLevel <= 2 && exercise.category === 'bodyweight') {
          score += 0.2;
          reasons.push('Suitable for current activity level');
        }
      }

      return {
        exercise,
        score: Math.max(0, Math.min(1, score)),
        reasons: reasons.filter((_, index, arr) => arr.indexOf(reasons[index]) === index) // Unique reasons
      };
    });

    // Sort by score and take top recommendations
    recommendations.sort((a, b) => b.score - a.score);
    const topRecommendations = recommendations.slice(0, Math.min(8, recommendations.length));

    return {
      exercises: topRecommendations.map(rec => rec.exercise),
      reasoning: topRecommendations.length > 0 
        ? `Recommended based on: ${topRecommendations[0].reasons.join(', ')}`
        : 'Showing all available exercises',
      confidence: Math.max(0.3, topRecommendations[0]?.score || 0.5)
    };
  }

  getAvailableExercises(): Exercise[] {
    // This would normally come from the exercise store
    // For now, return empty array to be filled by actual exercise data
    return [];
  }

  generateProgressivePlan(user: UserProfile, targetExercises: Exercise[]): RecommendationResult {
    const recommendations = targetExercises.map(exercise => {
      let progressionLevel = 1;
      let reasoning = ['Base exercise selected'];

      // Calculate progression based on user's current fitness level
      if (user.activityLevel) {
        progressionLevel = Math.min(5, Math.floor(user.activityLevel / 1.5));
        reasoning.push(`Adjusted for activity level ${user.activityLevel}`);
      }

      // Fatigue assessment for deload recommendations
      if (user.activityLevel >= 4) {
        progressionLevel += 1; // Higher fatigue, more conservative progression
        reasoning.push('High activity level - includes deload weeks');
      }

      return {
        exercise,
        score: 0.8,
        reasoning: reasoning.join(', '),
        confidence: Math.min(1.0, progressionLevel * 0.2)
      };
    });

    return {
      exercises: recommendations.map(rec => rec.exercise),
      reasoning: 'Progressive workout plan with built-in deload weeks for recovery',
      confidence: 0.7
    };
  }

  assessFatigueRisk(exerciseHistory: ExercisePerformance[]): {
    risk: 'low' | 'moderate' | 'high';
    recommendation: string;
    nextAction: 'deload' | 'maintain' | 'progress';
  } {
    // Analyze last 4 weeks of training
    const recentSessions = exerciseHistory.slice(-20);
    
    if (recentSessions.length < 6) {
      return {
        risk: 'low',
        recommendation: 'Continue normal progression',
        nextAction: 'progress'
      };
    }

    // Check for signs of overtraining
    const avgPerceivedExertion = recentSessions.reduce((sum, session) => 
      sum + (session.perceivedExertion || 5), 0) / recentSessions.length;
    
    const decreasingPerformance = this.analyzePerformanceTrend(recentSessions);
    const increasingVolume = this.analyzeVolumeTrend(recentSessions);

    let risk: 'low' | 'moderate' | 'high' = 'low';
    let recommendation = string;
    let nextAction: 'deload' | 'maintain' | 'progress' = 'progress';

    if (avgPerceivedExertion >= 7.5) {
      risk = 'high';
      recommendation = 'High perceived exertion detected - recommend deload week';
      nextAction = 'deload';
    } else if (decreasingPerformance && increasingVolume) {
      risk = 'moderate';
      recommendation = 'Increasing volume with decreasing performance - deload recommended';
      nextAction = 'deload';
    } else if (avgPerceivedExertion <= 4 && decreasingPerformance) {
      risk = 'moderate';
      recommendation = 'Low exertion but poor performance - reduce training intensity';
      nextAction = 'deload';
    }

    return { risk, recommendation, nextAction };
  }

  private analyzePerformanceTrend(sessions: ExercisePerformance[]): boolean {
    if (sessions.length < 4) return false;
    
    // Simple trend analysis: compare recent vs older sessions
    const recentAvg = sessions.slice(-4).reduce((sum, s) => 
      sum + (s.sets?.length || 0), 0) / 4;
    const olderAvg = sessions.slice(-8, -4).reduce((sum, s) => 
      sum + (s.sets?.length || 0), 0) / 4;
    
    return recentAvg < olderAvg * 0.9; // 10% decline
  }

  private analyzeVolumeTrend(sessions: ExercisePerformance[]): boolean {
    if (sessions.length < 4) return false;
    
    const recentVolume = sessions.slice(-4).reduce((sum, s) => 
      sum + s.totalVolume, 0) / 4;
    const olderVolume = sessions.slice(-8, -4).reduce((sum, s) => 
      sum + s.totalVolume, 0) / 4;
    
    return recentVolume > olderVolume * 1.15; // 15% increase might indicate overreaching
  }
}

export default MLRecommendationEngine;