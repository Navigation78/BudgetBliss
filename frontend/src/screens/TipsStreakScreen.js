// src/screens/TipStreakScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const tips = [
  'Always save at least 10% of your income.',
  'Track every expense.',
  'Review your budget weekly to stay consistent.',
  'Avoid impulse buying . Wait 24 hours before big purchases.',
];

export default function TipStreakScreen() {
  const [index, setIndex] = useState(0);
  const [streak, setStreak] = useState(3);

  const nextTip = () => {
    setIndex((prev) => (prev + 1) % tips.length);
    setStreak((prev) => prev + 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Daily Tip 💡</Text>
      <Text style={styles.tip}>{tips[index]}</Text>

      <TouchableOpacity style={styles.button} onPress={nextTip}>
        <Text style={styles.buttonText}>Next Tip</Text>
      </TouchableOpacity>

      <Text style={styles.streak}>🔥 Streak: {streak} days</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  tip: { fontSize: 16, textAlign: 'center', marginVertical: 20, color: '#333' },
  button: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: '600' },
  streak: { fontSize: 16, marginTop: 20, color: '#1E88E5' },
});
