import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import LoginEmailStep from './LoginEmailStep';
import LoginOtpStep from './LoginOtpStep';

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

type LoginStep = 'email' | 'otp';

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [step, setStep] = useState<LoginStep>('email');
  const [email, setEmail] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>DropIt</Text>
          <Text style={styles.subtitle}>Votre assistant d'entraînement</Text>
        </View>

        <View style={styles.form}>
          {step === 'email' ? (
            <LoginEmailStep
              onSuccess={(confirmedEmail) => {
                setEmail(confirmedEmail);
                setStep('otp');
              }}
            />
          ) : (
            <LoginOtpStep
              email={email}
              onSuccess={onLoginSuccess}
              onBack={() => setStep('email')}
            />
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            En vous connectant, vous acceptez nos conditions d'utilisation
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191d26',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});
