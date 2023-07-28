import React, { useEffect, useRef, } from "react";
import { TouchableOpacity, Text, Animated, Easing } from "react-native";
import styles from "../Styles";

function CustomButton({style = null, title, onPress = null, textColor = "#fff"}) {
    const defaultStyle = {
        ...styles.buttonDefault
    }
            
    return (
        <TouchableOpacity style={[defaultStyle, style]} onPress={onPress}>
            <Text style={{color: textColor, textAlign: "center", textAlignVertical: "center"}}>{title}</Text>
        </TouchableOpacity>
    )
}

export function RadialPulsatingButton({ 
  title = "Default", 
  style=null, 
  pulseSpeed={in: 750, out:750}, 
  size={min:2, max:4},
  onPress = null, 
  fontSize=null, 
  textColor = "#fff",
  ease = false,
  bezierIn = [0, 0, 0, .5],
  bezierOut = [.5, 0, 0, .5], 
  onTitleChange = null,
  onCountChange = null
}) {
  const defaultStyle = {
    ...styles.buttonDefault,
    borderRadius: 50,
    // borderWidth: 1,
    // borderColor: "#000",
    width: 50,
    height: 50,
  }
  
  const animation = useRef(new Animated.Value(0)).current;

  const paramsIn = 
  ease ? 
  {
    toValue: 1,
    duration: pulseSpeed.out,
    easing: Easing.in(Easing.bezier(bezierIn)),
    useNativeDriver: true,
  } 
  :
  {
    toValue: 1,
    duration: pulseSpeed.out,
    useNativeDriver: true,
  } 

  
  const paramsOut =
  ease ? {
    toValue: 0.01,
    duration: pulseSpeed.in,
    easing: Easing.out(Easing.bezier(bezierOut)),
    useNativeDriver: true,
  } :
  {
    toValue: 0.01,
    duration: pulseSpeed.in,
    useNativeDriver: true,
  }
  
  const handleChangeTitle = onTitleChange || (() => {});
  const handleChangeCount = onCountChange || (() => {});

  useEffect(() => {
    const animationLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(animation, paramsIn),
        Animated.timing(animation, paramsOut),
      ])
    );

    animationLoop.start();
  
  
    const listener = ({ value }) => {
      if (value === 0) {
        handleChangeTitle("In");
        handleChangeCount((prev) => prev + 1)
      } else if (value === 1) {
        handleChangeTitle("Out");
      }
    };
    
    animation.addListener(listener);
  
    return () => {
      animationLoop.stop();
      animation.removeListener(listener);
    };
  }, []);
    
  

  const buttonSize = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [size.min, size.max],
  });
  
  const transformStyle = {
    transform: [{ scale: buttonSize }],
  };
  
  const defaultFontSize = Math.floor(defaultStyle.width / (title.length * 0.5));

  const textStyle = {
    color: textColor,
    fontSize: fontSize? fontSize : defaultFontSize,
    textAlign: "center",
    textAlignVertical: "center",
  };


  return (
    <TouchableOpacity
      style={[defaultStyle, transformStyle, style]}
      onPress={onPress}
    >
      {title != "Default" ? <Text style={textStyle}>{title}</Text> : null}
    </TouchableOpacity>
  )
}
export default CustomButton;