// src/screens/DashboardScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function DashboardScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to Budget Bliss 💰</Text>
      <Text style={styles.subtext}>Track your spending and stay on top of your goals.</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('BudgetOverview')}
      >
        <Text style={styles.buttonText}>View My Budgets</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => navigation.navigate('TipStreak')}
      >
        <Text style={styles.buttonText}>View My Streaks</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subtext: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 30 },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
    width: '70%',
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#1E88E5',
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
    width: '70%',
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: '600' },
});
