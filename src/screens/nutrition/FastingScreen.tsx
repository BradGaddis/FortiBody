import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FastingTimer } from '../../components/nutrition/FastingTimer';
import { fastingService, FASTING_SPLITS, FastingSplit } from '../../services/nutrition/FastingService';
import { getCurrentPhase, getUpcomingPhase, FASTING_PHASES, FastingPhase } from '../../utils/fastingTimeline';
import { hapticSelection, hapticSuccess, hapticMedium } from '../../utils/haptics';

const FastingScreen: React.FC = () => {
  const [currentSplit, setCurrentSplit] = useState<FastingSplit>(FASTING_SPLITS[0]);
  const [customHours, setCustomHours] = useState('16');
  const [showSplitPicker, setShowSplitPicker] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [restartTime, setRestartTime] = useState(new Date());
  const [isFasting, setIsFasting] = useState(false);
  const [originalCustomHours, setOriginalCustomHours] = useState<number | null>(null);

  useEffect(() => {
    loadSplit();
    checkFastingStatus();
  }, []);

  const checkFastingStatus = async () => {
    const status = await fastingService.getFastingStatus();
    setIsFasting(status.isFasting);
  };

  const loadSplit = async () => {
    const split = await fastingService.getFastingSplit();
    setCurrentSplit(split);
    if (split.id === 'custom') {
      const hours = await fastingService.getCustomHours();
      setCustomHours(hours === null ? '' : hours.toString());
      setOriginalCustomHours(hours);
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

  const getSplitDescription = (split: FastingSplit) => {
    if (split.id === 'indefinite') {
      return 'Fast without a time limit';
    }
    if (split.id === 'custom') {
      if (split.fastingHours === null) {
        return 'Fast without a time limit';
      }
      return `${split.fastingHours} hours fasting`;
    }
    return split.description;
  };

  const getSplitLabel = (split: FastingSplit) => {
    if (split.id === 'custom') {
      return 'Custom';
    }
    return split.label;
  };

  const handleRestartFast = () => {
    hapticSelection();
    setRestartTime(new Date());
    setShowRestartModal(true);
  };

  const handleRestartNow = async () => {
    hapticSuccess();
    await fastingService.recordMeal();
    setShowRestartModal(false);
    checkFastingStatus();
  };

  const handleRestartAtTime = async () => {
    hapticSuccess();
    await fastingService.setLastMealTime(restartTime);
    setShowRestartModal(false);
    checkFastingStatus();
  };

  const handleEditCustom = () => {
    setShowCustomModal(true);
  };

  const handleResetCustom = async () => {
    hapticSelection();
    if (originalCustomHours !== null) {
      await fastingService.setCustomHours(originalCustomHours);
      setCustomHours(originalCustomHours.toString());
      const updatedSplit: FastingSplit = {
        ...currentSplit,
        fastingHours: originalCustomHours,
        label: `${originalCustomHours}:${(24 - originalCustomHours).toString().padStart(2, '0')}`,
        description: `${originalCustomHours} hours fasting`,
      };
      setCurrentSplit(updatedSplit);
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
              <Text style={styles.splitValue}>{getSplitLabel(currentSplit)}</Text>
              <Text style={styles.splitDescription}>{getSplitDescription(currentSplit)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <FastingTimer split={currentSplit} onRestart={handleRestartFast} />

          {isFasting && (
            <TouchableOpacity
              style={styles.deleteRestartBtn}
              onPress={async () => {
                hapticSelection();
                await fastingService.clearLastMealTime();
                await fastingService.recordMeal();
                checkFastingStatus();
              }}
            >
              <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
              <Text style={styles.deleteRestartText}>Delete Custom Time</Text>
            </TouchableOpacity>
          )}

          {currentSplit.id === 'custom' && isFasting && (
            <View style={styles.customActions}>
              <TouchableOpacity style={styles.editButton} onPress={handleEditCustom}>
                <Ionicons name="create-outline" size={18} color="#4CAF50" />
                <Text style={styles.editButtonText}>Edit Duration</Text>
              </TouchableOpacity>
              {originalCustomHours !== null && (
                <TouchableOpacity style={styles.resetButton} onPress={handleResetCustom}>
                  <Ionicons name="return-down-back-outline" size={18} color="#FF9800" />
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

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

          <View style={styles.timelineSection}>
            <Text style={styles.timelineSectionTitle}>Fasting Timeline</Text>
            <Text style={styles.timelineSectionSubtitle}>What happens during your fast</Text>
            
            {FASTING_PHASES.slice(1).map((phase, index) => {
              const currentPhase = getCurrentPhase(currentSplit.fastingHours || 8);
              const isCurrentPhase = phase.hours === currentPhase.hours;
              
              return (
                <View 
                  key={phase.hours} 
                  style={[
                    styles.timelinePhase,
                    isCurrentPhase && styles.timelinePhaseActive
                  ]}
                >
                  <View style={styles.timelinePhaseHeader}>
                    <View style={styles.timelineTimeBadge}>
                      <Text style={styles.timelineTimeText}>{phase.hours}h</Text>
                    </View>
                    <View style={styles.timelinePhaseInfo}>
                      <Text style={styles.timelinePhaseTitle}>{phase.title}</Text>
                      <Text style={styles.timelinePhaseDesc}>{phase.description}</Text>
                      {isCurrentPhase && (
                        <View style={styles.timelineCurrentBadge}>
                          <Ionicons name="ellipse" size={8} color="#4CAF50" />
                          <Text style={styles.timelineCurrentText}>Current Phase</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
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
                      {split.id === 'custom' ? 'Custom' : split.label}
                    </Text>
                    <Text
                      style={[
                        styles.splitOptionDesc,
                        currentSplit.id === split.id && styles.splitOptionDescActive,
                      ]}
                    >
                      {split.id === 'custom' 
                        ? (split.fastingHours ? `${split.fastingHours} hours` : 'Custom duration')
                        : split.description}
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

      <Modal
        visible={showRestartModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRestartModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.customModalContent}>
            <Text style={styles.customModalTitle}>Restart Fast</Text>
            <Text style={styles.customModalSubtitle}>
              When did you have your last meal?
            </Text>

            <View style={styles.restartTimeDisplay}>
              <Text style={styles.restartTimeLabel}>Last meal time:</Text>
              <Text style={styles.restartTimeValue}>
                {restartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>

            <View style={styles.timePresetButtons}>
              <TouchableOpacity
                style={styles.timePresetBtn}
                onPress={() => setRestartTime(new Date())}
              >
                <Text style={styles.timePresetBtnText}>Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timePresetBtn}
                onPress={() => {
                  const d = new Date();
                  d.setHours(d.getHours() - 1);
                  setRestartTime(d);
                }}
              >
                <Text style={styles.timePresetBtnText}>1h ago</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timePresetBtn}
                onPress={() => {
                  const d = new Date();
                  d.setHours(d.getHours() - 2);
                  setRestartTime(d);
                }}
              >
                <Text style={styles.timePresetBtnText}>2h ago</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timePresetBtn}
                onPress={() => {
                  const d = new Date();
                  d.setHours(d.getHours() - 4);
                  setRestartTime(d);
                }}
              >
                <Text style={styles.timePresetBtnText}>4h ago</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.customHint}>Or pick a custom time below</Text>

            <View style={styles.timeInputRow}>
              <TextInput
                style={styles.timeInput}
                value={restartTime.getHours().toString()}
                onChangeText={(text) => {
                  const d = new Date(restartTime);
                  const h = parseInt(text) || 0;
                  d.setHours(Math.max(0, Math.min(23, h)));
                  setRestartTime(d);
                }}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={styles.timeSeparator}>:</Text>
              <TextInput
                style={styles.timeInput}
                value={restartTime.getMinutes().toString().padStart(2, '0')}
                onChangeText={(text) => {
                  const d = new Date(restartTime);
                  const m = parseInt(text) || 0;
                  d.setMinutes(Math.max(0, Math.min(59, m)));
                  setRestartTime(d);
                }}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>

            <View style={styles.restartActionButtons}>
              <TouchableOpacity
                style={styles.restartDeleteBtn}
                onPress={handleRestartNow}
              >
                <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                <Text style={styles.restartDeleteText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.customSaveBtn}
                onPress={handleRestartAtTime}
              >
                <Text style={styles.customSaveText}>Start Fast</Text>
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
  timelineSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  timelineSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  timelineSectionSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
    marginBottom: 16,
  },
  timelinePhase: {
    flexDirection: 'column',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  timelinePhaseActive: {
    backgroundColor: '#F0FFF0',
    marginHorizontal: -12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderBottomWidth: 0,
    marginBottom: 12,
    paddingBottom: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  timelinePhaseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timelineTimeBadge: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 48,
    alignItems: 'center',
  },
  timelineTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  timelinePhaseInfo: {
    flex: 1,
  },
  timelinePhaseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  timelinePhaseDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    lineHeight: 18,
  },
  timelineCurrentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  timelineCurrentText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4CAF50',
  },
  editCustomOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    gap: 8,
  },
  editCustomText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  customActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
    marginBottom: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
  },
  restartTimeDisplay: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  restartTimeLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  restartTimeValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  timePresetButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  timePresetBtn: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  timePresetBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  timeInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 70,
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginHorizontal: 8,
  },
  restartActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  restartDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
    flex: 1,
  },
  restartDeleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  deleteRestartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 12,
    gap: 8,
  },
  deleteRestartText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B6B',
  },
});

export default FastingScreen;
