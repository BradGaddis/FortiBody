import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { nutritionService } from '../../services/nutrition/NutritionService';
import { fastingService } from '../../services/nutrition/FastingService';
import { FoodItem, MealType, MEAL_TYPES } from '../../services/nutrition/types';
import streakService from '../../services/streak/StreakService';
import { hapticSelection, hapticSuccess, hapticMedium } from '../../utils/haptics';

import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CommonActions } from '@react-navigation/native';
import { NutritionStackParamList } from '../../navigation/routes';

interface AddFoodScreenProps {
  navigation: StackNavigationProp<NutritionStackParamList, 'AddFood'>;
  route: RouteProp<NutritionStackParamList, 'AddFood'>;
}

const SEARCH_DEBOUNCE_MS = 500;

export const AddFoodScreen: React.FC<AddFoodScreenProps> = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [onlineFoods, setOnlineFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealType>(route.params?.meal || 'breakfast');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState<string>('1.00');
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [entryDate, setEntryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadFoods = useCallback(async () => {
    setLoading(true);
    const database = await nutritionService.getFoodDatabase();
    setFoods(database);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  const handleSearch = useCallback(async (query: string) => {
    const trimmed = query.trim().toLowerCase();
    
    if (trimmed.length < 2) {
      setOnlineFoods([]);
      return;
    }

    setSearching(true);
    try {
      const results = await nutritionService.searchFoodsOnline(trimmed);
      setOnlineFoods(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  }, []);

  const onSearchChange = (text: string) => {
    setSearchQuery(text);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (text.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(text);
      }, SEARCH_DEBOUNCE_MS);
    } else {
      setOnlineFoods([]);
    }
  };

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFoodClick = () => {
    hapticSelection();
    setEntryDate(new Date());
    setConfirmModalVisible(true);
  };

  const handleConfirmSave = async () => {
    if (!selectedFood) {
      console.log('No food selected');
      return;
    }

    const parsedServings = parseFloat(servings);
    if (isNaN(parsedServings) || parsedServings <= 0) {
      hapticMedium();
      setConfirmModalVisible(false);
      return;
    }

    console.log('Saving food entry...', { foodId: selectedFood.id, meal: selectedMeal, servings: parsedServings });
    
    try {
      hapticSuccess();
      const entry = await nutritionService.addFoodEntry({
        foodId: selectedFood.id,
        food: selectedFood,
        servings: parsedServings,
        meal: selectedMeal,
        date: entryDate,
      });
      console.log('Entry saved:', entry.id);

      await fastingService.recordMeal();
      await streakService.recordActivity();
      setConfirmModalVisible(false);
      console.log('Navigating back...');
      navigation.dispatch((state: any) => {
        const routes = state.routes.filter((r: any) => r.name !== 'AddFood');
        return CommonActions.reset({
          index: routes.length - 1,
          routes,
        });
      });
    } catch (error) {
      console.error('Failed to save entry:', error);
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

  const handleEditFood = (food: FoodItem) => {
    navigation.navigate('EditFood', { foodId: food.id });
  };

  const handleDeleteFood = async (food: FoodItem) => {
    try {
      await nutritionService.deleteFood(food.id);
      loadFoods();
      if (selectedFood?.id === food.id) {
        setSelectedFood(null);
      }
    } catch (error) {
      console.error('Failed to delete food:', error);
    }
  };

  const handleSaveOnlineFood = async (food: FoodItem) => {
    try {
      const savedFood = await nutritionService.addFood({
        name: food.name,
        brand: food.brand,
        barcode: food.barcode,
        servingSize: food.servingSize,
        servingUnit: food.servingUnit,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
        sugar: food.sugar,
        sodium: food.sodium,
      });
      await loadFoods();
      setSelectedFood(savedFood);
      setOnlineFoods([]);
      setSearchQuery('');
      hapticSuccess();
    } catch (error) {
      console.error('Failed to save online food:', error);
    }
  };

  const renderMealChip = ({ id, label }: { id: MealType; label: string }) => (
    <TouchableOpacity
      key={id}
      style={[styles.mealChip, selectedMeal === id && styles.mealChipActive]}
      onPress={() => setSelectedMeal(id)}
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
  );

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <TouchableOpacity
      style={[
        styles.foodItem,
        selectedFood?.id === item.id && styles.foodItemSelected,
      ]}
      onPress={() => {
        hapticSelection();
        setSelectedFood(item);
      }}
    >
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodDetails}>
          {item.calories} cal • {item.servingSize}{item.servingUnit}
          {item.brand && ` • ${item.brand}`}
        </Text>
      </View>
      <View style={styles.foodMacros}>
        <Text style={styles.macroText}>P: {item.protein}g</Text>
        <Text style={styles.macroText}>C: {item.carbs}g</Text>
        <Text style={styles.macroText}>F: {item.fat}g</Text>
      </View>
      {item.isCustom && (
        <View style={styles.foodActions}>
          <TouchableOpacity
            style={styles.foodActionBtn}
            onPress={() => handleEditFood(item)}
          >
            <Ionicons name="create-outline" size={18} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.foodActionBtn}
            onPress={() => handleDeleteFood(item)}
          >
            <Ionicons name="trash-outline" size={18} color="#F44336" />
          </TouchableOpacity>
        </View>
      )}
      {!item.isCustom && item.id.startsWith('off-') && (
        <View style={styles.onlineBadge}>
          <Ionicons name="cloud-outline" size={12} color="#4CAF50" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderOnlineFoodItem = ({ item }: { item: FoodItem }) => (
    <TouchableOpacity
      style={[styles.foodItem, styles.onlineFoodItem]}
      onPress={() => handleSaveOnlineFood(item)}
    >
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodDetails}>
          {item.calories} cal • {item.servingSize}{item.servingUnit}
          {item.brand && ` • ${item.brand}`}
        </Text>
      </View>
      <View style={styles.foodMacros}>
        <Text style={styles.macroText}>P: {item.protein}g</Text>
        <Text style={styles.macroText}>C: {item.carbs}g</Text>
        <Text style={styles.macroText}>F: {item.fat}g</Text>
      </View>
      <View style={styles.saveBadge}>
        <Ionicons name="add" size={16} color="#4CAF50" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Food</Text>
        <Text style={styles.subtitle}>
          {foods.length === 0 
            ? 'Create or scan foods to get started'
            : 'Select a food to add to your log'
          }
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search or type to find foods..."
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholderTextColor="#999"
            autoCapitalize="none"
          />
          {searching ? (
            <ActivityIndicator size="small" color="#4CAF50" />
          ) : searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              setOnlineFoods([]);
            }}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.mealSelector}>
        <Text style={styles.sectionLabel}>Meal</Text>
        <View style={styles.mealChips}>{MEAL_TYPES.map(renderMealChip)}</View>
      </View>

      {onlineFoods.length > 0 && (
        <View style={styles.onlineSection}>
          <View style={styles.onlineHeader}>
            <Ionicons name="cloud-outline" size={16} color="#4CAF50" />
            <Text style={styles.onlineTitle}>Search Results</Text>
            <Text style={styles.onlineSubtitle}>Tap to save to your foods</Text>
          </View>
          <FlatList
            data={onlineFoods}
            renderItem={renderOnlineFoodItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.onlineList}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>
      )}

      {searching && (
        <View style={styles.searchingIndicator}>
          <ActivityIndicator size="small" color="#4CAF50" />
          <Text style={styles.searchingText}>Searching...</Text>
        </View>
      )}

      {selectedFood ? (
        <View style={styles.selectedFoodSection}>
          <View style={styles.selectedFoodCard}>
            <View style={styles.selectedFoodHeader}>
              <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>
              <TouchableOpacity onPress={() => setSelectedFood(null)}>
                <Ionicons name="close-circle" size={24} color="#999" />
              </TouchableOpacity>
            </View>
            <Text style={styles.selectedFoodCalories}>
              {Math.round(selectedFood.calories * getServingsValue())} calories
            </Text>
            <View style={styles.servingsControl}>
              <Text style={styles.servingsLabel}>Servings:</Text>
              <TextInput
                style={styles.servingsInput}
                value={servings}
                onChangeText={setServings}
                keyboardType="decimal-pad"
                placeholder="1.00"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.servingsPresets}>
              {['0.25', '0.5', '1', '1.5', '2'].map(preset => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetBtn,
                    servings === preset && styles.presetBtnActive,
                  ]}
                  onPress={() => setServings(preset)}
                >
                  <Text
                    style={[
                      styles.presetText,
                      servings === preset && styles.presetTextActive,
                    ]}
                  >
                    {preset}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.addButton} onPress={handleAddFoodClick}>
              <Ionicons name="add-circle" size={20} color="#FFF" />
              <Text style={styles.addButtonText}>
                Add to {MEAL_TYPES.find(m => m.id === selectedMeal)?.label}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => navigation.navigate('BarcodeScanner')}
            >
              <Ionicons name="barcode-outline" size={24} color="#4CAF50" />
              <Text style={styles.quickActionText}>Scan Barcode</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={() => navigation.navigate('CreateFood')}
            >
              <Ionicons name="create-outline" size={24} color="#4CAF50" />
              <Text style={styles.quickActionText}>Create Food</Text>
            </TouchableOpacity>
          </View>

          {foods.length > 0 && (
            <Text style={styles.sectionLabel}>My Foods</Text>
          )}
          <FlatList
            data={filteredFoods}
            renderItem={renderFoodItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.foodList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="restaurant-outline" size={48} color="#CCC" />
                <Text style={styles.emptyText}>No foods yet</Text>
                <Text style={styles.emptySubtext}>Create or scan your first food</Text>
              </View>
            }
          />
        </>
      )}

      <Modal
        visible={confirmModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Entry</Text>
              <TouchableOpacity onPress={() => setConfirmModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#999" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.confirmFoodCard}>
                <Text style={styles.confirmFoodName}>{selectedFood?.name}</Text>
                <Text style={styles.confirmCalories}>
                  {Math.round((selectedFood?.calories || 0) * getServingsValue())} calories
                </Text>
                <View style={styles.confirmMacros}>
                  <Text style={styles.confirmMacro}>P: {selectedFood?.protein}g</Text>
                  <Text style={styles.confirmMacro}>C: {selectedFood?.carbs}g</Text>
                  <Text style={styles.confirmMacro}>F: {selectedFood?.fat}g</Text>
                </View>
              </View>

              <Text style={styles.confirmLabel}>Meal</Text>
              <View style={styles.modalMealChips}>
                {MEAL_TYPES.map(({ id, label }) => (
                  <TouchableOpacity
                    key={id}
                    style={[
                      styles.modalMealChip,
                      selectedMeal === id && styles.modalMealChipActive,
                    ]}
                    onPress={() => setSelectedMeal(id)}
                  >
                    <Text
                      style={[
                        styles.modalMealChipText,
                        selectedMeal === id && styles.modalMealChipTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.confirmLabel}>Servings</Text>
              <View style={styles.confirmServingsRow}>
                <TouchableOpacity
                  style={styles.confirmAdjustBtn}
                  onPress={() => {
                    const current = parseFloat(servings) || 1;
                    const newValue = Math.max(0.25, current - 0.25);
                    setServings(newValue.toFixed(2));
                  }}
                >
                  <Ionicons name="remove" size={24} color="#4CAF50" />
                </TouchableOpacity>
                <TextInput
                  style={styles.confirmServingsInput}
                  value={servings}
                  onChangeText={setServings}
                  keyboardType="decimal-pad"
                  textAlign="center"
                />
                <TouchableOpacity
                  style={styles.confirmAdjustBtn}
                  onPress={() => {
                    const current = parseFloat(servings) || 1;
                    const newValue = current + 0.25;
                    setServings(newValue.toFixed(2));
                  }}
                >
                  <Ionicons name="add" size={24} color="#4CAF50" />
                </TouchableOpacity>
              </View>

              <Text style={styles.confirmLabel}>Date & Time</Text>
              <View style={styles.confirmDateTimeCard}>
                <View style={styles.confirmDateRow}>
                  <TouchableOpacity
                    style={styles.confirmDateBtn}
                    onPress={() => adjustDate(-1)}
                  >
                    <Ionicons name="chevron-back" size={20} color="#4CAF50" />
                  </TouchableOpacity>
                  <View style={styles.confirmDateDisplay}>
                    <Ionicons name="calendar-outline" size={18} color="#666" />
                    <Text style={styles.confirmDateText}>{formatDate(entryDate)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.confirmDateBtn}
                    onPress={() => adjustDate(1)}
                  >
                    <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
                <View style={styles.confirmTimeRow}>
                  <TouchableOpacity
                    style={styles.confirmTimeBtn}
                    onPress={() => adjustTime(-15)}
                  >
                    <Ionicons name="chevron-back" size={20} color="#4CAF50" />
                  </TouchableOpacity>
                  <View style={styles.confirmTimeDisplay}>
                    <Ionicons name="time-outline" size={18} color="#666" />
                    <Text style={styles.confirmTimeText}>{formatTime(entryDate)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.confirmTimeBtn}
                    onPress={() => adjustTime(15)}
                  >
                    <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.confirmSummary}>
                <Text style={styles.confirmSummaryLabel}>Total:</Text>
                <Text style={styles.confirmSummaryValue}>
                  {Math.round((selectedFood?.calories || 0) * getServingsValue())} cal
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleConfirmSave}
              >
                <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                <Text style={styles.modalSaveText}>Save Entry</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
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
  searchContainer: {
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
  mealSelector: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  mealChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  mealChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFF',
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
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  foodList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  foodItemSelected: {
    borderColor: '#4CAF50',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  foodDetails: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  foodMacros: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  macroText: {
    fontSize: 12,
    color: '#888',
  },
  foodActions: {
    flexDirection: 'row',
    gap: 4,
  },
  foodActionBtn: {
    padding: 8,
  },
  selectedFoodSection: {
    padding: 20,
  },
  selectedFoodCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedFoodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedFoodName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  selectedFoodCalories: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 4,
  },
  servingsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  servingsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  servingsInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    textAlign: 'center',
  },
  servingsPresets: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  presetBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  presetBtnActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  presetText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  presetTextActive: {
    color: '#FFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  modalBody: {
    padding: 20,
  },
  confirmFoodCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  confirmFoodName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  confirmCalories: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 4,
  },
  confirmMacros: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  confirmMacro: {
    fontSize: 14,
    color: '#666',
  },
  confirmLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 4,
  },
  modalMealChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  modalMealChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalMealChipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  modalMealChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  modalMealChipTextActive: {
    color: '#FFF',
  },
  confirmServingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 16,
  },
  confirmAdjustBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmServingsInput: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    width: 100,
    textAlign: 'center',
  },
  confirmDateTimeCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    marginBottom: 16,
  },
  confirmDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  confirmDateBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmDateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confirmDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  confirmTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confirmTimeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmTimeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confirmTimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  confirmSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  confirmSummaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  confirmSummaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
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
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    gap: 8,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  onlineSection: {
    backgroundColor: '#F0FFF0',
    borderTopWidth: 1,
    borderTopColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  onlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  onlineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  onlineSubtitle: {
    fontSize: 12,
    color: '#888',
    marginLeft: 'auto',
  },
  onlineList: {
    paddingBottom: 8,
  },
  onlineFoodItem: {
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  onlineBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  searchingText: {
    fontSize: 14,
    color: '#888',
  },
});

export default AddFoodScreen;
