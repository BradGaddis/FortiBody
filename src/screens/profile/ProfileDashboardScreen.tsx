import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import UserProfileService, {
  UserMetrics,
  BodyMeasurement,
} from '@/services/user/UserProfileService';

type ProfileStackParamList = {
  ProfileDashboard: { profileId: string };
  ProfileEdit: { profile?: any };
  ProfileGoals: { profileId: string };
  ProfileMeasurements: { profileId: string };
};

type ProfileDashboardScreenNavigationProp = StackNavigationProp<
  ProfileStackParamList,
  'ProfileDashboard'
>;
type ProfileDashboardScreenRouteProp = RouteProp<
  ProfileStackParamList,
  'ProfileDashboard'
>;

interface Props {
  navigation: ProfileDashboardScreenNavigationProp;
  route: ProfileDashboardScreenRouteProp;
}

const { width: screenWidth } = Dimensions.get('window');

const ProfileDashboardScreen: React.FC<Props> = ({ navigation, route }) => {
  const { profileId } = route.params;
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const profileService = new UserProfileService();
      const userMetrics = await profileService.getUserMetrics();
      setMetrics(userMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeightData = () => {
    if (!metrics?.bodyMeasurements.measurements.length) return null;

    const weightMeasurements = metrics.bodyMeasurements.measurements.slice(-7); // Last 7 measurements

    if (weightMeasurements.length === 0) return null;

    return {
      labels: weightMeasurements.map((_, index) => `Day ${index + 1}`),
      datasets: [
        {
          data: weightMeasurements.map(m => m.value),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const getMeasurementData = () => {
    if (!metrics?.bodyMeasurements.measurements.length) return null;

    const latestMeasurements = metrics.bodyMeasurements.measurements.reduce(
      (acc: any, curr) => {
        if (
          !acc[curr.type] ||
          new Date(curr.date) > new Date(acc[curr.type].date)
        ) {
          acc[curr.type] = curr;
        }
        return acc;
      },
      {}
    );

    const measurementTypes = ['chest', 'waist', 'arms', 'thighs', 'hips'];
    const data = measurementTypes.map(
      type => latestMeasurements[type]?.value || 0
    );

    return {
      labels: measurementTypes.map(
        type => type.charAt(0).toUpperCase() + type.slice(1)
      ),
      datasets: [
        {
          data,
        },
      ],
    };
  };

  const renderWeightChart = () => {
    const weightData = getWeightData();
    if (!weightData) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No weight data available</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              navigation.navigate('ProfileMeasurements', { profileId })
            }
          >
            <Text style={styles.addButtonText}>Add Weight</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <LineChart
        data={weightData}
        width={screenWidth - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#3b82f6',
          },
        }}
        bezier
        style={styles.chart}
      />
    );
  };

  const renderMeasurementChart = () => {
    const measurementData = getMeasurementData();
    if (!measurementData) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No measurement data available</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              navigation.navigate('ProfileMeasurements', { profileId })
            }
          >
            <Text style={styles.addButtonText}>Add Measurements</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <BarChart
        data={measurementData}
        width={screenWidth - 40}
        height={220}
        yAxisLabel=""
        yAxisSuffix=" cm"
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
        }}
        style={styles.chart}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading progress data...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Progress Dashboard</Text>

      {/* Current Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Stats</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {metrics?.weight.current || 0} kg
            </Text>
            <Text style={styles.statLabel}>Current Weight</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {metrics?.weight.changeRate || 0} kg/week
            </Text>
            <Text style={styles.statLabel}>Change Rate</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {metrics?.weight.trend || 'maintaining'}
            </Text>
            <Text style={styles.statLabel}>Trend</Text>
          </View>
        </View>
      </View>

      {/* Weight Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weight Progress</Text>
        {renderWeightChart()}
      </View>

      {/* Body Measurements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Body Measurements</Text>
        {renderMeasurementChart()}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate('ProfileMeasurements', { profileId })
            }
          >
            <Text style={styles.actionButtonText}>Add Measurements</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ProfileGoals', { profileId })}
          >
            <Text style={styles.actionButtonText}>Manage Goals</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ProfileEdit' as any)}
          >
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Measurements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Measurements</Text>
        {metrics?.bodyMeasurements.measurements
          .slice(-5)
          .reverse()
          .map((measurement, index) => (
            <View key={index} style={styles.measurementItem}>
              <View>
                <Text style={styles.measurementType}>
                  {measurement.type.charAt(0).toUpperCase() +
                    measurement.type.slice(1).replace('_', ' ')}
                </Text>
                <Text style={styles.measurementDate}>
                  {new Date(measurement.date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.measurementValue}>
                {measurement.value} {measurement.unit}
              </Text>
            </View>
          )) || (
          <Text style={styles.noDataText}>No measurements recorded yet</Text>
        )}
      </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  measurementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  measurementType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  measurementDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
});

export default ProfileDashboardScreen;
