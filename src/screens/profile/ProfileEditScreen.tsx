import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  StyleSheet,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
// import { Picker } from '@react-native-picker/picker';
// import DateTimePicker from '@react-native-community/datetimepicker';
import UserProfileService, {
  UserProfile,
  FitnessGoal,
} from '@/services/user/UserProfileService';

type ProfileStackParamList = {
  ProfileEdit: { profile?: UserProfile };
  ProfileGoals: { profileId: string };
  ProfileMeasurements: { profileId: string };
};

type ProfileEditScreenNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  'ProfileEdit'
>;
type ProfileEditScreenRouteProp = RouteProp<
  ProfileStackParamList,
  'ProfileEdit'
>;

interface Props {
  navigation: ProfileEditScreenNavigationProp;
  route: ProfileEditScreenRouteProp;
}

const ProfileEditScreen: React.FC<Props> = ({ navigation, route }) => {
  const { profile } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    age: 30,
    gender: 'other',
    height: 170,
    weight: 70,
    activityLevel: 2,
    medicalConditions: [],
    limitations: [],
    goals: [],
  });

  const [newMedicalCondition, setNewMedicalCondition] = useState('');
  const [newLimitation, setNewLimitation] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        ...profile,
        medicalConditions: profile.medicalConditions || [],
        limitations: profile.limitations || [],
      });
    }
  }, [profile]);

  const saveProfile = async () => {
    if (!formData.name?.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!formData.age || formData.age < 13 || formData.age > 120) {
      Alert.alert('Error', 'Please enter a valid age between 13 and 120');
      return;
    }

    if (!formData.height || formData.height < 100 || formData.height > 250) {
      Alert.alert(
        'Error',
        'Please enter a valid height between 100 and 250 cm'
      );
      return;
    }

    if (!formData.weight || formData.weight < 30 || formData.weight > 300) {
      Alert.alert('Error', 'Please enter a valid weight between 30 and 300 kg');
      return;
    }

    setLoading(true);
    try {
      const profileService = new UserProfileService();
      const profileData = {
        ...(formData as UserProfile),
        createdAt: profile?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      await profileService.saveProfile(profileData);
      Alert.alert(
        'Success',
        profile
          ? 'Profile updated successfully!'
          : 'Profile created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const addMedicalCondition = () => {
    if (newMedicalCondition.trim()) {
      setFormData(prev => ({
        ...prev,
        medicalConditions: [
          ...(prev.medicalConditions || []),
          newMedicalCondition.trim(),
        ],
      }));
      setNewMedicalCondition('');
    }
  };

  const removeMedicalCondition = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicalConditions:
        prev.medicalConditions?.filter((_, i) => i !== index) || [],
    }));
  };

  const addLimitation = () => {
    if (newLimitation.trim()) {
      setFormData(prev => ({
        ...prev,
        limitations: [...(prev.limitations || []), newLimitation.trim()],
      }));
      setNewLimitation('');
    }
  };

  const removeLimitation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      limitations: prev.limitations?.filter((_, i) => i !== index) || [],
    }));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>
        {profile ? 'Edit Profile' : 'Create Profile'}
      </Text>

      {/* Basic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={formData.name}
          onChangeText={text => setFormData(prev => ({ ...prev, name: text }))}
        />

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="Age"
              value={formData.age?.toString()}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, age: parseInt(text) || 0 }))
              }
              keyboardType="numeric"
            />
          </View>

          <View style={styles.halfWidth}>
            <Text style={styles.label}>Gender</Text>
            <View style={[styles.input, { justifyContent: 'center' }]}>
              <Text>{formData.gender}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Physical Measurements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Physical Measurements</Text>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              placeholder="Height"
              value={formData.height?.toString()}
              onChangeText={text =>
                setFormData(prev => ({
                  ...prev,
                  height: parseFloat(text) || 0,
                }))
              }
              keyboardType="numeric"
            />
          </View>

          <View style={styles.halfWidth}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Weight"
              value={formData.weight?.toString()}
              onChangeText={text =>
                setFormData(prev => ({
                  ...prev,
                  weight: parseFloat(text) || 0,
                }))
              }
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Text style={styles.label}>Target Weight (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="Target Weight (optional)"
              value={formData.targetWeight?.toString()}
              onChangeText={text =>
                setFormData(prev => ({
                  ...prev,
                  ...(text ? { targetWeight: parseFloat(text) } : {}),
                }))
              }
              keyboardType="numeric"
            />
          </View>

          <View style={styles.halfWidth}>
            <Text style={styles.label}>Activity Level</Text>
            <View style={[styles.input, { justifyContent: 'center' }]}>
              <Text>{formData.activityLevel}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Medical Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medical Information</Text>

        <Text style={styles.label}>Medical Conditions</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Add medical condition"
            value={newMedicalCondition}
            onChangeText={setNewMedicalCondition}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={addMedicalCondition}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {formData.medicalConditions?.map((condition, index) => (
          <View key={index} style={styles.tagContainer}>
            <Text style={styles.tagText}>{condition}</Text>
            <TouchableOpacity onPress={() => removeMedicalCondition(index)}>
              <Text style={styles.removeTag}>×</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={[styles.label, { marginTop: 15 }]}>
          Physical Limitations
        </Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Add physical limitation"
            value={newLimitation}
            onChangeText={setNewLimitation}
          />
          <TouchableOpacity style={styles.addButton} onPress={addLimitation}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {formData.limitations?.map((limitation, index) => (
          <View key={index} style={styles.tagContainer}>
            <Text style={styles.tagText}>{limitation}</Text>
            <TouchableOpacity onPress={() => removeLimitation(index)}>
              <Text style={styles.removeTag}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Goals Section */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.sectionTitle}>Goals</Text>
          <TouchableOpacity
            onPress={() => {
              if (profile?.id) {
                navigation.navigate('ProfileGoals', { profileId: profile.id });
              }
            }}
          >
            <Text style={styles.linkText}>Manage Goals</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.description}>
          Set fitness goals to track your progress and get personalized
          recommendations.
        </Text>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveButton, loading && styles.disabledButton]}
        onPress={saveProfile}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading
            ? 'Saving...'
            : profile
              ? 'Update Profile'
              : 'Create Profile'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    flex: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  halfWidth: {
    flex: 1,
    marginRight: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginTop: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 8,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  tagText: {
    color: '#1976d2',
    marginRight: 8,
  },
  removeTag: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default ProfileEditScreen;
