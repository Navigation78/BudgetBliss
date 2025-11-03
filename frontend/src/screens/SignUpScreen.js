import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { Auth } from 'aws-amplify';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    try {
      await Auth.signUp({ username: email, password, attributes: { email } });
      alert('Check your email for a confirmation code!');
      navigation.navigate('Login');
    } catch (err) {
      setError(err.message || 'Error signing up');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input}/>
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input}/>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title="Signup" onPress={handleSignUp}/>
      <Button title="Back to Login" onPress={() => navigation.navigate('Login')}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, padding: 10, marginVertical: 5 },
  error: { color: 'red', marginBottom: 5 }
});
