import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  color?: string;
  style?: ViewStyle;
};

export default function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  color = '#2E7D32',
  style,
}: PrimaryButtonProps) {
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }, isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color="#FFF" />
      ) : (
        <Text style={styles.text}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.7,
  },
  text: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
