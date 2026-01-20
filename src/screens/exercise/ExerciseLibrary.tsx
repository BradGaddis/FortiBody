import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getExercisesByCategory,
  searchExercises,
  Exercise,
  ExerciseCategory,
} from '../../services/exercise/exerciseLibrary';

interface ExerciseLibraryScreenProps {
  navigation?: any;
  route?: any;
}

const ExerciseLibraryScreen: React.FC<ExerciseLibraryScreenProps> = ({
  navigation,
  route,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (route?.params?.muscleGroup) {
      setSelectedCategory(null);
    }
  }, [route?.params?.muscleGroup]);

  const categories = useMemo(() => getExercisesByCategory(), []);

  const allExercises = useMemo(() => {
    let exercises = categories.flatMap(cat => cat.exercises);
    
    if (route?.params?.muscleGroup) {
      const muscleGroup = route.params.muscleGroup.toLowerCase();
      exercises = exercises.filter(ex =>
        ex.muscleGroups.some(mg => mg.toLowerCase().includes(muscleGroup))
      );
    }
    
    return exercises;
  }, [categories, route?.params?.muscleGroup]);

  const filteredExercises = useMemo(() => {
    let exercises = allExercises;

    if (searchQuery.trim()) {
      exercises = searchExercises(searchQuery.trim());
    }

    if (selectedCategory) {
      exercises = exercises.filter(
        ex => ex.category === selectedCategory.toLowerCase()
      );
    }

    return exercises;
  }, [searchQuery, selectedCategory, allExercises]);

  const categoryStats = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      count: cat.exercises.length,
      key: cat.name.toLowerCase(),
    }));
  }, [categories]);

  const toggleFavorite = (exerciseId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(exerciseId)) {
        newFavorites.delete(exerciseId);
      } else {
        newFavorites.add(exerciseId);
      }
      return newFavorites;
    });
  };

  const navigateToExercise = (exercise: Exercise) => {
    const routeName = `Exercise_${exercise.id}`;
    navigation?.navigate?.('ExercisesStack', { screen: routeName });
  };

  const renderExerciseCard = ({ item }: { item: Exercise }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigateToExercise(item)}
      activeOpacity={0.7}
    >
      <Image source={item.img} style={styles.cardImage} />
      <View style={styles.cardOverlay}>
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={e => {
            e.stopPropagation();
            toggleFavorite(item.id);
          }}
        >
          <Ionicons
            name={favorites.has(item.id) ? 'heart' : 'heart-outline'}
            size={20}
            color={favorites.has(item.id) ? '#F44336' : '#FFF'}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.cardMeta}>
          {item.muscleGroups[0]} • {item.equipment}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryChip = (category: (typeof categoryStats)[0]) => (
    <TouchableOpacity
      key={category.key}
      style={[
        styles.chip,
        selectedCategory === category.key && styles.chipActive,
      ]}
      onPress={() =>
        setSelectedCategory(
          selectedCategory === category.key ? null : category.key
        )
      }
    >
      <Text
        style={[
          styles.chipText,
          selectedCategory === category.key && styles.chipTextActive,
        ]}
      >
        {category.name} ({category.count})
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {route?.params?.muscleGroup 
            ? `${route.params.muscleGroup.charAt(0).toUpperCase() + route.params.muscleGroup.slice(1)} Exercises`
            : 'Exercise Library'}
        </Text>
        <Text style={styles.subtitle}>
          {filteredExercises.length} exercises
        </Text>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.chipWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipContainer}
        >
          <TouchableOpacity
            style={[styles.chip, !selectedCategory && styles.chipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.chipText,
                !selectedCategory && styles.chipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {categoryStats.map(renderCategoryChip)}
        </ScrollView>
      </View>

      <View style={styles.exerciseSection}>
        {filteredExercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="fitness-outline" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>No exercises found</Text>
            <Text style={styles.emptySubtitle}>
              Try a different search or filter
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredExercises}
            renderItem={renderExerciseCard}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.gridRow}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  searchWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  chipScroll: {
    height: 52,
  },
  chipContainer: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    height: 52,
    alignItems: 'center',
  },
  chipWrapper: {
    height: 52,
  },
  exerciseSection: {
    flex: 1,
  },
  chip: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 24,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
    lineHeight: 20,
  },
  chipTextActive: {
    color: '#FFF',
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'space-between',
    padding: 8,
  },
  heartBtn: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: '#888',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
});

export default ExerciseLibraryScreen;
