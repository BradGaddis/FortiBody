import { View, Text } from 'react-native';
import { FormattedDate } from '../../DateTimeManager';

function Nutrition() {
    return (
        <View>
            <Text>Nutrition</Text>
            <Text>{`Today is: ${FormattedDate()}`}</Text>
            <View style={
                {
                    alignContent: "center",
                    justifyContent: "center",
                }
            }>
                <Text style={{width: "100%"}}>Coming soon!</Text>
            </View>
        </View>
    )
}

export default Nutrition;