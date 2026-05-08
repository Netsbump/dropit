import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { authClient } from '../lib/auth-client';
import { loginStyles } from './loginStyles';

interface LoginOtpStepProps {
  email: string;
  onSuccess?: () => void;
  onBack: () => void;
}

export default function LoginOtpStep({
  email,
  onSuccess,
  onBack,
}: LoginOtpStepProps) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert('Erreur', 'Veuillez saisir le code à 6 chiffres');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await authClient.signIn.emailOtp({
        email,
        otp: otp.trim(),
      });

      if (error) {
        console.error('Verify OTP error:', error);
        Alert.alert(
          'Erreur de connexion',
          error.message || 'Code incorrect ou expiré'
        );
        return;
      }

      if (data) {
        console.log('Login successful:', data.user.email);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Unexpected verify OTP error:', error);
      Alert.alert('Erreur', 'Une erreur inattendue est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <Text style={styles.otpHint}>
        Code envoyé à <Text style={styles.otpHintEmail}>{email}</Text>
      </Text>

      <View style={loginStyles.inputContainer}>
        <Text style={loginStyles.inputLabel}>Code à 6 chiffres</Text>
        <TextInput
          style={loginStyles.input}
          placeholder="000000"
          placeholderTextColor="#9CA3AF"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
          maxLength={6}
          autoFocus
          editable={!isLoading}
        />
      </View>

      <TouchableOpacity
        style={[
          loginStyles.primaryButton,
          isLoading && loginStyles.primaryButtonDisabled,
        ]}
        onPress={handleVerifyOtp}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={loginStyles.primaryButtonText}>Se connecter</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        disabled={isLoading}
      >
        <Text style={styles.backButtonText}>Modifier l'email</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  otpHint: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  otpHintEmail: {
    color: '#1F2937',
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
});
