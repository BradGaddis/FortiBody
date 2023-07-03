import React from "react";
import { TouchableOpacity, Text } from "react-native";


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

export default CustomButton;