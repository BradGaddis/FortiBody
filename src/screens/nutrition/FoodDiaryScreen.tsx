import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { nutritionService } from '../../services/nutrition/NutritionService';
import { FoodEntry, MealType, MEAL_TYPES } from '../../services/nutrition/types';
import { hapticSelection, hapticSuccess, hapticMedium } from '../../utils/haptics';

interface FoodDiaryScreenProps {
  navigation: any;
}

export const FoodDiaryScreen: React.FC<FoodDiaryScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [totals, setTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const loadData = useCallback(async () => {
    setLoading(true);
    const dailyNutrition = await nutritionService.getDailyNutrition(selectedDate);
    
    setEntries(dailyNutrition.entries);
    setTotals({
      calories: Math.round(dailyNutrition.totalCalories),
      protein: Math.round(dailyNutrition.totalProtein),
      carbs: Math.round(dailyNutrition.totalCarbs),
      fat: Math.round(dailyNutrition.totalFat),
    });
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const formatDateHeader = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const navigateDay = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const openCalendar = () => {
    setCalendarMonth(new Date(selectedDate));
    setCalendarVisible(true);
  };

  const selectDateFromCalendar = (date: Date) => {
    setSelectedDate(date);
    setCalendarVisible(false);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const navigateMonth = (months: number) => {
    const newMonth = new Date(calendarMonth);
    newMonth.setMonth(newMonth.getMonth() + months);
    setCalendarMonth(newMonth);
  };

  const isSelectedDate = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentDay = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const calendarDays = getDaysInMonth(calendarMonth);

  const getMealEntries = (mealType: MealType): FoodEntry[] => {
    return entries
      .filter(e => e.meal === mealType)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getMealTotals = (mealType: MealType) => {
    const mealEntries = getMealEntries(mealType);
    return mealEntries.reduce(
      (acc, entry) => ({
        calories: acc.calories + entry.food.calories * entry.servings,
        protein: acc.protein + entry.food.protein * entry.servings,
        carbs: acc.carbs + entry.food.carbs * entry.servings,
        fat: acc.fat + entry.food.fat * entry.servings,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSummaryLabel = () => {
    const today = new Date();
    if (selectedDate.toDateString() === today.toDateString()) {
      return "Today's Total";
    }
    return selectedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }) + ' Total';
  };

  const renderMealSection = (mealType: MealType, label: string, icon: string) => {
    const mealEntries = getMealEntries(mealType);
    const mealTotals = getMealTotals(mealType);

    return (
      <View key={mealType} style={styles.mealSection}>
        <View style={styles.mealHeader}>
          <View style={styles.mealTitleRow}>
            <Ionicons name={icon} size={20} color="#4CAF50" />
            <Text style={styles.mealTitle}>{label}</Text>
            {mealEntries.length > 0 && (
              <Text style={styles.mealCalories}>
                {Math.round(mealTotals.calories)} cal
              </Text>
            )}
          </View>
          {mealEntries.length > 0 && (
            <View style={styles.mealMacros}>
              <Text style={styles.macro}>
                P: {Math.round(mealTotals.protein)}g
              </Text>
              <Text style={styles.macro}>
                C: {Math.round(mealTotals.carbs)}g
              </Text>
              <Text style={styles.macro}>
                F: {Math.round(mealTotals.fat)}g
              </Text>
            </View>
          )}
        </View>

        {mealEntries.length > 0 ? (
          <View style={styles.mealEntries}>
            {mealEntries.map(entry => (
              <TouchableOpacity
                key={entry.id}
                style={styles.entryCard}
                onPress={() => {
                  hapticSelection();
                  navigation.navigate('EditFoodEntry', { entryId: entry.id });
                }}
              >
                <View style={styles.entryInfo}>
                  <Text style={styles.entryName}>{entry.food.name}</Text>
                  <Text style={styles.entryTime}>{formatTime(entry.date)}</Text>
                </View>
                <View style={styles.entryDetails}>
                  <Text style={styles.entryCalories}>
                    {Math.round(entry.food.calories * entry.servings)} cal
                  </Text>
                  {entry.servings !== 1 && (
                    <View style={styles.servingsBadge}>
                      <Text style={styles.servingsBadgeText}>×{entry.servings.toFixed(2)}</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={18} color="#CCC" />
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.addFoodButton}
              onPress={() => {
                hapticSelection();
                navigation.navigate('AddFood', { meal: mealType });
              }}
            >
              <Ionicons name="add-circle-outline" size={20} color="#4CAF50" />
              <Text style={styles.addFoodText}>Add food</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addFoodButton}
            onPress={() => {
              hapticSelection();
              navigation.navigate('AddFood', { meal: mealType });
            }}
          >
            <Ionicons name="add-circle-outline" size={20} color="#4CAF50" />
            <Text style={styles.addFoodText}>Add food</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

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
        <Text style={styles.title}>Food Diary</Text>
        
        <View style={styles.dateNavigation}>
          <TouchableOpacity style={styles.dateNavBtn} onPress={() => {
            hapticSelection();
            navigateDay(-1);
          }}>
            <Ionicons name="chevron-back" size={24} color="#4CAF50" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.dateDisplay} onPress={() => {
            hapticSelection();
            openCalendar();
          }}>
            <Text style={styles.dateTitle}>{formatDateHeader(selectedDate)}</Text>
            {!isToday && (
              <Text style={styles.dateSubtitle}>{formatDateForDisplay(selectedDate)}</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.dateNavBtn, isToday && styles.dateNavBtnDisabled]} 
            onPress={() => {
              hapticSelection();
              navigateDay(1);
            }}
            disabled={isToday}
          >
            <Ionicons 
              name="chevron-forward" 
              size={24} 
              color={isToday ? '#CCC' : '#4CAF50'} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.calendarBtn} onPress={() => {
            hapticSelection();
            openCalendar();
          }}>
            <Ionicons name="calendar-outline" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
        
        {!isToday && (
          <TouchableOpacity style={styles.todayButton} onPress={() => {
            hapticSelection();
            goToToday();
          }}>
            <Text style={styles.todayButtonText}>Go to Today</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryMain}>
          <Text style={styles.summaryLabel}>{getSummaryLabel()}</Text>
          <Text style={styles.summaryCalories}>
            {totals.calories.toLocaleString()} cal
          </Text>
        </View>
        <View style={styles.summaryMacros}>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: '#2196F3' }]}>
              {totals.protein}g
            </Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: '#FF9800' }]}>
              {totals.carbs}g
            </Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: '#9C27B0' }]}>
              {totals.fat}g
            </Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {MEAL_TYPES.map(meal => (
          renderMealSection(meal.id, meal.label, meal.icon)
        ))}

        {entries.length > 0 && (
          <TouchableOpacity
            style={styles.addMoreButton}
            onPress={() => {
              hapticSelection();
              navigation.navigate('AddFood');
            }}
          >
            <Ionicons name="add-circle" size={24} color="#4CAF50" />
            <Text style={styles.addMoreText}>Add more food</Text>
          </TouchableOpacity>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <Modal
        visible={calendarVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <View style={styles.calendarOverlay}>
          <View style={styles.calendarContent}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => setCalendarVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#999" />
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>Select Date</Text>
              <View style={{ width: 28 }} />
            </View>

            <View style={styles.calendarMonthNav}>
              <TouchableOpacity onPress={() => {
                hapticSelection();
                navigateMonth(-1);
              }}>
                <Ionicons name="chevron-back" size={24} color="#4CAF50" />
              </TouchableOpacity>
              <Text style={styles.calendarMonthTitle}>
                {calendarMonth.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <TouchableOpacity onPress={() => {
                hapticSelection();
                navigateMonth(1);
              }}>
                <Ionicons name="chevron-forward" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarWeekdays}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Text key={day} style={styles.calendarWeekday}>{day}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((date, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.calendarDay,
                    date && isSelectedDate(date) && styles.calendarDaySelected,
                    date && isCurrentDay(date) && !isSelectedDate(date) && styles.calendarDayCurrent,
                    !date && styles.calendarDayEmpty,
                  ]}
                  onPress={() => {
                    if (date) {
                      hapticSuccess();
                      selectDateFromCalendar(date);
                    }
                  }}
                  disabled={!date}
                >
                  {date && (
                    <Text style={[
                      styles.calendarDayText,
                      isSelectedDate(date) && styles.calendarDayTextSelected,
                    ]}>
                      {date.getDate()}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.calendarLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.legendText}>Selected</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#4CAF50' }]} />
                <Text style={styles.legendText}>Today</Text>
              </View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  dateNavBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateNavBtnDisabled: {
    backgroundColor: '#F5F5F5',
  },
  calendarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateDisplay: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  dateSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  todayButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
  },
  summaryCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryMain: {
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryCalories: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  summaryMacros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mealSection: {
    marginBottom: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  mealCalories: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 8,
  },
  mealMacros: {
    flexDirection: 'row',
    gap: 12,
  },
  macro: {
    fontSize: 12,
    color: '#888',
  },
  mealEntries: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  entryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  entryTime: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  entryDetails: {
    alignItems: 'flex-end',
  },
  entryCalories: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4CAF50',
  },
  servingsBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  servingsBadgeText: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  addFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    gap: 8,
  },
  addFoodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4CAF50',
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  addMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  bottomPadding: {
    height: 20,
  },
  calendarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  calendarContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  calendarMonthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  calendarMonthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  calendarWeekdays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  calendarWeekday: {
    fontSize: 12,
    fontWeight: '500',
    color: '#888',
    width: 40,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  calendarDay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  calendarDaySelected: {
    backgroundColor: '#4CAF50',
  },
  calendarDayCurrent: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  calendarDayEmpty: {
    width: 40,
    height: 40,
  },
  calendarDayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  calendarDayTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
});

export default FoodDiaryScreen;
