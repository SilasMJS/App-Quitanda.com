import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Confirmar",
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelLabel}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <Text style={styles.confirmLabel}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(20, 30, 23, 0.45)",
    justifyContent: "center",
    padding: 24,
  },
  dialog: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 22,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  title: { color: "#26332A", fontSize: 20, fontWeight: "800" },
  message: { color: "#637067", fontSize: 15, lineHeight: 22, marginTop: 8 },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 24,
    gap: 10,
  },
  cancelButton: { paddingHorizontal: 14, paddingVertical: 11 },
  cancelLabel: { color: "#637067", fontWeight: "700" },
  confirmButton: {
    backgroundColor: "#D32F2F",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  confirmLabel: { color: "#FFF", fontWeight: "800" },
});
