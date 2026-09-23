import React from 'react';
import { SafeAreaView, Text, View } from 'react-native';

// Placeholder - full port (daily tip, streak badges, lesson history) lands in milestone 4.
export default function TipsAndStreaksScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-3xl font-bold text-ink mb-2">Tips & Streaks</Text>
        <Text className="text-primary">Daily financial tips and your streak</Text>
      </View>
    </SafeAreaView>
  );
}
