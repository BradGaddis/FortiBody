import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getExercisesByCategory, Exercise } from '../../services/exercise/exerciseLibrary';

const FAVORITES_KEY = '@favorite_exercises';
const FREQUENTLY_USED_KEY = '@frequently_used_exercises';

interface FavoritesScreenProps {
  navigation: any;
}

const FavoritesScreen = ({ navigation }: FavoritesScreenProps) => {
  const [favorites, setFavorites] = useState<Exercise[]>([]);
  const [frequentlyUsed, setFrequentlyUsed] = useState<Exercise[]>([]);
  const [activeTab, setActiveTab] = useState<'favorites' | 'frequent'>('favorites');

  useEffect(() => {
    loadFavorites();
    loadFrequentlyUsed();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const favoriteIds = JSON.parse(stored);
        const allExercises = getExercisesByCategory().flatMap(cat => cat.exercises);
        const favoriteExercises = allExercises.filter(ex => favoriteIds.includes(ex.id));
        setFavorites(favoriteExercises);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadFrequentlyUsed = async () => {
    try {
      const stored = await AsyncStorage.getItem(FREQUENTLY_USED_KEY);
      if (stored) {
        const frequentIds = JSON.parse(stored);
        const allExercises = getExercisesByCategory().flatMap(cat => cat.exercises);
        const frequentExercises = allExercises.filter(ex => frequentIds.includes(ex.id));
        setFrequentlyUsed(frequentExercises);
      }
    } catch (error) {
      console.error('Error loading frequently used:', error);
    }
  };

  const saveFavorite = async (exerciseId: string) => {
    try {
      const updatedFavorites = [...favorites, exerciseId];
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      loadFavorites();
    } catch (error) {
      console.error('Error saving favorite:', error);
    }
  };

  const removeFavorite = async (exerciseId: string) => {
    try {
      const updatedFavorites = favorites.filter(id => id !== exerciseId);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));
      loadFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const incrementUsage = async (exerciseId: string) => {
    try {
      let frequentIds: string[] = [];
      const stored = await AsyncStorage.getItem(FREQUENTLY_USED_KEY);
      if (stored) {
        frequentIds = JSON.parse(stored);
      }
      
      // Remove if already exists and add to end
      frequentIds = frequentIds.filter(id => id !== exerciseId);
      frequentIds.push(exerciseId);
      
      // Keep only last 20
      if (frequentIds.length > 20) {
        frequentIds = frequentIds.slice(-20);
      }
      
      await AsyncStorage.setItem(FREQUENTLY_USED_KEY, JSON.stringify(frequentIds));
      loadFrequentlyUsed();
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  };

  const renderExerciseItem = (exercise: Exercise, isFavorite: boolean = false) => (
    <TouchableOpacity
      key={exercise.id}
      style={styles.exerciseItem}
      onPress={() => {
        navigation.navigate(exercise.name);
        incrementUsage(exercise.id);
      }}
    >
      <View style={styles.exerciseHeader}>
        <Image source={exercise.img} style={styles.exerciseImage} />
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.exerciseCategory}>{exercise.category}</Text>
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => isFavorite ? removeFavorite(exercise.id) : saveFavorite(exercise.id)}
        >
          <Text style={styles.favoriteIcon}>{isFavorite ? '♥' : '♡'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderTab = (tabName: 'favorites' | 'frequent', count: number) => (
    <TouchableOpacity
      style={[
        styles.tab,
        activeTab === tabName && styles.activeTab
      ]}
      onPress={() => setActiveTab(tabName)}
    >
      <Text style={[
        styles.tabText,
        activeTab === tabName && styles.activeTabText
      ]}>
        {tabName.charAt(0).toUpperCase() + tabName.slice(1)} ({count})
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Exercises</Text>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTab('favorites', favorites.length)}
        {renderTab('frequent', frequentlyUsed.length)}
      </View>

      {/* Exercise List */}
      <ScrollView style={styles.exerciseList}>
        {(activeTab === 'favorites' ? favorites : frequentlyUsed).map(exercise => {
          const isFavorite = favorites.some(fav => fav.id === exercise.id);
          return renderExerciseItem(exercise, isFavorite);
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  exerciseList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  exerciseCategory: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  favoriteButton: {
    padding: 8,
  },
  favoriteIcon: {
    fontSize: 20,
    color: '#ff6b6b',
  },
});

export default FavoritesScreen;