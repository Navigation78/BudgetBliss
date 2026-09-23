import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react-native';
import { apiPost } from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';
import { normalizeMpesaNumber } from '../utils/mpesa';
import { colors } from '../theme';

const validatePhone = (phone) => /^(?:254|\+254|0)?(7|1)[0-9]{8}$/.test((phone || '').replace(/\s/g, ''));
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function validate(field, formData) {
  const value = formData[field];
  switch (field) {
    case 'username':
      if (!value.trim()) return 'Username is required';
      if (value.length < 3) return 'Username must be at least 3 characters';
      return '';
    case 'email':
      if (!value.trim()) return 'Email is required';
      if (!validateEmail(value)) return 'Please enter a valid email';
      return '';
    case 'phone':
      if (!value.trim()) return 'Phone number is required for M-Pesa';
      if (!validatePhone(value)) return 'Invalid M-Pesa phone number (e.g., 0712345678)';
      return '';
    case 'password':
      if (!value) return 'Password is required';
      if (value.length < 8) return 'Password must be at least 8 characters';
      return '';
    case 'confirmPassword':
      if (!value) return 'Please confirm your password';
      if (value !== formData.password) return 'Passwords do not match';
      return '';
    default:
      return '';
  }
}

const FIELDS = ['username', 'email', 'phone', 'password', 'confirmPassword'];

function Field({ label, required, error, touched, valid, validMessage, children }) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 mb-1">
        {label} {required ? <Text className="text-red-500">*</Text> : null}
      </Text>
      {children}
      {touched && error ? (
        <View className="flex-row items-center gap-1 mt-1">
          <AlertCircle color="#dc2626" size={14} />
          <Text className="text-red-600 text-sm">{error}</Text>
        </View>
      ) : null}
      {touched && !error && valid ? (
        <View className="flex-row items-center gap-1 mt-1">
          <CheckCircle color="#16a34a" size={14} />
          <Text className="text-green-600 text-sm">{validMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function SignupScreen({ navigation }) {
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({ username: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const runValidation = (field, data = formData) => {
    const error = validate(field, data);
    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    runValidation(field);
  };

  const handleSubmit = async () => {
    setTouched(Object.fromEntries(FIELDS.map((f) => [f, true])));
    const allValid = FIELDS.map((f) => runValidation(f)).every(Boolean);
    if (!allValid) return;

    setIsLoading(true);
    try {
      const result = await apiPost('/users', {
        username: formData.username,
        email: formData.email,
        mpesaNumber: normalizeMpesaNumber(formData.phone),
        password: formData.password,
      });
      await signIn(result.user);
    } catch (err) {
      Alert.alert('Signup failed', err.message || 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field) =>
    `flex-1 px-4 py-3 border rounded-lg text-ink ${touched[field] && errors[field] ? 'border-red-500' : 'border-gray-300'}`;

  return (
    <ScrollView
      className="flex-1 bg-pale"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="bg-white rounded-2xl shadow-xl w-full p-8">
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-ink mb-2">Create Account</Text>
          <Text className="text-gray-600">Sign up with M-Pesa integration</Text>
        </View>

        <Field label="Username" required touched={touched.username} error={errors.username}>
          <TextInput
            value={formData.username}
            onChangeText={(v) => setField('username', v)}
            onBlur={() => handleBlur('username')}
            placeholder="Enter username"
            className={inputClass('username')}
          />
        </Field>

        <Field label="Email" required touched={touched.email} error={errors.email}>
          <TextInput
            value={formData.email}
            onChangeText={(v) => setField('email', v)}
            onBlur={() => handleBlur('email')}
            placeholder="email@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            className={inputClass('email')}
          />
        </Field>

        <Field
          label="M-Pesa Phone Number" required touched={touched.phone} error={errors.phone}
          valid={formData.phone} validMessage="Valid M-Pesa number"
        >
          <TextInput
            value={formData.phone}
            onChangeText={(v) => setField('phone', v)}
            onBlur={() => handleBlur('phone')}
            placeholder="0712345678 or 254712345678"
            keyboardType="phone-pad"
            className={inputClass('phone')}
          />
        </Field>

        <Field label="Password" required touched={touched.password} error={errors.password}>
          <View className="flex-row items-center">
            <TextInput
              value={formData.password}
              onChangeText={(v) => setField('password', v)}
              onBlur={() => handleBlur('password')}
              placeholder="Enter password"
              secureTextEntry={!showPassword}
              className={inputClass('password')}
            />
            <Pressable onPress={() => setShowPassword((v) => !v)} className="absolute right-3" hitSlop={8}>
              {showPassword ? <EyeOff color="#6b7280" size={20} /> : <Eye color="#6b7280" size={20} />}
            </Pressable>
          </View>
        </Field>

        <Field
          label="Confirm Password" required touched={touched.confirmPassword} error={errors.confirmPassword}
          valid={formData.confirmPassword} validMessage="Passwords match"
        >
          <View className="flex-row items-center">
            <TextInput
              value={formData.confirmPassword}
              onChangeText={(v) => setField('confirmPassword', v)}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="Confirm password"
              secureTextEntry={!showConfirmPassword}
              className={inputClass('confirmPassword')}
            />
            <Pressable onPress={() => setShowConfirmPassword((v) => !v)} className="absolute right-3" hitSlop={8}>
              {showConfirmPassword ? <EyeOff color="#6b7280" size={20} /> : <Eye color="#6b7280" size={20} />}
            </Pressable>
          </View>
        </Field>

        <Pressable
          onPress={handleSubmit}
          disabled={isLoading}
          className="rounded-lg py-3 items-center mt-2"
          style={{ backgroundColor: isLoading ? '#9ca3af' : colors.primary }}
        >
          <Text className="text-white font-semibold">{isLoading ? 'Creating account...' : 'Sign Up'}</Text>
        </Pressable>

        <View className="items-center mt-6">
          <Text className="text-gray-600 text-sm">
            Already have an account?{' '}
            <Text className="font-medium" style={{ color: colors.primary }} onPress={() => navigation.navigate('Login')}>
              Log in
            </Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
