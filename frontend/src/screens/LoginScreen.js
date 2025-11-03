import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { Auth } from 'aws-amplify';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    try {
      await Auth.signIn(email, password);
      alert('Login successful!');
      // navigation.navigate('Dashboard'); // to be added later
    } catch (err) {
      setError(err.message || 'Error signing in');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input}/>
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input}/>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Login" onPress={handleSignIn}/>
      <Button title="Go to Signup" onPress={() => navigation.navigate('Signup')}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, padding: 10, marginVertical: 5 },
  error: { color: 'red', marginBottom: 5 }
});
