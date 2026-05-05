import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { TextInput, TouchableOpacity, View, Text, StyleSheet } from "react-native";

type Props = {
    type: "text" | "email" | "password" | "number";
    placeholder: string;
    value: string;
    onChange: (text: string) => void;
}

export default function CustomInput ({type, placeholder, value, onChange}: Props){
    const [isSecureText, setIsSecureText] = useState(true);

    const icon : typeof Ionicons["name"] | undefined = 
        type === "email" ? 'at' : 
            type === "password" ? 'lock-closed' : undefined

    return(
        //wrapper
         <View style={styles.wrapper}>
            <View style={styles.inputContainer}>
                <Ionicons name={icon as any} size={20} color ="#00000"/>
                <TextInput 
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChange}
                    style={styles.input}
                    secureTextEntry={isSecureText}
                />
                <TouchableOpacity
                onPress={
                    ()=>{
                        setIsSecureText(!isSecureText)
                    }
                }
                >
                    <Ionicons name={isSecureText ? "eye" : "eye-off"} size={22} />
                </TouchableOpacity>
            </View>
            <Text>Probando Wrapper</Text>
         </View>

    );
}


const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 10,
    },
    inputContainer: {
        //distribucion de componentes
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,

        //estilizacion de input
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 9,
        backgroundColor: "#f0f0f0",
        paddingLeft: 20,

    },
    input: {
        width: '80%',
        paddingVertical: 10,
        paddingHorizontal: 10,
      
    }
})