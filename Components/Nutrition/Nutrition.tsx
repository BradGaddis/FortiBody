import { View, Text } from 'react-native';
import { FormattedDate } from '../../DateTimeManager';

function Nutrition() {
    return (
        <View>
            <Text>Nutrition</Text>
            <Text>{`Today is: ${FormattedDate()}`}</Text>
        </View>
    )
}

export default Nutrition;