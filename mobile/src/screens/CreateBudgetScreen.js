import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

// Placeholder - full port (per-category percentage allocation form) lands in milestone 4.
export default function CreateBudgetScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-3xl font-bold text-ink mb-2">Create Budget</Text>
        <Text className="text-primary">Allocate your balance across categories</Text>
      </View>
    </SafeAreaView>
  );
}
