import React from 'react';
import { StyleSheet, TouchableOpacity, View, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from './Themed';
import Constants from 'expo-constants';

interface GlobalHeaderProps {
  showBack?: boolean;
}

export default function GlobalHeader({ showBack = false }: GlobalHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoRow}>
            <Image 
              source={require('../assets/images/Group 2.svg')} 
              style={styles.logo} 
              contentFit="contain" 
            />
            <Text style={styles.logoText}>uitanda.com</Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.profileButton} 
        onPress={() => router.push('/telas/perfil')}
      >
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={20} color="#666" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : Constants.statusBarHeight + 10,
    paddingBottom: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 30,
    height: 30,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2E7D32',
    marginLeft: -3,
  },
  iconButton: {
    padding: 5,
  },
  profileButton: {
    padding: 5,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },
});
