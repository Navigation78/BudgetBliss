import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { apiPost } from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateField = (field, value) => {
    let error = '';
    if (field === 'email') {
      if (!value.trim()) error = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Enter a valid email';
    }
    if (field === 'password' && !value) error = 'Password is required';
    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const handleSubmit = async () => {
    setTouched({ email: true, password: true });
    const isEmailValid = validateField('email', formData.email);
    const isPasswordValid = validateField('password', formData.password);
    if (!isEmailValid || !isPasswordValid) return;

    setIsLoading(true);
    try {
      const result = await apiPost('/users/login', {
        email: formData.email,
        password: formData.password,
      });
      await signIn(result.user);
    } catch (err) {
      Alert.alert('Login failed', err.message || 'Invalid login credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-pale"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="bg-white rounded-2xl shadow-xl w-full p-8">
        <View className="items-center mb-8">
          <View className="w-16 h-16 bg-pale rounded-full items-center justify-center mb-4">
            <Lock color={colors.primary} size={32} />
          </View>
          <Text className="text-3xl font-bold text-ink mb-2">Welcome Back</Text>
          <Text className="text-gray-600">Sign in to your account</Text>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
          <View className="flex-row items-center border rounded-lg px-3"
            style={{ borderColor: touched.email && errors.email ? '#ef4444' : '#d1d5db' }}>
            <Mail color="#9ca3af" size={18} />
            <TextInput
              value={formData.email}
              onChangeText={(v) => setField('email', v)}
              onBlur={() => handleBlur('email')}
              placeholder="Enter your email"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              className="flex-1 px-2 py-3 text-ink"
            />
          </View>
          {touched.email && errors.email ? (
            <View className="flex-row items-center gap-1 mt-1">
              <AlertCircle color="#dc2626" size={14} />
              <Text className="text-red-600 text-sm">{errors.email}</Text>
            </View>
          ) : null}
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
          <View className="flex-row items-center border rounded-lg px-3"
            style={{ borderColor: touched.password && errors.password ? '#ef4444' : '#d1d5db' }}>
            <Lock color="#9ca3af" size={18} />
            <TextInput
              value={formData.password}
              onChangeText={(v) => setField('password', v)}
              onBlur={() => handleBlur('password')}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              autoComplete="current-password"
              className="flex-1 px-2 py-3 text-ink"
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
              {showPassword ? <EyeOff color="#6b7280" size={20} /> : <Eye color="#6b7280" size={20} />}
            </Pressable>
          </View>
          {touched.password && errors.password ? (
            <View className="flex-row items-center gap-1 mt-1">
              <AlertCircle color="#dc2626" size={14} />
              <Text className="text-red-600 text-sm">{errors.password}</Text>
            </View>
          ) : null}
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={isLoading}
          className="rounded-lg py-3 items-center"
          style={{ backgroundColor: isLoading ? '#9ca3af' : colors.primary }}
        >
          <Text className="text-white font-semibold">{isLoading ? 'Signing in...' : 'Sign In'}</Text>
        </Pressable>

        <View className="items-center mt-6">
          <Text className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <Text className="font-medium" style={{ color: colors.primary }} onPress={() => navigation.navigate('Signup')}>
              Sign up now
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
