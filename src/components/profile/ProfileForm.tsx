import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import UserProfileService from '../../services/user/UserProfileService';

interface ProfileFormProps {
  initialName?: string;
  initialAge?: string;
  isOnboarding?: boolean;
  onComplete?: (name: string, age: string) => void;
  onSave?: (name: string, age: number) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialName = '',
  initialAge = '',
  isOnboarding = false,
  onComplete,
  onSave,
}) => {
  const navigation = useNavigation();
  const [name, setName] = useState(initialName);
  const [age, setAge] = useState(initialAge);
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

    setSaving(true);
    try {
      const profileService = new UserProfileService();
      const existingProfile = await profileService.getActiveProfile();
      
      await profileService.saveProfile({
        id: existingProfile?.id || 'active',
        name: name.trim(),
        age: ageNum,
        gender: existingProfile?.gender || 'other',
        height: existingProfile?.height || 170,
        weight: existingProfile?.weight || 70,
        weightUnit: existingProfile?.weightUnit || 'kg',
        activityLevel: existingProfile?.activityLevel || 2,
        goals: existingProfile?.goals || [],
        medicalConditions: existingProfile?.medicalConditions || [],
        limitations: existingProfile?.limitations || [],
        createdAt: existingProfile?.createdAt || new Date(),
        updatedAt: new Date(),
      });

      console.log('Profile saved:', name.trim(), ageNum);
      onSave?.(name.trim(), ageNum);
      
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
    <View style={styles.container}>
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
    </View>
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
