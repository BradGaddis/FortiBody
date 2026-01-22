import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Exercise } from '@/services/exercise/exerciseLibrary';

interface CreateExerciseProps {
  navigation: any;
  onExerciseCreated: (exercise: Exercise) => void;
}

const CreateExerciseScreen = ({
  navigation,
  onExerciseCreated,
}: CreateExerciseProps) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<
    'strength' | 'bodyweight' | 'cardio' | 'flexibility'
  >('strength');
  const [equipment, setEquipment] = useState('');
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newMuscleGroup, setNewMuscleGroup] = useState('');

  const categories = ['strength', 'bodyweight', 'cardio', 'flexibility'];
  const commonMuscleGroups = [
    'chest',
    'back',
    'shoulders',
    'biceps',
    'triceps',
    'quadriceps',
    'hamstrings',
    'glutes',
    'calves',
    'core',
    'forearms',
    'traps',
    'lats',
  ];

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const addMuscleGroup = () => {
    if (
      newMuscleGroup.trim() &&
      !muscleGroups.includes(newMuscleGroup.trim())
    ) {
      setMuscleGroups([...muscleGroups, newMuscleGroup.trim()]);
      setNewMuscleGroup('');
    }
  };

  const removeMuscleGroup = (index: number) => {
    setMuscleGroups(muscleGroups.filter((_, i) => i !== index));
  };

  const saveExercise = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an exercise name');
      return;
    }

    if (!instructions.trim()) {
      Alert.alert('Error', 'Please enter exercise instructions');
      return;
    }

    const newExercise: Exercise = {
      name: name.trim(),
      img:
        selectedImage || require('../../../assets/basketball-placeholder.png'),
      id: Date.now().toString(),
      category,
      equipment: equipment.trim() || 'none',
      muscleGroups,
      instructions: instructions.trim(),
    };

    onExerciseCreated(newExercise);

    Alert.alert('Success', 'Exercise created successfully!', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Create Custom Exercise</Text>

        {/* Exercise Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Exercise Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter exercise name"
          />
        </View>

        {/* Category */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.optionsContainer}
          >
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryOption,
                  category === cat && styles.selectedOption,
                ]}
                onPress={() => setCategory(cat as any)}
              >
                <Text
                  style={[
                    styles.optionText,
                    category === cat && styles.selectedText,
                  ]}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Equipment */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Equipment</Text>
          <TextInput
            style={styles.input}
            value={equipment}
            onChangeText={setEquipment}
            placeholder="e.g., barbell, dumbbells, none"
          />
        </View>

        {/* Muscle Groups */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Muscle Groups</Text>
          <View style={styles.muscleGroupsContainer}>
            <View style={styles.addMuscleGroup}>
              <TextInput
                style={styles.muscleInput}
                value={newMuscleGroup}
                onChangeText={setNewMuscleGroup}
                placeholder="Add muscle group"
                onSubmitEditing={addMuscleGroup}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={addMuscleGroup}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Common muscle groups */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.commonMuscles}
            >
              {commonMuscleGroups.map(muscle => (
                <TouchableOpacity
                  key={muscle}
                  style={[
                    styles.muscleChip,
                    muscleGroups.includes(muscle) && styles.selectedMuscle,
                  ]}
                  onPress={() => {
                    if (!muscleGroups.includes(muscle)) {
                      setMuscleGroups([...muscleGroups, muscle]);
                    }
                  }}
                >
                  <Text style={styles.muscleText}>{muscle}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Selected muscle groups */}
            <View style={styles.selectedMuscles}>
              {muscleGroups.map((muscle, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.selectedMuscle}
                  onPress={() => removeMuscleGroup(index)}
                >
                  <Text style={styles.muscleText}>{muscle} ×</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Instructions *</Text>
          <TextInput
            style={[styles.input, styles.instructionsInput]}
            value={instructions}
            onChangeText={setInstructions}
            placeholder="Describe how to perform this exercise..."
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Image */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Exercise Image</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                style={styles.selectedImage}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>
                  Tap to add image
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={saveExercise}>
          <Text style={styles.saveButtonText}>Save Exercise</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  fieldContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  instructionsInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
  },
  categoryOption: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedText: {
    color: 'white',
    fontWeight: '600',
  },
  muscleGroupsContainer: {
    minHeight: 80,
  },
  addMuscleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  muscleInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  commonMuscles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  selectedMuscles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  muscleChip: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedMuscle: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  muscleText: {
    fontSize: 12,
    color: '#666',
  },
  imagePicker: {
    alignSelf: 'center',
    marginBottom: 30,
  },
  selectedImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    color: '#999',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateExerciseScreen;
