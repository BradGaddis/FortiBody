import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Camera } from 'expo-camera';
import { nutritionService } from '../../services/nutrition/NutritionService';
import { MealType, MEAL_TYPES, FoodItem } from '../../services/nutrition/types';

interface BarcodeScannerScreenProps {
  navigation: any;
}

interface ScannedProduct {
  food: FoodItem | null;
  loading: boolean;
  error: string | null;
}

export const BarcodeScannerScreen: React.FC<BarcodeScannerScreenProps> = ({
  navigation,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [productData, setProductData] = useState<ScannedProduct>({
    food: null,
    loading: false,
    error: null,
  });
  const [selectedMeal, setSelectedMeal] = useState<MealType>('snacks');
  const [servings, setServings] = useState<string>('1.00');
  const [flashMode, setFlashMode] = useState(false);
  
  // Editable food fields
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCalories, setEditCalories] = useState('');
  const [editProtein, setEditProtein] = useState('');
  const [editCarbs, setEditCarbs] = useState('');
  const [editFat, setEditFat] = useState('');
  const [editServingSize, setEditServingSize] = useState('');
  const [editServingUnit, setEditServingUnit] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (productData.food) {
      setEditName(productData.food.name);
      setEditCalories(productData.food.calories.toString());
      setEditProtein(productData.food.protein.toString());
      setEditCarbs(productData.food.carbs.toString());
      setEditFat(productData.food.fat.toString());
      setEditServingSize(productData.food.servingSize.toString());
      setEditServingUnit(productData.food.servingUnit);
    }
  }, [productData.food]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    setProductData({ food: null, loading: true, error: null });
    setEditMode(false);

    nutritionService.getFoodByBarcode(data).then(food => {
      if (food) {
        setProductData({ food, loading: false, error: null });
      } else {
        setProductData({
          food: null,
          loading: false,
          error: 'Product not found. You can add it manually.',
        });
      }
    }).catch(() => {
      setProductData({
        food: null,
        loading: false,
        error: 'Failed to fetch product data. Please try again.',
      });
    });
  };

  const getServingsValue = () => {
    const parsed = parseFloat(servings);
    return isNaN(parsed) ? 1 : parsed;
  };

  const handleSaveEdits = () => {
    if (!productData.food) return;

    const updatedFood: FoodItem = {
      ...productData.food,
      name: editName,
      calories: parseFloat(editCalories) || 0,
      protein: parseFloat(editProtein) || 0,
      carbs: parseFloat(editCarbs) || 0,
      fat: parseFloat(editFat) || 0,
      servingSize: parseFloat(editServingSize) || 100,
      servingUnit: editServingUnit || 'g',
    };

    setProductData({ ...productData, food: updatedFood });
    setEditMode(false);
  };

  const handleAddFood = async () => {
    let foodToSave = productData.food;
    
    // If in edit mode, use the edited values
    if (editMode && productData.food) {
      foodToSave = {
        id: productData.food.id,
        name: editName,
        calories: parseFloat(editCalories) || 0,
        protein: parseFloat(editProtein) || 0,
        carbs: parseFloat(editCarbs) || 0,
        fat: parseFloat(editFat) || 0,
        servingSize: parseFloat(editServingSize) || 100,
        servingUnit: editServingUnit || 'g',
        barcode: productData.food.barcode || '',
        isCustom: true,
        createdAt: new Date(),
      };
    }

    if (!foodToSave) return;

    const parsedServings = getServingsValue();
    await nutritionService.addFoodEntry({
      foodId: foodToSave.id,
      food: foodToSave,
      servings: parsedServings,
      meal: selectedMeal,
      date: new Date(),
    });

    Alert.alert(
      'Food Added',
      `${foodToSave.name} added to ${MEAL_TYPES.find(m => m.id === selectedMeal)?.label}`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const handleCreateManual = () => {
    navigation.navigate('AddFood' as any, { barcode: null });
  };

  const toggleFlash = () => {
    setFlashMode(!flashMode);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Ionicons name="camera" size={80} color="#F44336" />
          <Text style={styles.title}>Camera Permission Required</Text>
          <Text style={styles.subtitle}>
            Please enable camera access in your device settings to scan
            barcodes.
          </Text>
          <TouchableOpacity
            style={styles.manualEntryBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.manualEntryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (productData.food && !productData.loading) {
    const food = productData.food;
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => {
              setScanned(false);
              setProductData({ food: null, loading: false, error: null });
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editMode ? 'Edit Food' : 'Product Found'}</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditMode(!editMode)}>
            <Ionicons name={editMode ? 'checkmark' : 'create-outline'} size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.productCard}>
            {editMode ? (
              <>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.editInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Food name"
                />
                
                <View style={styles.nutritionEditGrid}>
                  <View style={styles.nutritionEditItem}>
                    <Text style={styles.label}>Calories</Text>
                    <TextInput
                      style={styles.editInputSmall}
                      value={editCalories}
                      onChangeText={setEditCalories}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.nutritionEditItem}>
                    <Text style={styles.label}>Protein (g)</Text>
                    <TextInput
                      style={styles.editInputSmall}
                      value={editProtein}
                      onChangeText={setEditProtein}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.nutritionEditItem}>
                    <Text style={styles.label}>Carbs (g)</Text>
                    <TextInput
                      style={styles.editInputSmall}
                      value={editCarbs}
                      onChangeText={setEditCarbs}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.nutritionEditItem}>
                    <Text style={styles.label}>Fat (g)</Text>
                    <TextInput
                      style={styles.editInputSmall}
                      value={editFat}
                      onChangeText={setEditFat}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.servingEditRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Serving Size</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editServingSize}
                      onChangeText={setEditServingSize}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.label}>Unit</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editServingUnit}
                      onChangeText={setEditServingUnit}
                    />
                  </View>
                </View>

                <Text style={styles.previewCalories}>
                  {Math.round((parseFloat(editCalories) || 0) * getServingsValue())} calories per serving
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.productName}>{food.name}</Text>
                {food.brand && <Text style={styles.productBrand}>{food.brand}</Text>}
                
                <View style={styles.nutritionGrid}>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {Math.round(food.calories * getServingsValue())}
                    </Text>
                    <Text style={styles.nutritionLabel}>Calories</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {Math.round(food.protein * getServingsValue())}g
                    </Text>
                    <Text style={styles.nutritionLabel}>Protein</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {Math.round(food.carbs * getServingsValue())}g
                    </Text>
                    <Text style={styles.nutritionLabel}>Carbs</Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>
                      {Math.round(food.fat * getServingsValue())}g
                    </Text>
                    <Text style={styles.nutritionLabel}>Fat</Text>
                  </View>
                </View>

                <Text style={styles.servingInfo}>
                  Per serving: {food.servingSize}{food.servingUnit}
                </Text>
              </>
            )}
          </View>

          <View style={styles.mealSelector}>
            <Text style={styles.sectionLabel}>Add to Meal</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {MEAL_TYPES.map(({ id, label }) => (
                <TouchableOpacity
                  key={id}
                  style={[
                    styles.mealChip,
                    selectedMeal === id && styles.mealChipActive,
                  ]}
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
              ))}
            </ScrollView>
          </View>

          <View style={styles.servingsSection}>
            <Text style={styles.sectionLabel}>Servings</Text>
            <View style={styles.servingsControl}>
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
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddFood}>
            <Ionicons name="add-circle" size={20} color="#FFF" />
            <Text style={styles.addButtonText}>
              Add to {MEAL_TYPES.find(m => m.id === selectedMeal)?.label}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.scanAgainBtn}
            onPress={() => {
              setScanned(false);
              setProductData({ food: null, loading: false, error: null });
            }}
          >
            <Ionicons name="refresh-outline" size={20} color="#4CAF50" />
            <Text style={styles.scanAgainText}>Scan Another Product</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (productData.loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Searching...</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Looking up product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (productData.error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => {
              setScanned(false);
              setProductData({ food: null, loading: false, error: null });
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Not Found</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.content}>
          <Ionicons name="warning-outline" size={80} color="#FF9800" />
          <Text style={styles.errorTitle}>{productData.error}</Text>
          <TouchableOpacity
            style={styles.manualButton}
            onPress={handleCreateManual}
          >
            <Ionicons name="create-outline" size={24} color="#FFF" />
            <Text style={styles.manualButtonText}>Add Food Manually</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.scanAgainLink}
            onPress={() => {
              setScanned(false);
              setProductData({ food: null, loading: false, error: null });
            }}
          >
            <Text style={styles.scanAgainLinkText}>Scan Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Barcode</Text>
        <TouchableOpacity style={styles.flashBtn} onPress={toggleFlash}>
          <Ionicons
            name={flashMode ? 'flashlight' : 'flashlight-outline'}
            size={24}
            color={flashMode ? '#FFD700' : '#FFF'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cameraContainer}>
        <Camera
          style={StyleSheet.absoluteFillObject}
          onBarCodeScanned={scanned ? undefined : (handleBarCodeScanned as any)}
          flashMode={flashMode ? 2 : 0}
        />
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>
        </View>
      </View>

      <View style={styles.instructions}>
        <Ionicons name="barcode-outline" size={24} color="#4CAF50" />
        <Text style={styles.instructionsText}>
          Position the barcode within the frame
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  closeBtn: {
    padding: 4,
  },
  flashBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  headerSpacer: {
    width: 32,
  },
  editBtn: {
    padding: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  editInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 12,
  },
  editInputSmall: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  nutritionEditGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nutritionEditItem: {
    width: '48%',
    marginBottom: 12,
  },
  servingEditRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  previewCalories: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    fontWeight: '500',
  },
  cameraContainer: {
    height: 350,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanArea: {
    width: 280,
    height: 180,
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#4CAF50',
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#4CAF50',
    borderTopRightRadius: 8,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#4CAF50',
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#4CAF50',
    borderBottomRightRadius: 8,
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  instructionsText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  productCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  productBrand: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  servingInfo: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  mealSelector: {
    marginBottom: 20,
  },
  mealChip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 10,
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
  servingsSection: {
    marginBottom: 20,
  },
  servingsControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  servingsBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  servingsValue: {
    fontSize: 20,
    fontWeight: '600',
    width: 80,
    textAlign: 'center',
  },
  servingsInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
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
    paddingVertical: 16,
    marginBottom: 16,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  scanAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  scanAgainText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  errorTitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  manualButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  scanAgainLink: {
    paddingVertical: 16,
  },
  scanAgainLinkText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  manualEntryBtn: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  manualEntryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
});

export default BarcodeScannerScreen;
