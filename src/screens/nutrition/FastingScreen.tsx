import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FastingTimer } from '../../components/nutrition/FastingTimer';
import { fastingService, FASTING_SPLITS, FastingSplit } from '../../services/nutrition/FastingService';
import { hapticSelection, hapticSuccess, hapticMedium } from '../../utils/haptics';

const FastingScreen: React.FC = () => {
  const [currentSplit, setCurrentSplit] = useState<FastingSplit>(FASTING_SPLITS[0]);
  const [customHours, setCustomHours] = useState('16');
  const [showSplitPicker, setShowSplitPicker] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  useEffect(() => {
    loadSplit();
  }, []);

  const loadSplit = async () => {
    const split = await fastingService.getFastingSplit();
    setCurrentSplit(split);
    if (split.id === 'custom') {
      const hours = await fastingService.getCustomHours();
      setCustomHours(hours === null ? '' : hours.toString());
    } else if (split.id === 'indefinite') {
      setCustomHours('');
    }
  };

  const handleSplitSelect = async (split: FastingSplit) => {
    hapticSuccess();
    if (split.id === 'custom') {
      setShowSplitPicker(false);
      setShowCustomModal(true);
    } else if (split.id === 'indefinite') {
      await fastingService.setFastingSplit(split);
      setCurrentSplit(split);
      setShowSplitPicker(false);
    } else {
      await fastingService.setFastingSplit(split);
      setCurrentSplit(split);
      setShowSplitPicker(false);
    }
  };

  const handleCustomSave = async () => {
    const trimmed = customHours.trim();
    if (trimmed === '') {
      hapticSuccess();
      await fastingService.setCustomHours(null);
      const indefiniteSplit: FastingSplit = {
        id: 'indefinite',
        label: 'Indefinite',
        description: 'Fast until you decide to eat',
        eatingHours: 0,
        fastingHours: null,
      };
      setCurrentSplit(indefiniteSplit);
      setShowCustomModal(false);
      return;
    }

    const hours = parseFloat(trimmed);
    if (isNaN(hours) || hours < 1 || hours > 24) {
      hapticMedium();
      return;
    }
    hapticSuccess();
    await fastingService.setCustomHours(hours);
    const customSplit: FastingSplit = {
      id: 'custom',
      label: `${hours}:${(24 - hours).toString().padStart(2, '0')}`,
      description: `${hours} hours fasting`,
      eatingHours: 0,
      fastingHours: hours,
    };
    setCurrentSplit(customSplit);
    setShowCustomModal(false);
  };

  const getSplitDescription = (split: FastingSplit) => {
    if (split.id === 'indefinite') {
      return 'Fast without a time limit';
    }
    if (split.id === 'custom') {
      return split.fastingHours === null ? 'Fast without a time limit' : `${split.fastingHours} hours fasting`;
    }
    return split.description;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Intermittent Fasting</Text>
        <Text style={styles.subtitle}>Track your fasting progress</Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.splitSelector}
            onPress={() => {
              hapticSelection();
              setShowSplitPicker(true);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.splitInfo}>
              <Text style={styles.splitLabel}>Fasting Split</Text>
              <Text style={styles.splitValue}>{currentSplit.label}</Text>
              <Text style={styles.splitDescription}>{getSplitDescription(currentSplit)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <FastingTimer split={currentSplit} />

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>How it works</Text>
            <View style={styles.infoItem}>
              <View style={styles.iconCircle}>
                <Ionicons name="restaurant-outline" size={18} color="#4CAF50" />
              </View>
              <Text style={styles.infoText}>Start fasting after your last meal of the day</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.iconCircle}>
                <Ionicons name="time-outline" size={18} color="#4CAF50" />
              </View>
              <Text style={styles.infoText}>The timer tracks your fasting duration automatically</Text>
            </View>
            <View style={styles.infoItem}>
              <View style={styles.iconCircle}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
              </View>
              <Text style={styles.infoText}>Log a meal to end your fast and start a new one</Text>
            </View>
          </View>

          <View style={styles.tipSection}>
            <Text style={styles.tipTitle}>💡 Tip</Text>
            <Text style={styles.tipText}>
              A {currentSplit.label} fasting pattern is a popular approach for metabolic health. 
              Listen to your body and adjust as needed.
            </Text>
          </View>
        </View>
        <View style={styles.bottomPadding} />
      </ScrollView>

      <Modal
        visible={showSplitPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSplitPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Fasting Split</Text>
              <TouchableOpacity onPress={() => setShowSplitPicker(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.splitList}>
              {FASTING_SPLITS.map(split => (
                <TouchableOpacity
                  key={split.id}
                  style={[
                    styles.splitOption,
                    currentSplit.id === split.id && styles.splitOptionActive,
                  ]}
                  onPress={() => handleSplitSelect(split)}
                >
                  <View style={styles.splitOptionContent}>
                    <Text
                      style={[
                        styles.splitOptionLabel,
                        currentSplit.id === split.id && styles.splitOptionLabelActive,
                      ]}
                    >
                      {split.label}
                    </Text>
                    <Text
                      style={[
                        styles.splitOptionDesc,
                        currentSplit.id === split.id && styles.splitOptionDescActive,
                      ]}
                    >
                      {split.description}
                    </Text>
                  </View>
                  {currentSplit.id === split.id && (
                    <Ionicons name="checkmark" size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCustomModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.customModalContent}>
            <Text style={styles.customModalTitle}>Custom Fasting</Text>
            <Text style={styles.customModalSubtitle}>
              Set your fasting duration or leave blank for indefinite
            </Text>

            <View style={styles.customInputContainer}>
              <TextInput
                style={styles.customInput}
                value={customHours}
                onChangeText={setCustomHours}
                keyboardType="decimal-pad"
                placeholder="Leave empty"
                placeholderTextColor="#999"
              />
              <Text style={styles.customUnit}>hours</Text>
            </View>

            <Text style={styles.customHint}>Enter 1-24 hours, or leave blank for indefinite</Text>

            <View style={styles.customButtons}>
              <TouchableOpacity
                style={styles.customCancelBtn}
                onPress={() => setShowCustomModal(false)}
              >
                <Text style={styles.customCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.customSaveBtn}
                onPress={handleCustomSave}
              >
                <Text style={styles.customSaveText}>Save</Text>
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
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  splitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  splitInfo: {
    flex: 1,
  },
  splitLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  splitValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  splitDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 15,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  tipSection: {
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#795548',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  splitList: {
    padding: 16,
  },
  splitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  splitOptionActive: {
    backgroundColor: '#E8F5E9',
  },
  splitOptionContent: {
    flex: 1,
  },
  splitOptionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  splitOptionLabelActive: {
    color: '#4CAF50',
  },
  splitOptionDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  splitOptionDescActive: {
    color: '#4CAF50',
  },
  customModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    margin: 20,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  customModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  customModalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  customInput: {
    flex: 1,
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1A1A1A',
    paddingVertical: 16,
    textAlign: 'center',
  },
  customUnit: {
    fontSize: 24,
    color: '#666',
  },
  customHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  customButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  customCancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  customCancelText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  customSaveBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  customSaveText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default FastingScreen;
