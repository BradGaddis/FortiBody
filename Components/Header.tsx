import { Text, View  } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from "../Styles";

function Header(props: any) {
    const { title, subtitle } = props;
    return (
        <View style={[
            styles.headerContainer,
            {
                // todo
            },
        ]
        }>
            <View
                style={
                    styles.headerFavicon
                }
            ><Text>Favicon SVG</Text></View>
            <View
                style={{
                    flexDirection: "column",
                    alignContent: "center",
                }}
            >
                <Text
                    style= {
                        {
                            textAlign: "center",
                            fontWeight: "bold",
                        }
                    }
                    >
                    {title}
                </Text>
                <Text 
                style= {
                    {
                        textAlign: "center",
                        
                    }
                }
                >
                    {subtitle}
                </Text>
            </View>
            {/* <View style={{position: "absolute", top:10}}> */}
            {/* <Icon
            name="calendar"
            size={30}
            color="black"
          /> */}
        {/* </View> */}


        </View>
    )
}

export default Header;