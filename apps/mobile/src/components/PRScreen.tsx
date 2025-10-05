import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Search } from 'lucide-react-native';
import BottomNavigation from './BottomNavigation';
import { LinearGradient } from 'expo-linear-gradient';
import { authClient } from '../lib/auth-client';
import { api } from '../lib/api';
import type { PersonalRecordDto } from '@dropit/schemas';

interface PRScreenProps {
  onTabPress: (tab: 'pr' | 'dashboard' | 'account') => void;
}

export default function PRScreen({ onTabPress }: PRScreenProps) {
  const [searchText, setSearchText] = useState('');
  const [allRecords, setAllRecords] = useState<PersonalRecordDto[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<PersonalRecordDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [athleteId, setAthleteId] = useState<string | null>(null);

  // Fetch athleteId from session on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const sessionData = await authClient.getSession();
        if (sessionData.data?.session?.athleteId) {
          setAthleteId(sessionData.data.session.athleteId);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    fetchSession();
  }, []);

  // Fetch personal records when athleteId is available
  useEffect(() => {
    const fetchPersonalRecords = async () => {
      if (!athleteId) return;

      setIsLoading(true);
      try {
        const response = await api.personalRecord.getAthletePersonalRecords({
          params: { id: athleteId },
        });

        const data = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;

        if (response.status === 200) {
          setAllRecords(data);
          setFilteredRecords(data);
        }
      } catch (error) {
        console.error('Error fetching personal records:', error);
        setAllRecords([]);
        setFilteredRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonalRecords();
  }, [athleteId]);

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text === '') {
      setFilteredRecords(allRecords);
    } else {
      const filtered = allRecords.filter(record =>
        record.exerciseName?.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredRecords(filtered);
    }
  };

  const handleAddRecord = () => {
    Alert.alert('Ajouter un record', 'Fonctionnalité à implémenter');
  };

  const handleRecordPress = (record: PersonalRecordDto) => {
    Alert.alert(
      record.exerciseName || 'Exercice',
      `Record actuel: ${record.weight}kg\n\nFonctionnalité de modification à implémenter`
    );
  };

  const renderPRCard = (record: PersonalRecordDto, index: number) => (
    <TouchableOpacity
      key={record.id}
      style={[
        styles.prCard,
        index === filteredRecords.length - 1 && filteredRecords.length % 2 === 1
          ? styles.fullWidthCard
          : styles.halfWidthCard
      ]}
      onPress={() => handleRecordPress(record)}
      activeOpacity={0.8}
    >
      <Text style={styles.exerciseName}>{record.exerciseName || 'Exercice'}</Text>
      <Text style={styles.recordValue}>
        {record.weight}
        <Text style={styles.unit}>kg</Text>
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Records personnels</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search color="rgba(255, 255, 255, 0.5)" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={searchText}
              onChangeText={handleSearch}
            />
          </View>
        </View>

        {/* PR Records Grid */}
        {isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Chargement...</Text>
          </View>
        ) : filteredRecords.length > 0 ? (
          <View style={styles.recordsGrid}>
            {filteredRecords.map((record, index) => renderPRCard(record, index))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>Aucun record</Text>
            <Text style={styles.emptyStateText}>
              {searchText
                ? 'Aucun record trouvé pour cette recherche'
                : 'Vous n\'avez pas encore de records personnels'}
            </Text>
          </View>
        )}

        {/* Add New Record Button */}
        <TouchableOpacity onPress={handleAddRecord} activeOpacity={0.8}>
          <LinearGradient
            colors={['#63b8ef', '#4fa3e3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addRecordButton}
          >
            <Text style={styles.addRecordText}>Ajoutez un nouveau record</Text>
          </LinearGradient>
        </TouchableOpacity>


        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab="pr"
        onTabPress={onTabPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191d26',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e9edf5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Search Section
  searchContainer: {
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282c38',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#e9edf5',
    fontWeight: '400',
  },

  // Records Grid
  recordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },

  // Empty State
  emptyState: {
    paddingVertical: 60,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f2f6f6',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#a9acae',
    textAlign: 'center',
    lineHeight: 24,
  },
  prCard: {
    backgroundColor: '#282c38',
    borderWidth: 1,
    borderColor: '#414551',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  halfWidthCard: {
    width: '47%',
  },
  fullWidthCard: {
    width: '47%', // Keep same width as others for consistency
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e9edf5',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  recordValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e9edf5',
  },
  unit: {
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // Add Record Button
  addRecordButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  addRecordText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e9edf5',
  },

  bottomSpacing: {
    height: 20,
  },
});