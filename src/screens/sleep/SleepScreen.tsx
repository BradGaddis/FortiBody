import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sleepService, SleepEntry, SleepGoal } from '../../services/sleep/SleepService';
import { MEAL_TYPES } from '../../services/nutrition/types';
import { hapticSelection, hapticSuccess, hapticMedium } from '../../utils/haptics';

type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent';

const SLEEP_QUALITIES: { id: SleepQuality; label: string; emoji: string; color: string }[] = [
  { id: 'poor', label: 'Poor', emoji: '😫', color: '#F44336' },
  { id: 'fair', label: 'Fair', emoji: '😐', color: '#FF9800' },
  { id: 'good', label: 'Good', emoji: '🙂', color: '#4CAF50' },
  { id: 'excellent', label: 'Excellent', emoji: '😴', color: '#2196F3' },
];

const SleepScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [lastNight, setLastNight] = useState<SleepEntry | null>(null);
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [sleepGoal, setSleepGoal] = useState<SleepGoal>({ hours: 8, bedtime: '22:00', waketime: '06:00' });

  const [bedtime, setBedtime] = useState('22:00');
  const [waketime, setWaketime] = useState('06:00');
  const [quality, setQuality] = useState<SleepQuality>('good');
  const [notes, setNotes] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryData, lastNightData, allEntries, goal] = await Promise.all([
        sleepService.getSleepSummary(7),
        sleepService.getLastNightSleep(),
        sleepService.getAllEntries(),
        sleepService.getSleepGoal(),
      ]);
      
      setSummary(summaryData);
      setLastNight(lastNightData);
      setEntries(allEntries.slice(0, 7));
      setSleepGoal(goal);
    } catch (error) {
      console.error('Failed to load sleep data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogSleep = async () => {
    const [bedHour, bedMin] = bedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = waketime.split(':').map(Number);
    
    const now = new Date();
    const startTime = new Date(now);
    startTime.setHours(bedHour, bedMin, 0, 0);
    
    const endTime = new Date(now);
    endTime.setHours(wakeHour, wakeMin, 0, 0);
    
    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);

    hapticSuccess();
    await sleepService.addSleepEntry({
      startTime,
      endTime,
      duration,
      quality,
      notes: notes.trim() || undefined,
    });

    setShowLogModal(false);
    setNotes('');
    loadData();
  };

  const handleDeleteEntry = async (id: string) => {
    hapticMedium();
    await sleepService.deleteEntry(id);
    loadData();
  };

  const handleGoalSave = async () => {
    hapticSuccess();
    await sleepService.setSleepGoal(sleepGoal);
    setShowGoalModal(false);
  };

  const getQualityInfo = (q: SleepQuality) => SLEEP_QUALITIES.find(i => i.id === q)!;

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
        <Text style={styles.title}>Sleep</Text>
        <Text style={styles.subtitle}>Track your rest and recovery</Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="moon" size={24} color="#4CAF50" />
              <Text style={styles.statValue}>
                {summary ? sleepService.formatDuration(summary.averageDuration) : '0h'}
              </Text>
              <Text style={styles.statLabel}>Avg. Duration</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="flame" size={24} color="#FF9800" />
              <Text style={styles.statValue}>{summary?.streak || 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>

          {lastNight && (
            <View style={styles.lastNightCard}>
              <View style={styles.lastNightHeader}>
                <Text style={styles.lastNightTitle}>Last Night</Text>
                <TouchableOpacity onPress={() => setShowGoalModal(true)}>
                  <Ionicons name="settings-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <View style={styles.lastNightContent}>
                <View style={styles.lastNightTime}>
                  <Text style={styles.lastNightDuration}>
                    {sleepService.formatDuration(lastNight.duration)}
                  </Text>
                  <Text style={styles.lastNightTimeRange}>
                    {sleepService.formatTime(lastNight.startTime)} - {sleepService.formatTime(lastNight.endTime)}
                  </Text>
                </View>
                <View style={styles.qualityBadge}>
                  <Text style={styles.qualityEmoji}>{getQualityInfo(lastNight.quality).emoji}</Text>
                  <Text style={styles.qualityLabel}>{getQualityInfo(lastNight.quality).label}</Text>
                </View>
              </View>
              {lastNight.notes && (
                <Text style={styles.lastNightNotes}>"{lastNight.notes}"</Text>
              )}
            </View>
          )}

          <TouchableOpacity style={styles.logButton} onPress={() => setShowLogModal(true)}>
            <Ionicons name="add-circle" size={24} color="#FFF" />
            <Text style={styles.logButtonText}>Log Sleep</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Recent Sleep</Text>
          
          {entries.length > 0 ? (
            entries.map(entry => (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryDate}>{sleepService.formatDate(new Date(entry.startTime))}</Text>
                  <TouchableOpacity onPress={() => handleDeleteEntry(entry.id)}>
                    <Ionicons name="trash-outline" size={18} color="#F44336" />
                  </TouchableOpacity>
                </View>
                <View style={styles.entryContent}>
                  <View style={styles.entryDuration}>
                    <Text style={styles.entryDurationText}>{sleepService.formatDuration(entry.duration)}</Text>
                    <Text style={styles.entryTimeRange}>
                      {sleepService.formatTime(new Date(entry.startTime))} - {sleepService.formatTime(new Date(entry.endTime))}
                    </Text>
                  </View>
                  <View style={[styles.qualityBadge, { backgroundColor: getQualityInfo(entry.quality).color + '20' }]}>
                    <Text style={styles.qualityEmoji}>{getQualityInfo(entry.quality).emoji}</Text>
                    <Text style={[styles.qualityLabel, { color: getQualityInfo(entry.quality).color }]}>
                      {getQualityInfo(entry.quality).label}
                    </Text>
                  </View>
                </View>
                {entry.notes && <Text style={styles.entryNotes}>{entry.notes}</Text>}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="moon-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>No sleep logged yet</Text>
              <Text style={styles.emptySubtext}>Tap "Log Sleep" to get started</Text>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      <Modal visible={showLogModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Sleep</Text>
              <TouchableOpacity onPress={() => setShowLogModal(false)}>
                <Ionicons name="close-circle" size={28} color="#999" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>Bedtime</Text>
              <View style={styles.timeInputRow}>
                <TextInput
                  style={styles.timeInput}
                  value={bedtime}
                  onChangeText={setBedtime}
                  placeholder="22:00"
                  placeholderTextColor="#999"
                />
                <Text style={styles.timeHint}>24h format (HH:mm)</Text>
              </View>

              <Text style={styles.inputLabel}>Wake Time</Text>
              <View style={styles.timeInputRow}>
                <TextInput
                  style={styles.timeInput}
                  value={waketime}
                  onChangeText={setWaketime}
                  placeholder="06:00"
                  placeholderTextColor="#999"
                />
                <Text style={styles.timeHint}>24h format (HH:mm)</Text>
              </View>

              <Text style={styles.inputLabel}>Quality</Text>
              <View style={styles.qualitySelector}>
                {SLEEP_QUALITIES.map(q => (
                  <TouchableOpacity
                    key={q.id}
                    style={[
                      styles.qualityOption,
                      quality === q.id && { backgroundColor: q.color + '20', borderColor: q.color },
                    ]}
                    onPress={() => {
                      hapticSelection();
                      setQuality(q.id);
                    }}
                  >
                    <Text style={styles.qualityOptionEmoji}>{q.emoji}</Text>
                    <Text style={[
                      styles.qualityOptionLabel,
                      quality === q.id && { color: q.color },
                    ]}>{q.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Notes (optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="How did you sleep?"
                placeholderTextColor="#999"
                multiline
              />
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowLogModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleLogSleep}>
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showGoalModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.goalModalContent}>
            <Text style={styles.goalModalTitle}>Sleep Goal</Text>

            <Text style={styles.inputLabel}>Target Hours</Text>
            <TextInput
              style={styles.hoursInput}
              value={sleepGoal.hours.toString()}
              onChangeText={text => setSleepGoal({ ...sleepGoal, hours: parseFloat(text) || 8 })}
              keyboardType="decimal-pad"
              placeholder="8"
            />

            <Text style={styles.inputLabel}>Target Bedtime</Text>
            <TextInput
              style={styles.timeInput}
              value={sleepGoal.bedtime}
              onChangeText={text => setSleepGoal({ ...sleepGoal, bedtime: text })}
              placeholder="22:00"
            />

            <Text style={styles.inputLabel}>Target Wake Time</Text>
            <TextInput
              style={styles.timeInput}
              value={sleepGoal.waketime}
              onChangeText={text => setSleepGoal({ ...sleepGoal, waketime: text })}
              placeholder="06:00"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowGoalModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleGoalSave}>
                <Text style={styles.modalSaveText}>Save</Text>
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
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  lastNightCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  lastNightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lastNightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  lastNightContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastNightDuration: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  lastNightTimeRange: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  lastNightNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  qualityEmoji: {
    fontSize: 16,
  },
  qualityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 20,
  },
  logButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  entryCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  entryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryDurationText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  entryTimeRange: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  entryNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFF',
    borderRadius: 12,
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
  bottomPadding: {
    height: 20,
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
  goalModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    margin: 20,
    marginTop: 'auto',
    marginBottom: 'auto',
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
  goalModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 4,
  },
  timeInputRow: {
    marginBottom: 12,
  },
  timeInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    color: '#1A1A1A',
  },
  hoursInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  timeHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  qualitySelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  qualityOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
  },
  qualityOptionEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  qualityOptionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  notesInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1A1A1A',
    minHeight: 80,
    textAlignVertical: 'top',
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
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default SleepScreen;
