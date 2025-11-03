// src/screens/BudgetOverviewScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';

const budgets = [
  { id: '1', category: 'Food', spent: 3000, limit: 5000 },
  { id: '2', category: 'Transport', spent: 1500, limit: 2500 },
  { id: '3', category: 'Entertainment', spent: 1000, limit: 2000 },
];

export default function BudgetOverviewScreen() {
  const renderItem = ({ item }) => {
    const progress = (item.spent / item.limit) * 100;
    return (
      <View style={styles.card}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.details}>
          KES {item.spent} / {item.limit} ({progress.toFixed(0)}%)
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Monthly Budgets</Text>
      <FlatList
        data={budgets}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  category: { fontSize: 18, fontWeight: '600' },
  details: { fontSize: 14, color: '#555', marginTop: 4 },
});
