import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ultraHumanService } from '../../services/integrations/UltraHumanService';
import { activityService } from '../../services/activity/ActivityService';
import { hapticSelection, hapticSuccess, hapticWarning } from '../../utils/haptics';

const IntegrationsScreen: React.FC = () => {
  const [ultraHumanKey, setUltraHumanKey] = useState('');
  const [isUltraHumanConnected, setIsUltraHumanConnected] = useState(false);
  const [averageRecovery, setAverageRecovery] = useState<number | null>(null);
  const [averageHRV, setAverageHRV] = useState<number | null>(null);

  useEffect(() => {
    loadIntegrationStatus();
  }, []);

  const loadIntegrationStatus = async () => {
    const key = await ultraHumanService.getApiKey();
    setIsUltraHumanConnected(!!key);
    
    if (key) {
      const [recovery, hrv] = await Promise.all([
        ultraHumanService.getAverageRecovery(),
        ultraHumanService.getAverageHRV(),
      ]);
      setAverageRecovery(recovery);
      setAverageHRV(hrv);
    }
  };

  const handleSaveUltraHumanKey = async () => {
    if (!ultraHumanKey.trim()) {
      hapticWarning();
      Alert.alert('Error', 'Please enter your UltraHuman API key');
      return;
    }

    hapticSuccess();
    await ultraHumanService.setApiKey(ultraHumanKey.trim());
    setIsUltraHumanConnected(true);
    setUltraHumanKey('');
    await loadIntegrationStatus();
    
    Alert.alert('Success', 'UltraHuman connected successfully!');
  };

  const handleDisconnectUltraHuman = async () => {
    hapticSelection();
    await ultraHumanService.clearCache();
    setIsUltraHumanConnected(false);
    setAverageRecovery(null);
    setAverageHRV(null);
    
    Alert.alert('Disconnected', 'UltraHuman has been disconnected');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Integrations</Text>
        <Text style={styles.subtitle}>Connect your health data</Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pulse" size={24} color="#4CAF50" />
              <Text style={styles.sectionTitle}>UltraHuman</Text>
            </View>

            {isUltraHumanConnected ? (
              <View style={styles.connectedCard}>
                <View style={styles.connectedHeader}>
                  <View style={styles.statusBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.statusText}>Connected</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.disconnectBtn}
                    onPress={handleDisconnectUltraHuman}
                  >
                    <Text style={styles.disconnectText}>Disconnect</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {averageRecovery !== null ? averageRecovery : '--'}
                    </Text>
                    <Text style={styles.statLabel}>Avg Recovery</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {averageHRV !== null ? `${averageHRV} ms` : '--'}
                    </Text>
                    <Text style={styles.statLabel}>Avg HRV</Text>
                  </View>
                </View>

                <Text style={styles.description}>
                  Sync your UltraHuman recovery scores, sleep data, and HRV metrics
                  to get comprehensive insights in FortiBody.
                </Text>
              </View>
            ) : (
              <View style={styles.connectCard}>
                <Text style={styles.description}>
                  Connect your UltraHuman account to sync recovery scores, HRV data,
                  and sleep metrics. Get a complete picture of your daily recovery
                  and optimize your training.
                </Text>

                <Text style={styles.inputLabel}>UltraHuman Partner API Key</Text>
                <TextInput
                  style={styles.input}
                  value={ultraHumanKey}
                  onChangeText={setUltraHumanKey}
                  placeholder="Enter your API key"
                  placeholderTextColor="#999"
                  secureTextEntry
                />

                <TouchableOpacity
                  style={styles.connectButton}
                  onPress={handleSaveUltraHumanKey}
                >
                  <Ionicons name="link" size={20} color="#FFF" />
                  <Text style={styles.connectButtonText}>Connect UltraHuman</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="fitness" size={24} color="#2196F3" />
              <Text style={styles.sectionTitle}>Google Fit</Text>
            </View>

            <View style={styles.connectCard}>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
              <Text style={styles.description}>
                Sync your Google Fit data to track steps, calories burned, and
                distance walked. Works with Android devices and Wear OS watches.
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="watch" size={24} color="#9C27B0" />
              <Text style={styles.sectionTitle}>Apple Health</Text>
            </View>

            <View style={styles.connectCard}>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
              <Text style={styles.description}>
                Sync your Apple Health data on iOS. Track workouts, steps, heart
                rate, and sleep data from your iPhone and Apple Watch.
              </Text>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
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
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  connectedCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  connectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
  },
  disconnectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  disconnectText: {
    fontSize: 14,
    color: '#F44336',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  connectCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 16,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  comingSoonBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9800',
  },
  bottomPadding: {
    height: 20,
  },
});

export default IntegrationsScreen;
