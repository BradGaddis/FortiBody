import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { nutritionService } from '../../services/nutrition/NutritionService';

interface NutritionDashboardProps {
  navigation: any;
}

interface DailyEntry {
  id: string;
  foodName: string;
  calories: number;
  meal: string;
  time: string;
  servings: number;
  foodId: string;
}

export const NutritionDashboardScreen: React.FC<NutritionDashboardProps> = ({
  navigation,
}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DailyEntry | null>(null);
  const [servingsInput, setServingsInput] = useState('');

  const loadTodayData = useCallback(async () => {
    const today = new Date();
    const dailyNutrition = await nutritionService.getDailyNutrition(today);

    const entryList: DailyEntry[] = dailyNutrition.entries.map(entry => ({
      id: entry.id,
      foodName: entry.food.name,
      calories: Math.round(entry.food.calories * entry.servings),
      meal: entry.meal,
      time: new Date(entry.date).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      servings: entry.servings,
      foodId: entry.foodId,
    }));

    setEntries(entryList);
    setTotals({
      calories: Math.round(dailyNutrition.totalCalories),
      protein: Math.round(dailyNutrition.totalProtein),
      carbs: Math.round(dailyNutrition.totalCarbs),
      fat: Math.round(dailyNutrition.totalFat),
    });
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadTodayData();
  }, [loadTodayData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTodayData();
    });
    return unsubscribe;
  }, [navigation, loadTodayData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTodayData();
  };

  const deleteEntry = (id: string, foodName: string) => {
    Alert.alert('Delete Entry', `Remove "${foodName}" from today's log?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await nutritionService.deleteEntry(id);
          loadTodayData();
        },
      },
    ]);
  };

  const openEditModal = (entry: DailyEntry) => {
    setEditingEntry(entry);
    setServingsInput(entry.servings.toString());
    setEditModalVisible(true);
  };

  const saveServings = async () => {
    if (!editingEntry) return;
    
    const parsedServings = parseFloat(servingsInput);
    if (isNaN(parsedServings) || parsedServings <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number greater than 0');
      return;
    }

    await nutritionService.updateEntry(editingEntry.id, { servings: parsedServings });
    setEditModalVisible(false);
    setEditingEntry(null);
    loadTodayData();
  };

  const hasData = entries.length > 0;

  const stats = [
    {
      label: 'Calories',
      value: totals.calories.toLocaleString(),
      color: '#4CAF50',
    },
    { label: 'Protein', value: `${totals.protein}g`, color: '#2196F3' },
    { label: 'Carbs', value: `${totals.carbs}g`, color: '#FF9800' },
    { label: 'Fat', value: `${totals.fat}g`, color: '#9C27B0' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Nutrition</Text>
          <Text style={styles.subtitle}>
            {hasData ? `Today, ${new Date().toLocaleDateString()}` : 'Track your daily nutrition'}
          </Text>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={[styles.statValue, { color: stat.color }]}>
                {stat.value}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Log</Text>
            <Text style={styles.entryCount}>{entries.length} entries</Text>
          </View>
          {hasData ? (
            entries.map(entry => (
              <View key={entry.id} style={styles.mealCard}>
                <View style={styles.mealInfo}>
                  <View style={styles.mealHeader}>
                    <Text style={styles.mealName}>{entry.foodName}</Text>
                    {entry.servings !== 1 && (
                      <View style={styles.servingsBadge}>
                        <Text style={styles.servingsBadgeText}>×{entry.servings.toFixed(2)}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.mealTime}>
                    {entry.meal.charAt(0).toUpperCase() + entry.meal.slice(1)} • {entry.time}
                  </Text>
                </View>
                <View style={styles.mealActions}>
                  <Text style={styles.mealCalories}>{entry.calories} cal</Text>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => openEditModal(entry)}
                    >
                      <Ionicons name="create-outline" size={18} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => deleteEntry(entry.id, entry.foodName)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="restaurant-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>No meals logged today</Text>
              <Text style={styles.emptySubtext}>
                Tap "Add Food" to get started
              </Text>
            </View>
          )}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('FoodDiary')}
          >
            <Ionicons name="book-outline" size={24} color="#4CAF50" />
            <Text style={styles.quickActionText}>Food Diary</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Fasting')}
          >
            <Ionicons name="time-outline" size={24} color="#4CAF50" />
            <Text style={styles.quickActionText}>Fasting</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('AddFood')}
          >
            <Ionicons name="add-circle-outline" size={24} color="#4CAF50" />
            <Text style={styles.quickActionText}>Add Food</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Servings</Text>
            <Text style={styles.modalSubtitle}>{editingEntry?.foodName}</Text>
            
            <View style={styles.servingsInputContainer}>
              <TextInput
                style={styles.servingsInput}
                value={servingsInput}
                onChangeText={setServingsInput}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#999"
              />
              <Text style={styles.servingsUnit}>servings</Text>
            </View>

            <Text style={styles.caloriesPreview}>
              {editingEntry && servingsInput
                ? `${Math.round(editingEntry.calories / editingEntry.servings * parseFloat(servingsInput) || 0)} calories`
                : ''}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={saveServings}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  entryCount: {
    fontSize: 14,
    color: '#666',
  },
  mealCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  servingsBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  servingsBadgeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  mealTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  mealActions: {
    alignItems: 'flex-end',
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  actionBtn: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  servingsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  servingsInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    paddingVertical: 12,
  },
  servingsUnit: {
    fontSize: 18,
    color: '#666',
  },
  caloriesPreview: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default NutritionDashboardScreen;
