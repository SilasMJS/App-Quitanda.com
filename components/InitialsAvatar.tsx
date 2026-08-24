import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

type InitialsAvatarProps = {
  name: string;
  fontSize?: number;
  style?: ViewStyle;
};

function getInitials(name: string): string {
  if (!name) return 'Q';
  const partes = name.trim().split(/\s+/).filter(Boolean);
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  return partes[0].substring(0, 2).toUpperCase();
}

export default function InitialsAvatar({ name, fontSize = 24, style }: InitialsAvatarProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, { fontSize }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F8F0',
  },
  text: {
    fontWeight: '900',
    color: '#01A66F',
  },
});
