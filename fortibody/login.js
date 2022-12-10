import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
// import { NavigationStackProp } from 'react-navigation-stack';

export const LoginScreen = (props) => {
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');

const onSubmit = () => {
    // Validate the username and password
    if (username === 'admin' && password === '123456') {
    // Navigate to the admin debug screen if the login is successful
    props.navigation.navigate('AdminDebug');
    } else {
    alert('Incorrect username or password');
    }
};

return (
    <View>
        <Text>Username:</Text>
        <TextInput
        value={username}
        onChangeText={(text) => setUsername(text)}
        />
        <Text>Password:</Text>
        <TextInput
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
        />
        <Button title="Submit" onPress={onSubmit} />
    </View>
    );
};