import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { NutritionStackParamList } from '../../navigation/routes';
import { nutritionService } from '../../services/nutrition/NutritionService';
import { FoodEntry, MealType, MEAL_TYPES } from '../../services/nutrition/types';
import { hapticSelection, hapticSuccess, hapticError, hapticMedium } from '../../utils/haptics';

type EditFoodEntryRouteProp = RouteProp<NutritionStackParamList, 'EditFoodEntry'>;

export const EditFoodEntryScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<EditFoodEntryRouteProp>();
  const { entryId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [entry, setEntry] = useState<FoodEntry | null>(null);

  const [foodName, setFoodName] = useState('');
  const [servings, setServings] = useState('1');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('breakfast');
  const [entryDate, setEntryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadEntry();
  }, [entryId]);

  const loadEntry = async () => {
    try {
      setLoading(true);
      const allEntries = await nutritionService.getAllEntries();
      const foundEntry = allEntries.find(e => e.id === entryId);
      
      if (foundEntry) {
        setEntry(foundEntry);
        setFoodName(foundEntry.food.name);
        setServings(String(foundEntry.servings));
        setSelectedMeal(foundEntry.meal);
        setEntryDate(new Date(foundEntry.date));
      }
    } catch (error) {
      console.error('Failed to load entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServingsValue = () => {
    const parsed = parseFloat(servings);
    return isNaN(parsed) ? 1 : parsed;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const adjustDate = (days: number) => {
    const newDate = new Date(entryDate);
    newDate.setDate(newDate.getDate() + days);
    setEntryDate(newDate);
  };

  const adjustTime = (minutes: number) => {
    const newDate = new Date(entryDate);
    newDate.setMinutes(newDate.getMinutes() + minutes);
    setEntryDate(newDate);
  };

  const handleSave = async () => {
    if (!entry) return;

    const servingsValue = getServingsValue();
    if (servingsValue <= 0) {
      hapticMedium();
      return;
    }

    try {
      setSaving(true);
      hapticSuccess();
      
      const updatedFood = {
        ...entry.food,
        name: foodName,
      };

      await nutritionService.updateEntry(entryId, {
        food: updatedFood,
        servings: servingsValue,
        meal: selectedMeal,
        date: entryDate,
      });

      navigation.goBack();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      hapticError();
      await nutritionService.deleteEntry(entryId);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Entry not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Entry</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food</Text>
          
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={foodName}
            onChangeText={setFoodName}
            placeholder="Food name"
            placeholderTextColor="#999"
          />

          <View style={styles.servingsRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Servings</Text>
              <TextInput
                style={styles.input}
                value={servings}
                onChangeText={setServings}
                keyboardType="decimal-pad"
                placeholder="1"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.servingsPreview}>
              <Text style={styles.previewLabel}>Total Calories</Text>
              <Text style={styles.previewValue}>
                {Math.round(entry.food.calories * getServingsValue())}
              </Text>
              <Text style={styles.previewUnit}>cal</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal</Text>
          <View style={styles.mealChips}>
            {MEAL_TYPES.map(({ id, label }) => (
              <TouchableOpacity
                key={id}
                style={[
                  styles.mealChip,
                  selectedMeal === id && styles.mealChipActive,
                ]}
                onPress={() => {
                  hapticSelection();
                  setSelectedMeal(id);
                }}
              >
                <Text
                  style={[
                    styles.mealChipText,
                    selectedMeal === id && styles.mealChipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          
          <View style={styles.dateTimeCard}>
            <View style={styles.dateRow}>
              <TouchableOpacity style={styles.dateBtn} onPress={() => adjustDate(-1)}>
                <Ionicons name="chevron-back" size={20} color="#4CAF50" />
              </TouchableOpacity>
              <View style={styles.dateDisplay}>
                <Ionicons name="calendar-outline" size={18} color="#666" />
                <Text style={styles.dateText}>{formatDate(entryDate)}</Text>
              </View>
              <TouchableOpacity style={styles.dateBtn} onPress={() => adjustDate(1)}>
                <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.timeRow}>
              <TouchableOpacity style={styles.timeBtn} onPress={() => adjustTime(-15)}>
                <Ionicons name="chevron-back" size={20} color="#4CAF50" />
              </TouchableOpacity>
              <View style={styles.timeDisplay}>
                <Ionicons name="time-outline" size={18} color="#666" />
                <Text style={styles.timeText}>{formatTime(entryDate)}</Text>
              </View>
              <TouchableOpacity style={styles.timeBtn} onPress={() => adjustTime(15)}>
                <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.nutritionSection}>
          <Text style={styles.sectionTitle}>Nutrition (per serving)</Text>
          <View style={styles.nutritionRow}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{entry.food.calories}</Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{entry.food.protein}g</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{entry.food.carbs}g</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{entry.food.fat}g</Text>
              <Text style={styles.nutritionLabel}>Fat</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color="#F44336" />
          <Text style={styles.deleteBtnText}>Delete Entry</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backBtn: {
    width: 32,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  servingsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  servingsPreview: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  previewUnit: {
    fontSize: 14,
    color: '#666',
  },
  mealChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  mealChipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  mealChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  mealChipTextActive: {
    color: '#FFF',
  },
  dateTimeCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  nutritionSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  saveBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveBtnDisabled: {
    backgroundColor: '#A5D6A7',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  deleteBtnText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});

export default EditFoodEntryScreen;
