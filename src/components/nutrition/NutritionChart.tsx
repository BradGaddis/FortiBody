import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface NutritionChartProps {
  data: {
    labels: string[];
    calories: number[];
    protein: number[];
    carbs: number[];
    fat: number[];
  };
  viewMode: 'daily' | 'weekly' | 'monthly';
}

interface BarData {
  label: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const CHART_HEIGHT = 200;
const BAR_WIDTH = 40;
const BAR_SPACING = 20;
const MAX_BARS = 7;

export const NutritionChart: React.FC<NutritionChartProps> = ({ data, viewMode }) => {
  const maxCalories = Math.max(...data.calories, 2000);

  const getBarData = (): BarData[] => {
    const count = viewMode === 'daily' ? 1 : viewMode === 'weekly' ? 7 : 30;
    const sliceData = {
      labels: data.labels.slice(-count),
      calories: data.calories.slice(-count),
      protein: data.protein.slice(-count),
      carbs: data.carbs.slice(-count),
      fat: data.fat.slice(-count),
    };
    
    return sliceData.labels.map((label, i) => ({
      label,
      calories: sliceData.calories[i],
      protein: sliceData.protein[i],
      carbs: sliceData.carbs[i],
      fat: sliceData.fat[i],
    }));
  };

  const barData = getBarData();
  const chartWidth = Math.max(barData.length * (BAR_WIDTH + BAR_SPACING) + 60, screenWidth - 32);

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <View style={styles.chartWrapper}>
          <View style={styles.yAxis}>
            <Text style={styles.yAxisLabel}>{maxCalories}</Text>
            <Text style={styles.yAxisLabel}>0</Text>
          </View>
          <View style={styles.chartArea}>
            <ScrollView style={styles.chart} horizontal showsHorizontalScrollIndicator={false}>
              <View style={[styles.barsContainer, { width: chartWidth }]}>
                {barData.map((item, index) => {
                  const caloriesHeight = (item.calories / maxCalories) * CHART_HEIGHT;
                  const proteinHeight = (item.protein / 200) * CHART_HEIGHT;
                  const carbsHeight = (item.carbs / 300) * CHART_HEIGHT;
                  const fatHeight = (item.fat / 100) * CHART_HEIGHT;
                  
                  return (
                    <View key={index} style={styles.barGroup}>
                      <View style={styles.barsWrapper}>
                        <View style={[styles.bar, styles.proteinBar, { height: proteinHeight }]} />
                        <View style={[styles.bar, styles.carbsBar, { height: carbsHeight }]} />
                        <View style={[styles.bar, styles.fatBar, { height: fatHeight }]} />
                        <View style={[styles.bar, styles.caloriesBar, { height: caloriesHeight }]} />
                      </View>
                      <Text style={styles.xAxisLabel}>{item.label}</Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#2196F3' }]} />
          <Text style={styles.legendText}>Protein</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
          <Text style={styles.legendText}>Carbs</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#9C27B0' }]} />
          <Text style={styles.legendText}>Fat</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Calories</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  chartContainer: {
    marginBottom: 12,
  },
  chartWrapper: {
    flexDirection: 'row',
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 20,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#999',
  },
  chartArea: {
    flex: 1,
  },
  chart: {
    flex: 1,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 20,
    paddingLeft: 10,
  },
  barGroup: {
    alignItems: 'center',
    marginRight: BAR_SPACING,
  },
  barsWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  bar: {
    width: 6,
    borderRadius: 3,
  },
  caloriesBar: {
    backgroundColor: '#4CAF50',
    width: 10,
  },
  proteinBar: {
    backgroundColor: '#2196F3',
  },
  carbsBar: {
    backgroundColor: '#FF9800',
  },
  fatBar: {
    backgroundColor: '#9C27B0',
  },
  xAxisLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});

export default NutritionChart;
