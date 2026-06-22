import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Notebook, User, Dumbbell } from 'lucide-react-native';

interface BottomNavigationProps {
  activeTab: 'pr' | 'dashboard' | 'account';
  onTabPress: (tab: 'pr' | 'dashboard' | 'account') => void;
}

export default function BottomNavigation({
  activeTab,
  onTabPress,
}: BottomNavigationProps) {
  return (
    <View style={styles.container}>
      <View style={styles.navigationBar}>
        {/* Personal Records Button */}
        <Pressable
          style={[styles.tabButton, styles.sideButton]}
          onPress={() => onTabPress('pr')}
        >
          <Notebook
            color={activeTab === 'pr' ? '#FFFFFF' : 'rgba(255,255,255,0.5)'}
            size={24}
          />
        </Pressable>

        {/* Dashboard Button (Center/Main) */}
        <Pressable
          style={[styles.tabButton, styles.centerButton]}
          onPress={() => onTabPress('dashboard')}
        >
          <Dumbbell
            color={
              activeTab === 'dashboard' ? '#FFFFFF' : 'rgba(255,255,255,0.5)'
            }
            size={24}
          />
        </Pressable>

        {/* Account Button */}
        <Pressable
          style={[styles.tabButton, styles.sideButton]}
          onPress={() => onTabPress('account')}
        >
          <User
            color={
              activeTab === 'account' ? '#FFFFFF' : 'rgba(255,255,255,0.5)'
            }
            size={24}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 50,
    paddingTop: 10,
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
    paddingBottom: 0,
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
