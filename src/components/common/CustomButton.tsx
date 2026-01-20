import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface CustomButtonProps {
  style?: StyleProp<ViewStyle>;
  title: string;
  onPress?: () => void;
  textColor?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  style,
  title,
  onPress,
  textColor = '#fff',
}) => {
  const defaultStyle: ViewStyle = {
    backgroundColor: '#668cff',
    padding: 10,
    margin: 10,
    borderRadius: 15,
    alignItems: 'center',
  };

  const textStyle: TextStyle = {
    color: textColor,
  };

  return (
    <TouchableOpacity style={[defaultStyle, style]} onPress={onPress}>
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
