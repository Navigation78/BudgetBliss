import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

// Placeholder - full port (dashboard stats, recent transactions) lands in milestone 4.
export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-3xl font-bold text-ink mb-2">Welcome back!</Text>
        <Text className="text-primary">Here's your financial overview</Text>
      </View>
    </SafeAreaView>
  );
}
