
// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Amplify from 'aws-amplify';
import awsconfig from './src/aws-exports';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignUpScreen';

Amplify.configure(awsconfig);

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


//npm install @react-navigation/native @react-navigation/native-stack
//npm install react-native-screens react-native-safe-area-context

//npm install aws-amplify aws-amplify-react-native