import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { nutritionService } from '../../services/nutrition/NutritionService';
import { FoodItem, MealType, MEAL_TYPES } from '../../services/nutrition/types';

interface AddFoodScreenProps {
  navigation: any;
}

export const AddFoodScreen: React.FC<AddFoodScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState<MealType>('breakfast');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState<string>('1.00');

  const loadFoods = useCallback(async () => {
    setLoading(true);
    const database = await nutritionService.getFoodDatabase();
    setFoods(database);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFood = async () => {
    if (!selectedFood) return;

    const parsedServings = parseFloat(servings);
    if (isNaN(parsedServings) || parsedServings <= 0) {
      return;
    }

    await nutritionService.addFoodEntry({
      foodId: selectedFood.id,
      food: selectedFood,
      servings: parsedServings,
      meal: selectedMeal,
      date: new Date(),
    });

    navigation.goBack();
  };

  const getServingsValue = () => {
    const parsed = parseFloat(servings);
    return isNaN(parsed) ? 1 : parsed;
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
      onPress={() => setSelectedFood(item)}
    >
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodDetails}>
          {item.calories} cal • {item.servingSize}
          {item.servingUnit}
        </Text>
      </View>
      <View style={styles.foodMacros}>
        <Text style={styles.macroText}>P: {item.protein}g</Text>
        <Text style={styles.macroText}>C: {item.carbs}g</Text>
        <Text style={styles.macroText}>F: {item.fat}g</Text>
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
          Search and add foods to your daily log
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search foods..."
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

      <View style={styles.mealSelector}>
        <Text style={styles.sectionLabel}>Meal</Text>
        <View style={styles.mealChips}>{MEAL_TYPES.map(renderMealChip)}</View>
      </View>

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
            <TouchableOpacity style={styles.addButton} onPress={handleAddFood}>
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
            <TouchableOpacity style={styles.quickActionBtn}>
              <Ionicons name="create-outline" size={24} color="#4CAF50" />
              <Text style={styles.quickActionText}>Create Food</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Foods</Text>
          <FlatList
            data={filteredFoods}
            renderItem={renderFoodItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.foodList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="restaurant-outline" size={48} color="#CCC" />
                <Text style={styles.emptyText}>No foods found</Text>
                <Text style={styles.emptySubtext}>Try a different search</Text>
              </View>
            }
          />
        </>
      )}
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
  },
  macroText: {
    fontSize: 12,
    color: '#888',
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
  servingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  servingsValue: {
    fontSize: 18,
    fontWeight: '600',
    width: 60,
    textAlign: 'center',
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
});

export default AddFoodScreen;
