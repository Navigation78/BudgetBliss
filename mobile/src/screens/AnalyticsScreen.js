import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

// Placeholder - full port (category/trend charts via react-native-gifted-charts) lands in milestone 4.
export default function AnalyticsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-3xl font-bold text-ink mb-2">Analytics Dashboard</Text>
        <Text className="text-primary">Insights from your spending patterns</Text>
      </View>
    </SafeAreaView>
  );
}
