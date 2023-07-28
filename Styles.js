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
    flexDirection: "column"
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
  },
  homeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDefault: {
      backgroundColor: "#668cff",
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      margin: 10,
      padding: 10,
  },
  headerContainer: {
      position: "relative",
      flex: 1,
      top: 5,
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      margin: 10,
      minHeight: 100,
      justifyContent: "flex-start",
  },
  headerFavicon: {
      borderColor: 'black',
      borderWidth: 1,
      borderRadius: 10,
      alignContent: "center",
      left: 10,
      flexDirection: "row",
      marginRight: 20,
  }, 
  exerciseContainer: {
      alignItems: "center",
      justifyContent: "center",
      // top: 100
  }
});

export default styles;