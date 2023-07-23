import Icon from 'react-native-vector-icons/FontAwesome';
import { StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import CustomButton from '../../CustomButton';

const styles = StyleSheet.create({
    container: {
      flex: 1
    },
    cog: {
      position: 'absolute',
      bottom: 15,
      right: 10,
      zIndex: 1,
      opacity: 0.5
    },
  });


export function RenderExerciseDefault(
    name: string, 
    reps: number,
    weight: number, 
    setReps: any, 
    setWeight: any, 
    handleFullSetSubmit: any, 
    toggleSession: any, 
    sessionActive: boolean, 
    savedSessions: any, 
    saved: any, 
    toggleShowReps: any,
    showReps: boolean,
    navigation: any,
    goToSettings: any, 
    listedKey: string,
    groupedKey: string, 
    recordSession: any, 
    RenderSession: any, 
    renderAllRecordedSets: any
    ){
        return (
            <SafeAreaView style={styles.container}>
                    {sessionActive ? recordSession(name, reps, weight, setReps, setWeight, handleFullSetSubmit ,toggleSession) : ""}


                    <CustomButton title={
                    sessionActive ? "Finish Session" : "Start Session"
                    } onPress={() => {
                    console.log("sessionActive", sessionActive)
                    toggleSession();
                    }} />
                    
                    <CustomButton 
                    title={showReps ? "Hide All Previous Sets and Reps" : "View all Previous Sets and Reps"}
                    onPress={toggleShowReps} />

                    { RenderSession(savedSessions , saved) }       

                    {showReps ? renderAllRecordedSets(saved) : ""}

                    <TouchableOpacity style={styles.cog}>
                    <Icon 
                        size={25}
                        name="cog" 
                        backgroundColor="#3b5998"
                        onPress={()=> {goToSettings(name, listedKey , groupedKey, navigation)}} />

                    {/* <CustomButton title={clearButtonTitle}  /> */}
                    </TouchableOpacity>
                    
                </SafeAreaView>
        )
}
