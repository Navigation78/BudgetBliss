import React from 'react';
import { Pressable, SafeAreaView, Text, View } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

// Placeholder - full port (profile edit, M-Pesa linking) lands in milestone 4.
// Sign-out is wired up now since it's the only way to exercise the auth gate
// both directions without reinstalling the app.
export default function ProfileScreen() {
  const { signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-3xl font-bold text-ink mb-6">Profile</Text>
        <Pressable
          onPress={signOut}
          className="flex-row items-center gap-2 bg-red-50 border-2 border-red-200 rounded-lg px-4 py-3 self-start"
        >
          <LogOut color="#dc2626" size={18} />
          <Text className="text-red-600 font-semibold">Log out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
