import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Notebook, User, Dumbbell } from 'lucide-react-native';

interface BottomNavigationProps {
  activeTab: 'pr' | 'dashboard' | 'account';
  onTabPress: (tab: 'pr' | 'dashboard' | 'account') => void;
}

export default function BottomNavigation({ activeTab, onTabPress }: BottomNavigationProps) {
  return (
    <View style={styles.container}>
      <View style={styles.navigationBar}>
        {/* Personal Records Button */}
        <TouchableOpacity
          style={[styles.tabButton, styles.sideButton]}
          onPress={() => onTabPress('pr')}
          activeOpacity={0.7}
        >
          <Notebook
            color={activeTab === 'pr' ? '#FFFFFF' : 'rgba(255,255,255,0.5)'}
            size={24}
          />
        </TouchableOpacity>

        {/* Dashboard Button (Center/Main) */}
        <TouchableOpacity
          style={[styles.tabButton, styles.centerButton]}
          onPress={() => onTabPress('dashboard')}
          activeOpacity={0.7}
        >
          <Dumbbell
            color={activeTab === 'dashboard' ? '#FFFFFF' : 'rgba(255,255,255,0.5)'}
            size={24}
          />
        </TouchableOpacity>

        {/* Account Button */}
        <TouchableOpacity
          style={[styles.tabButton, styles.sideButton]}
          onPress={() => onTabPress('account')}
          activeOpacity={0.7}
        >
          <User
            color={activeTab === 'account' ? '#FFFFFF' : 'rgba(255,255,255,0.5)'}
            size={24}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40, // Safe area for iPhone
    paddingTop: 20,
    backgroundColor: '#191d26',
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#191d26',
    paddingTop: 0,
    paddingHorizontal: 20,
    marginHorizontal: 0,
    paddingBottom: 0
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideButton: {
    flex: 1,
  },
  centerButton: {
    marginHorizontal: 20,
  },
});