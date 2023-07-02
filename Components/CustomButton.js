import React from "react";
import { TouchableOpacity, Text } from "react-native";


function CustomButton({style = null, title, onPress = null, textColor = "#fff"}) {
    if (!style) {
        style = {
            backgroundColor: "blue",
            padding: 10,
            margin: 10,
            borderRadius: 15,
            alignItems: "center",
        }
    }
            

    return (
        <TouchableOpacity style={style} onPress={onPress}>
            <Text style={{color: textColor}}>{title}</Text>
        </TouchableOpacity>
    )
}

export default CustomButton;