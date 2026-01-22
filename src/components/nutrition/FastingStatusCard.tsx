import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FastingTimer } from './FastingTimer';

interface FastingStatusCardProps {
  onPress?: () => void;
}

const FastingStatusCard: React.FC<FastingStatusCardProps> = ({ onPress }) => {
  return (
    <View style={styles.container}>
      <FastingTimer compact={false} onPress={onPress} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});

export default FastingStatusCard;
