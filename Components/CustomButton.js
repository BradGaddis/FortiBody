import React, { useEffect, useRef } from "react";
import { TouchableOpacity, Text, Animated } from "react-native";


function CustomButton({style = null, title, onPress = null, textColor = "#fff"}) {
    const defaultStyle = {
        backgroundColor: "#668cff",
        padding: 10,
        margin: 10,
        borderRadius: 15,
        alignItems: "center",
    }
            
    return (
        <TouchableOpacity style={[defaultStyle, style]} onPress={onPress}>
            <Text style={{color: textColor}}>{title}</Text>
        </TouchableOpacity>
    )
}

export function RadialPulsatingButton({ title, onPress = null, textColor = "#fff"}) {
    const defaultStyle = {
        backgroundColor: "#668cff",
        padding: 10,
        margin: 10,
        borderRadius: 50,
        alignItems: "center",
    }

    const animation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animationLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(animation, {
            toValue: 1,
            duration: 750,
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: 750,
            useNativeDriver: true,
          }),
        ])
      );
  
      animationLoop.start();
  
      return () => animationLoop.stop();
    }, []);
  
    const buttonSize = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 60],
    });
  
    return (
      <TouchableOpacity
        style={[defaultStyle, { width: buttonSize, height: buttonSize }]}
        onPress={onPress}
        >
            <Text style={{color: textColor}}>{title}</Text>
        </TouchableOpacity>
    )
}

export default CustomButton;