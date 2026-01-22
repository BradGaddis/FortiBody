import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import UserProfileService from '../../services/user/UserProfileService';

interface ProfileFormProps {
  initialName?: string;
  initialAge?: string;
  initialGender?: 'male' | 'female';
  initialWeight?: string;
  initialWeightUnit?: 'kg' | 'lbs';
  initialHeight?: string;
  initialHeightUnit?: 'cm' | 'in';
  isOnboarding?: boolean;
  onComplete?: (name: string, age: string) => void;
  onSave?: (name: string, age: number, gender: string) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialName = '',
  initialAge = '',
  initialGender = '',
  initialWeight = '',
  initialWeightUnit = 'kg',
  initialHeight = '',
  initialHeightUnit = 'cm',
  isOnboarding = false,
  onComplete,
  onSave,
}) => {
  const navigation = useNavigation();
  const [name, setName] = useState(initialName);
  const [age, setAge] = useState(initialAge);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState(initialWeight);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(initialWeightUnit);
  const [height, setHeight] = useState(initialHeight);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>(initialHeightUnit);
  const [measurementSystem, setMeasurementSystem] = useState<'metric' | 'imperial'>('metric');
  const [loading, setLoading] = useState(!initialName);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialName) {
      loadExistingData();
    }
  }, []);

  const loadExistingData = async () => {
    try {
      const profileService = new UserProfileService();
      const profile = await profileService.getActiveProfile();
      if (profile) {
        setName(profile.name || '');
        setAge(profile.age ? String(profile.age) : '');
        if (profile.gender && (profile.gender === 'male' || profile.gender === 'female')) {
          setGender(profile.gender);
        }
        if (profile.weight) {
          setWeight(String(profile.weight));
          setWeightUnit(profile.weightUnit || 'kg');
        }
        if (profile.height) {
          setHeight(String(profile.height));
        }
        if ((profile as any).measurementSystem) {
          setMeasurementSystem((profile as any).measurementSystem);
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      Alert.alert('Error', 'Please enter a valid age between 13 and 120');
      return;
    }

    const weightNum = parseFloat(weight);
    if (!weight || isNaN(weightNum) || weightNum < 20 || weightNum > 300) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }

    const heightNum = parseFloat(height);
    if (!height || isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
      Alert.alert('Error', 'Please enter a valid height');
      return;
    }

    setSaving(true);
    try {
      const profileService = new UserProfileService();
      const existingProfile = await profileService.getActiveProfile();
      
      await profileService.saveProfile({
        id: existingProfile?.id || 'active',
        name: name.trim(),
        age: ageNum,
        gender: gender,
        height: heightNum,
        weight: weightNum,
        weightUnit: weightUnit,
        measurementSystem: measurementSystem,
        activityLevel: existingProfile?.activityLevel || 2,
        goals: existingProfile?.goals || [],
        medicalConditions: existingProfile?.medicalConditions || [],
        limitations: existingProfile?.limitations || [],
        createdAt: existingProfile?.createdAt || new Date(),
        updatedAt: new Date(),
      });

      console.log('Profile saved:', name.trim(), ageNum, gender, weightNum, weightUnit, measurementSystem);
      onSave?.(name.trim(), ageNum, gender);
      
      if (isOnboarding) {
        onComplete?.(name.trim(), age.toString());
      } else {
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {isOnboarding ? 'Quick Profile Setup' : 'Profile Details'}
        </Text>
        <Text style={styles.subtitle}>
          {isOnboarding 
            ? 'Just a few details to get started' 
            : 'Update your basic information'}
        </Text>

        <Text style={styles.label}>Your Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor="#999"
          autoFocus={isOnboarding}
        />

        <Text style={styles.label}>Your Age {isOnboarding ? '' : '*'}</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="Enter your age"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Gender {isOnboarding ? '' : '*'}</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[styles.genderOption, gender === 'male' && styles.genderOptionSelected]}
            onPress={() => setGender('male')}
          >
            <Ionicons 
              name="male" 
              size={20} 
              color={gender === 'male' ? '#4CAF50' : '#666'} 
            />
            <Text style={[styles.genderText, gender === 'male' && styles.genderTextSelected]}>
              Male
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.genderOption, gender === 'female' && styles.genderOptionSelected]}
            onPress={() => setGender('female')}
          >
            <Ionicons 
              name="female" 
              size={20} 
              color={gender === 'female' ? '#E91E63' : '#666'} 
            />
            <Text style={[styles.genderText, gender === 'female' && styles.genderTextSelected]}>
              Female
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Your Weight ({weightUnit}) {isOnboarding ? '' : '*'}</Text>
        <View style={styles.weightRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={weight}
            onChangeText={setWeight}
            placeholder={`Enter weight in ${weightUnit}`}
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
          />
          <TouchableOpacity
            style={styles.unitToggle}
            onPress={() => setWeightUnit(weightUnit === 'kg' ? 'lbs' : 'kg')}
          >
            <Text style={styles.unitToggleText}>{weightUnit === 'kg' ? 'lbs' : 'kg'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Your Height ({heightUnit}) {isOnboarding ? '' : '*'}</Text>
        <View style={styles.weightRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={height}
            onChangeText={setHeight}
            placeholder={`Enter height in ${heightUnit}`}
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
          />
          <TouchableOpacity
            style={styles.unitToggle}
            onPress={() => setHeightUnit(heightUnit === 'cm' ? 'in' : 'cm')}
          >
            <Text style={styles.unitToggleText}>{heightUnit === 'cm' ? 'in' : 'cm'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Measurement System {isOnboarding ? '' : '*'}</Text>
        <View style={styles.systemContainer}>
          <TouchableOpacity
            style={[styles.systemOption, measurementSystem === 'metric' && styles.systemOptionSelected]}
            onPress={() => setMeasurementSystem('metric')}
          >
            <Ionicons 
              name="globe" 
              size={20} 
              color={measurementSystem === 'metric' ? '#4CAF50' : '#666'} 
            />
            <Text style={[styles.systemText, measurementSystem === 'metric' && styles.systemTextSelected]}>
              Metric (kg, cm)
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.systemOption, measurementSystem === 'imperial' && styles.systemOptionSelected]}
            onPress={() => setMeasurementSystem('imperial')}
          >
            <Ionicons 
              name="flag" 
              size={20} 
              color={measurementSystem === 'imperial' ? '#FF9800' : '#666'} 
            />
            <Text style={[styles.systemText, measurementSystem === 'imperial' && styles.systemTextSelected]}>
              Imperial (lbs, in)
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? 'Saving...' : isOnboarding ? 'Continue' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  genderContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 8,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    marginHorizontal: 4,
    backgroundColor: '#FAFAFA',
  },
  genderOptionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 6,
  },
  genderTextSelected: {
    color: '#1A1A1A',
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitToggle: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    marginLeft: 10,
  },
  unitToggleText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 14,
  },
  systemContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 8,
  },
  systemOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    marginHorizontal: 4,
    backgroundColor: '#FAFAFA',
  },
  systemOptionSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  systemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 6,
  },
  systemTextSelected: {
    color: '#1A1A1A',
  },
  saveBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveBtnDisabled: {
    backgroundColor: '#A5D6A7',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ProfileForm;
