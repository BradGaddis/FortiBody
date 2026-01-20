import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Svg, Path, Ellipse, Rect, G } from 'react-native-svg';

const MUSCLE_GROUP_MAP: Record<string, string[]> = {
  chest: ['chest', 'upper chest'],
  shoulders: ['shoulders', 'deltoids', 'rear delts'],
  biceps: ['biceps'],
  triceps: ['triceps'],
  forearms: ['forearms'],
  abs: ['core', 'abs'],
  obliques: ['core', 'obliques'],
  quads: ['quadriceps'],
  calves: ['calves'],
  back: ['back', 'upper back'],
  lats: ['lats', 'upper back'],
  traps: ['traps', 'upper back'],
  glutes: ['glutes'],
  hamstrings: ['hamstrings'],
};

const muscleNames: Record<string, string> = {
  traps: 'Traps',
  shoulders: 'Shoulders',
  chest: 'Chest',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  abs: 'Abs',
  obliques: 'Obliques',
  quads: 'Quads',
  calves: 'Calves',
  back: 'Upper Back',
  lats: 'Lats',
  glutes: 'Glutes',
  hamstrings: 'Hamstrings',
  traps_back: 'Traps',
  shoulders_back: 'Delts',
};

interface BodyDiagramProps {
  onMuscleSelect?: (muscleGroups: string[]) => void;
}

const BodyDiagram: React.FC<BodyDiagramProps> = ({ onMuscleSelect }) => {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [showBack, setShowBack] = useState(false);
  const navigation = useNavigation();

  const muscleOrder = showBack
    ? ['traps_back', 'shoulders_back', 'back', 'lats', 'glutes', 'hamstrings']
    : ['traps', 'shoulders', 'chest', 'biceps', 'triceps', 'forearms', 'abs', 'obliques', 'quads', 'calves'];

  const handlePress = (muscleId: string) => {
    const isSelected = selectedPart === muscleId;
    setSelectedPart(isSelected ? null : muscleId);

    if (onMuscleSelect) {
      const muscleGroups = MUSCLE_GROUP_MAP[muscleId] || [muscleId];
      onMuscleSelect(isSelected ? [] : muscleGroups);
    }

    if (!isSelected) {
      const muscleGroups = MUSCLE_GROUP_MAP[muscleId] || [muscleId];
      navigation.navigate('ExerciseLibrary' as never, { muscleGroup: muscleGroups[0] } as never);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleBtn, !showBack && styles.toggleBtnActive]}
          onPress={() => { setShowBack(false); setSelectedPart(null); }}
        >
          <Text style={[styles.toggleText, !showBack && styles.toggleTextActive]}>FRONT</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, showBack && styles.toggleBtnActive]}
          onPress={() => { setShowBack(true); setSelectedPart(null); }}
        >
          <Text style={[styles.toggleText, showBack && styles.toggleTextActive]}>BACK</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bodyContainer}>
        <Svg width={200} height={350} viewBox="0 0 200 350">
          {showBack ? (
            <G>
              <Path d="M85,25 L115,25 L112,45 L88,45 Z" fill="#c9a87c" />
              <Path d="M60,48 L85,48 L85,75 L60,75 Z M115,48 L140,48 L140,75 L115,75 Z" fill="#d4b08c" />
              <Path d="M70,80 L130,80 L125,125 L75,125 Z" fill="#c9a87c" />
              <Path d="M55,80 L75,80 L72,130 L58,130 Z M125,80 L145,80 L148,130 L132,130 Z" fill="#d4b08c" />
              <Path d="M65,130 L135,130 L130,175 L70,175 Z" fill="#d4b08c" />
              <Path d="M60,180 L90,180 L87,250 L63,250 Z M110,180 L140,180 L143,250 L117,250 Z" fill="#c9a87c" />
            </G>
          ) : (
            <G>
              <Path d="M80,25 L120,25 L115,45 L85,45 Z" fill="#c9a87c" />
              <Path d="M55,50 L85,50 L85,80 L55,80 Z M115,50 L145,50 L145,80 L115,80 Z" fill="#d4b08c" />
              <Path d="M85,50 L115,50 L112,85 L88,85 Z" fill="#c9a87c" />
              <Path d="M45,85 L70,85 L68,130 L48,130 Z M130,85 L155,85 L157,130 L132,130 Z" fill="#d4b08c" />
              <Path d="M30,85 L50,85 L48,130 L28,130 Z M150,85 L170,85 L172,130 L152,130 Z" fill="#c9a87c" />
              <Path d="M35,132 L55,132 L53,175 L37,175 Z M145,132 L165,132 L167,175 L147,175 Z" fill="#d4b08c" />
              <Path d="M80,88 L120,88 L115,135 L85,135 Z" fill="#c9a87c" />
              <Path d="M65,88 L85,88 L82,135 L65,135 Z M115,88 L135,88 L138,135 L117,135 Z" fill="#d4b08c" />
              <Path d="M65,180 L90,180 L87,250 L63,250 Z M110,180 L135,180 L138,250 L112,250 Z" fill="#c9a87c" />
              <Path d="M68,285 L88,285 L85,330 L66,330 Z M112,285 L132,285 L135,330 L114,330 Z" fill="#c9a87c" />
            </G>
          )}

          <Ellipse cx="100" cy="12" rx="15" ry="18" fill="#d4a574" />
          <Rect x="90" y="28" width="20" height="15" fill="#d4a574" />
          <Ellipse cx="40" cy="180" rx="10" ry="12" fill="#d4a574" />
          <Ellipse cx="160" cy="180" rx="10" ry="12" fill="#d4a574" />
          <Ellipse cx="80" cy="340" rx="12" ry="8" fill="#d4a574" />
          <Ellipse cx="120" cy="340" rx="12" ry="8" fill="#d4a574" />
        </Svg>

        {muscleOrder.map((muscleId) => {
          const isSelected = selectedPart === muscleId;
          return (
            <TouchableOpacity
              key={muscleId}
              style={[
                styles.muscleButton,
                musclePositions[muscleId],
                isSelected && styles.selectedMuscle,
              ]}
              onPress={() => handlePress(muscleId)}
              activeOpacity={0.3}
            />
          );
        })}

        {selectedPart && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedText}>
              {muscleNames[selectedPart] || selectedPart}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const musclePositions: Record<string, any> = {
  traps: { top: 25, left: 60, width: 80, height: 20 },
  shoulders: { top: 50, left: 30, width: 35, height: 30 },
  chest: { top: 50, left: 70, width: 60, height: 35 },
  biceps: { top: 85, left: 35, width: 25, height: 45 },
  triceps: { top: 85, left: 140, width: 25, height: 45 },
  forearms: { top: 132, left: 25, width: 28, height: 43 },
  abs: { top: 88, left: 75, width: 50, height: 47 },
  obliques: { top: 88, left: 52, width: 22, height: 47 },
  quads: { top: 180, left: 55, width: 35, height: 70 },
  calves: { top: 285, left: 60, width: 28, height: 45 },
  back: { top: 80, left: 55, width: 90, height: 45 },
  lats: { top: 80, left: 40, width: 40, height: 50 },
  glutes: { top: 130, left: 50, width: 100, height: 45 },
  hamstrings: { top: 180, left: 50, width: 40, height: 70 },
  traps_back: { top: 25, left: 60, width: 80, height: 20 },
  shoulders_back: { top: 48, left: 30, width: 35, height: 27 },
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    padding: 4,
    marginBottom: 10,
  },
  toggleBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#FF1744',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#FFF',
  },
  bodyContainer: {
    position: 'relative',
    width: 200,
    height: 350,
  },
  muscleButton: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  selectedMuscle: {
    backgroundColor: 'rgba(255, 23, 68, 0.3)',
    borderRadius: 4,
  },
  selectedBadge: {
    position: 'absolute',
    bottom: -35,
    alignSelf: 'center',
    backgroundColor: '#FF1744',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
  },
  selectedText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default BodyDiagram;
