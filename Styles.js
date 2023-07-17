import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width;
const marginBetween = 10;
const itemWidth = (windowWidth - marginBetween) / 2;
const itemHeight = itemWidth * 1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exercisecard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  generalExerciseContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showGeneralExerciseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  generalExerciseButton: {
    flexBasis: '48%',
  },
  generalExerciseText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  }, 
  generalExerciseImage: {
    width: itemWidth,
    height: itemHeight,
  }
});

export default styles;