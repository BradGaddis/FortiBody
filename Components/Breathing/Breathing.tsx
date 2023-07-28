import { View, Text, StyleSheet } from 'react-native';
import Header from '../Header';
import CustomButton, { RadialPulsatingButton } from '../CustomButton';
import { useState, useEffect } from 'react'; 
import styles from '../../Styles';
import { set } from 'react-native-reanimated';


// TODO: Parse this component into different files

function Breathing({ navigation, route}: { navigation: any, route: any }) {
    const [method, setMethod] = useState("None")
    const [round, setRound] = useState(1)
    const [active, setActive] = useState(false)
    const [title, setTitle] = useState("Start")    
    const [count, setCount] = useState(0)
    const [timer, setTimer] = useState(0)
    const [holdBreathOut, setHoldBreathOut] = useState(false)
    const [outBreathTimer, setOutBreathTimer] = useState(0)
    const [holdBreathIn, setHoldBreathIn] = useState(false)
    const [holdTime, setHoldTime] = useState(30)
    const [advanced, setAdvanced] = useState(false)


    useEffect(() => {
        let timer;
      
        if (holdBreathIn) {
            setCount(1);
            setTimer(15);
            setHoldBreathOut(false);
            timer = setInterval(() => {
            setTimer(prevTimer => prevTimer - 1);
            }, 1000);
        }
        
        return () => clearInterval(timer);
    }, [holdBreathIn]);       
    
    
    useEffect(() => {
        if (timer === 0 && holdBreathIn) {
            setRound(round + 1)
            console.log("round is " + round)
            setTimer(15);
            setCount(0);
            setHoldBreathIn(false);
        }
    }, [timer]);
      
    
    useEffect(() => {
        let timeoutId;
      
        function countDown() {
            setOutBreathTimer(prevTimer => prevTimer - 1);
            console.log("timer is running: " + outBreathTimer)
        }
        
        if (count > 30 || holdBreathOut) {
            countDown();
          timeoutId = setInterval(countDown, 1000);
          setHoldBreathOut(true);
        } 

        if (holdBreathIn) {
            setOutBreathTimer(holdTime);
        }

        return () => {
            clearInterval(timeoutId);
        };
      }, [count,holdBreathOut]);
      
      useEffect(() => {
          if (outBreathTimer === 0) {
            setCount(1);

              if (round + 1 == 2){
                  setHoldTime(60)
                  console.log("hold time is now 90")
                  
              }
              if (round + 1 == 3){
                  setHoldTime(120)
                  console.log("hold time is now 120")
              }
              setOutBreathTimer(holdTime); // Reset the timer
        if (count > 30) {
            setHoldBreathOut(false);
            setHoldBreathIn(true);
        }
        }
      }, [outBreathTimer]);
    
    
    if (method == "None"){ 
        return (
            ChooseMethod(setMethod)
        )
    }

    if (method == "Energy"){
        return (
            EnergyBreathing(
                setMethod,
                round, 
                setRound,
                active, 
                setActive, 
                title,
                setTitle,
                count,
                setCount,
                timer,
                holdBreathOut,
                setHoldBreathOut,
                holdBreathIn,
                setHoldBreathIn,
                outBreathTimer,
                setOutBreathTimer,
                setHoldTime,
                advanced,
                setAdvanced
            )
        )
    }

}

function ChooseMethod(setState: any){
    return (
        <View>
            <Header title="Breathing" subtitle="Breathe in, breathe out"/>
            <Text>What are you looking for?</Text>
            <CustomButton title="Need Energy?" onPress={()=> setState("Energy")} />
        </View>
    )
}

function EnergyBreathing(setState: any, 
    round,
    setRound,
    active,
    setActive,
    title, 
    setTitle, 
    count, 
    setCount,
    timer,
    holdBreathOut,
    setHoldBreathOut,
    holdBreathIn,
    setHoldBreathIn,
    outBreathTimer,
    setOutBreathTimer,
    setHoldTime,
    advanced,
    setAdvanced
    ){
    if (active == false){
        return (
            <CustomButton title="Start" onPress={() => {
                setActive(true)
            }
            }/>
        )
    }

    if ((count > 30 && !holdBreathIn) || holdBreathOut){
        return (
            <View>
                <Header title="Energy Breathing" subtitle="Breathe in, breathe out"/>
                <View style={styles.exerciseContainer}>
                    <Text>Release your whole breath for {outBreathTimer} seconds</Text>
                </View>
            </View>
        )
    }
    
    if (holdBreathIn){
        return (
            <View>
            <Header title="Energy Breathing" subtitle="Breathe in, breathe out"/>
                <View style={styles.exerciseContainer}>
                    {/* I'd like to put a water drop animation right here and start a timer */}
                    <Text>Deep breath. Hold your breath for 15 seconds</Text>
                    <Text>{timer}</Text>
                    {/* timer */}
                    <Text>
                        Good work on round {round}!
                    </Text>
                </View>
            </View>
        )
    }

    if (round >= 4){
        return (
            <View style={styles.exerciseContainer}>
                <Text>Great work! You're all done!</Text>
                <CustomButton title="Restart?" onPress={()=> {
                    setRound(1)
                    setCount(0)
                    setActive(false)
                    setHoldBreathIn(false)
                    setHoldBreathOut(false)
                    setHoldTime(advanced ? 60 : 30)
                    setOutBreathTimer(30)
                }} />
                </View>
        )
    }

    const outSize = count == 30 ? 7 : 5; 


    if (!holdBreathOut && !holdBreathIn && count < 31)
    {
        return (
        <View>
            <Header title="Energy Breathing" subtitle="Breathe in, breathe out"/>
            <View style={styles.exerciseContainer}>
                
                <Text>Round {round}</Text>
                <View style={{
                    flexDirection: "column",
                    alignContent: "center",
                    justifyContent: "center",
                }}>
                    <RadialPulsatingButton 
                    title={
                        count == 30 ? "FULLY IN" :
                        count.toString()
                    }
                    fontSize={8}
                    style={
                        {
                            borderWidth: 1,
                            margin: 100
                        }
                    }
                    pulseSpeed={{
                        in: 100,
                        out: 100
                    }}
                    
                    size={{
                        min: .5,
                        max: outSize
                    }}
                    
                    onTitleChange={setTitle}
                    
                    onCountChange={setCount}
                    />
                    {count == 30 ? <Text style={{textAlign: "center"}}>DEEP BREATH</Text> : <Text></Text>}

                    {/* <Text>Tap button pulsing view to stop this round</Text> */}
                    <CustomButton title="Restart" onPress={()=> {
                        setRound(1)
                        setCount(1)
                        setActive(false)
                        setHoldBreathIn(false)
                        setHoldBreathOut(false)
                        setHoldTime(advanced ? 60 : 30)
                        setOutBreathTimer(advanced ? 60 : 30)
                    }} />
                    <CustomButton title="End Session" onPress={() => setState("None")}/>
                </View>
            </View>
        </View>
    )
    
    }
}   

function RestartEnergyBreathing(setRound: any, setCount: any, setActive: any, setHoldBreathIn:any, setHoldBreathOut: any){
    setRound(1)
    setCount(0)
    setActive(false)    
    setHoldBreathIn(false)
    setHoldBreathOut(false)

}

function BoxBreathing(){
    return (
        <View>
            <Text>Box Breathing</Text>
        </View>
    )
}

export default Breathing