import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFortiBodyTheme } from '../../theme/ThemeProvider';
import {
  userStatsService,
  UserStats,
} from '../../services/user/UserStatsService';

interface ProfileScreenProps {
  navigation?: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const theme = useFortiBodyTheme();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    const userStats = await userStatsService.getStats();
    setStats(userStats);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const menuItems = [
    { label: 'Edit Profile', icon: 'person-outline', screen: 'ProfileEdit' },
    { label: 'My Goals', icon: 'flag-outline', screen: 'ProfileGoals' },
    {
      label: 'Measurements',
      icon: 'resize-outline',
      screen: 'ProfileMeasurements',
    },
    { label: 'Achievements', icon: 'medal-outline', screen: undefined },
    { label: 'Settings', icon: 'settings-outline', screen: undefined },
    { label: 'Help & Support', icon: 'help-circle-outline', screen: undefined },
  ];

  if (loading || !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const userStats = [
    {
      label: 'Workouts',
      value: stats.totalWorkouts.toString(),
      icon: 'fitness',
    },
    { label: 'Streak', value: `${stats.currentStreak} days`, icon: 'flame' },
    {
      label: 'Total Exercises',
      value: stats.totalExercises.toString(),
      icon: 'body',
    },
    {
      label: 'Active Goals',
      value: stats.activeGoals.toString(),
      icon: 'trophy',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>FB</Text>
        </View>
        <Text style={[styles.name, { color: theme.colors.text.primary }]}>
          FortiBody User
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          Member since {formatDate(stats.memberSince)}
        </Text>
      </View>

      <View style={styles.statsRow}>
        {userStats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Ionicons name={stat.icon as any} size={24} color="#4CAF50" />
            <Text
              style={[styles.statValue, { color: theme.colors.text.primary }]}
            >
              {stat.value}
            </Text>
            <Text
              style={[styles.statLabel, { color: theme.colors.text.secondary }]}
            >
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text
          style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
        >
          Menu
        </Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => item.screen && navigation?.navigate?.(item.screen)}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name={item.icon as any} size={22} color="#666" />
              <Text
                style={[
                  styles.menuItemText,
                  { color: theme.colors.text.primary },
                ]}
              >
                {item.label}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
  },
});

export default ProfileScreen;
