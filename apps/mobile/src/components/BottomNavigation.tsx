import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface BottomNavigationProps {
  activeTab: 'pr' | 'dashboard' | 'account';
  onTabPress: (tab: 'pr' | 'dashboard' | 'account') => void;
}

// PR Icon Component (Trophy/Medal icon)
const PRIcon = ({ active }: { active: boolean }) => (
  <View style={styles.iconWrapper}>
    {/* Trophy base */}
    <View style={[styles.trophyBase, { backgroundColor: active ? '#FFFFFF' : 'rgba(255,255,255,0.5)' }]} />
    {/* Trophy cup */}
    <View style={[styles.trophyCup, { backgroundColor: active ? '#FFFFFF' : 'rgba(255,255,255,0.5)' }]} />
    {/* Trophy handles */}
    <View style={[styles.trophyHandleLeft, { borderColor: active ? '#FFFFFF' : 'rgba(255,255,255,0.5)' }]} />
    <View style={[styles.trophyHandleRight, { borderColor: active ? '#FFFFFF' : 'rgba(255,255,255,0.5)' }]} />
  </View>
);

// Account Icon Component (User profile icon)
const AccountIcon = ({ active }: { active: boolean }) => (
  <View style={styles.iconWrapper}>
    {/* Head */}
    <View style={[styles.userHead, { backgroundColor: active ? '#FFFFFF' : 'rgba(255,255,255,0.5)' }]} />
    {/* Body */}
    <View style={[styles.userBody, { backgroundColor: active ? '#FFFFFF' : 'rgba(255,255,255,0.5)' }]} />
  </View>
);

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
          <PRIcon active={activeTab === 'pr'} />
        </TouchableOpacity>

        {/* Dashboard Button (Center/Main) */}
        <TouchableOpacity
          style={[styles.tabButton, styles.centerButton]}
          onPress={() => onTabPress('dashboard')}
          activeOpacity={0.7}
        >
          <View style={[
            styles.centerIcon,
            activeTab === 'dashboard' && styles.activeCenterIcon
          ]}>
            <View style={styles.playIcon} />
          </View>
        </TouchableOpacity>

        {/* Account Button */}
        <TouchableOpacity
          style={[styles.tabButton, styles.sideButton]}
          onPress={() => onTabPress('account')}
          activeOpacity={0.7}
        >
          <AccountIcon active={activeTab === 'account'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40, // Safe area for iPhone
    paddingTop: 20,
    backgroundColor: '#1A1A1A',
  },
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
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
  centerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeCenterIcon: {
    backgroundColor: '#F0F0F0',
  },
  playIcon: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 12,
    borderRightWidth: 0,
    borderBottomWidth: 12,
    borderLeftWidth: 20,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#000000',
    marginLeft: 4,
  },
  // Icon wrapper
  iconWrapper: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Trophy Icon Styles
  trophyBase: {
    width: 12,
    height: 4,
    position: 'absolute',
    bottom: 0,
  },
  trophyCup: {
    width: 12,
    height: 14,
    borderRadius: 6,
    position: 'absolute',
    top: 0,
  },
  trophyHandleLeft: {
    position: 'absolute',
    left: -2,
    top: 4,
    width: 6,
    height: 8,
    borderWidth: 2,
    borderRightWidth: 0,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    backgroundColor: 'transparent',
  },
  trophyHandleRight: {
    position: 'absolute',
    right: -2,
    top: 4,
    width: 6,
    height: 8,
    borderWidth: 2,
    borderLeftWidth: 0,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: 'transparent',
  },

  // User Icon Styles
  userHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    top: 0,
  },
  userBody: {
    width: 16,
    height: 10,
    borderRadius: 8,
    position: 'absolute',
    bottom: 0,
  },
});