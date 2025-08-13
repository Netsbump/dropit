import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { athleteSchema } from '@dropit/schemas';
import { z } from 'zod';

export default function App() {

    
    return (
      <View style={styles.container}>
        <Text>Welcome to DropIt Mobile!</Text>
        <Text style={styles.successText}>✅ Shared packages working Ouais!</Text>
        <Text style={styles.smallText}>Test athlete: Sten Levasseur</Text>
        <StatusBar style="auto" />
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    color: 'green',
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
  },
  smallText: {
    fontSize: 12,
    marginTop: 5,
    color: '#666',
  },
});
