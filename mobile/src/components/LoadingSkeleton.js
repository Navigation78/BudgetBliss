import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { colors } from '../theme';

export default function LoadingSkeleton({ text = 'Loading...' }) {
  return (
    <View className="flex-row items-center gap-3 py-4">
      <ActivityIndicator color={colors.primary} />
      <Text className="text-sm text-gray-500">{text}</Text>
    </View>
  );
}
