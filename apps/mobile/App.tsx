import React from 'react';
import AuthProvider from './src/components/AuthProvider';
import DashboardScreen from './src/components/DashboardScreen';

export default function App() {
  return (
    <AuthProvider>
      <DashboardScreen />
    </AuthProvider>
  );
}
