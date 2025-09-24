import React, { useState } from 'react';
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
import BottomNavigation from './BottomNavigation';

interface PRScreenProps {
  onTabPress: (tab: 'pr' | 'dashboard' | 'account') => void;
}

interface PRRecord {
  id: string;
  exerciseName: string;
  value: number;
  unit: string;
}

const mockPRRecords: PRRecord[] = [
  { id: '1', exerciseName: 'Arraché', value: 120, unit: 'kg' },
  { id: '2', exerciseName: 'Epaulé-Jetté', value: 162, unit: 'kg' },
  { id: '3', exerciseName: 'Squat Nuque', value: 200, unit: 'kg' },
  { id: '4', exerciseName: 'Squat clav', value: 180, unit: 'kg' },
  { id: '5', exerciseName: 'Tirage arraché', value: 140, unit: 'kg' },
  { id: '6', exerciseName: 'Tirage épaulé', value: 170, unit: 'kg' },
  { id: '7', exerciseName: 'Jetté', value: 167, unit: 'kg' },
];

export default function PRScreen({ onTabPress }: PRScreenProps) {
  const [searchText, setSearchText] = useState('');
  const [filteredRecords, setFilteredRecords] = useState(mockPRRecords);

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text === '') {
      setFilteredRecords(mockPRRecords);
    } else {
      const filtered = mockPRRecords.filter(record =>
        record.exerciseName.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredRecords(filtered);
    }
  };

  const handleAddRecord = () => {
    Alert.alert('Ajouter un record', 'Fonctionnalité à implémenter');
  };

  const handleRecordPress = (record: PRRecord) => {
    Alert.alert(
      record.exerciseName,
      `Record actuel: ${record.value}${record.unit}\n\nFonctionnalité de modification à implémenter`
    );
  };

  const renderPRCard = (record: PRRecord, index: number) => (
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
      <Text style={styles.exerciseName}>{record.exerciseName}</Text>
      <Text style={styles.recordValue}>
        {record.value}
        <Text style={styles.unit}>{record.unit}</Text>
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
            <View style={styles.searchIcon} />
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
        <View style={styles.recordsGrid}>
          {filteredRecords.map((record, index) => renderPRCard(record, index))}
        </View>

        {/* Add New Record Button */}
        <TouchableOpacity
          style={styles.addRecordButton}
          onPress={handleAddRecord}
          activeOpacity={0.8}
        >
          <View style={styles.addIcon}>
            <View style={styles.addIconHorizontal} />
            <View style={styles.addIconVertical} />
          </View>
          <Text style={styles.addRecordText}>Ajoutez un nouveau record</Text>
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
    backgroundColor: '#1A1A1A',
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
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  searchIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '400',
  },

  // Records Grid
  recordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  prCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
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
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  recordValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  unit: {
    fontSize: 18,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // Add Record Button
  addRecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  addIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addIconHorizontal: {
    position: 'absolute',
    width: 16,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  addIconVertical: {
    position: 'absolute',
    width: 2,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  addRecordText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },

  bottomSpacing: {
    height: 20,
  },
});