import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { authClient } from '../lib/auth-client';
import { loginStyles } from './loginStyles';

interface LoginEmailStepProps {
  onSuccess: (email: string) => void;
}

export default function LoginEmailStep({ onSuccess }: LoginEmailStepProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre email');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: email.trim().toLowerCase(),
        type: 'sign-in',
      });

      if (error) {
        console.error('Send OTP error:', error);
        Alert.alert('Erreur', error.message || 'Impossible d\'envoyer le code');
        return;
      }

      onSuccess(email.trim().toLowerCase());
    } catch (error) {
      console.error('Unexpected send OTP error:', error);
      Alert.alert('Erreur', 'Une erreur inattendue est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <View style={loginStyles.inputContainer}>
        <Text style={loginStyles.inputLabel}>Email</Text>
        <TextInput
          style={loginStyles.input}
          placeholder="votre.email@exemple.com"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />
      </View>

      <TouchableOpacity
        style={[loginStyles.primaryButton, isLoading && loginStyles.primaryButtonDisabled]}
        onPress={handleSendOtp}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={loginStyles.primaryButtonText}>Recevoir un code</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
