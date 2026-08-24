import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    View as RNView,
    ScrollView,
    StyleSheet,
    TouchableOpacity
} from "react-native";
import ConfirmModal from "../../components/ConfirmModal";
import { Text } from "../../components/Themed";
import { useToast } from "../../components/ToastContext";
import api from "../../services/api";
import authService from "../../services/auth";
import { pickImage, uploadImage } from "../../services/uploadService";

export default function PerfilScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const data = await authService.getCurrentUser();

      try {
        const resAddr = await api.get("/usuarios/me/endereco");
        if (resAddr.data) data.endereco = resAddr.data;
      } catch (e) {}

      if (data.tipo && data.tipo.toUpperCase() === "VENDEDOR") {
        try {
          const resVendedores = await api.get("/vendedores/");
          const vendedorInfo = resVendedores.data.find(
            (v: any) => v.usuario_id === data.id,
          );
          if (vendedorInfo) {
            data.vendedor = vendedorInfo;
            const resComunidades = await api.get("/comunidades/");
            const comunidadeInfo = resComunidades.data.find(
              (c: any) => c.id === vendedorInfo.comunidade_id,
            );
            if (comunidadeInfo) data.vendedor.comunidade = comunidadeInfo;
          }
        } catch (e) {}
      }

      setUser(data);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      await authService.logout();
      router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    await authService.logout();
    router.replace("/");
  };

  if (loading) {
    return (
      <RNView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </RNView>
    );
  }

  return (
    <RNView style={styles.container}>
      <StatusBar style="dark" />

      {/* Cabeçalho Superior Padronizado */}
      <RNView style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.canGoBack()
                ? router.back()
                : router.replace("/telas/dashboard");
            } else {
              router.replace("/");
            }
          }}
        >
          <Ionicons name="arrow-back" size={26} color="#2E7D32" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoRow}
          onPress={() => router.replace("/telas/dashboard")}
        >
          <Image
            source={require("../../assets/images/logo.svg")}
            style={{ width: 35, height: 35 }}
            contentFit="contain"
          />
          <Text style={styles.logoText}>uitanda.com</Text>
        </TouchableOpacity>

        <RNView style={{ width: 40 }} />
      </RNView>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Cartão de Identificação */}
        <RNView style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={async () => {
              const uri = await pickImage();
              if (uri) {
                setLoading(true);
                try {
                  const finalUrl = await uploadImage(uri, "usuarios");
                  await api.put("/usuarios/me", {
                    nome: user.nome,
                    imagem_url: finalUrl,
                  });
                  // Atualiza localmente
                  setUser({ ...user, imagem_url: finalUrl });
                } catch (e) {
                  showToast("Não foi possível atualizar a foto.", "error");
                } finally {
                  setLoading(false);
                }
              }
            }}
          >
            {user?.imagem_url ? (
              <Image
                source={{ uri: user.imagem_url }}
                style={{ width: 86, height: 86, borderRadius: 43 }}
              />
            ) : (
              <Text
                style={{ fontSize: 36, fontWeight: "bold", color: "#2E7D32" }}
              >
                {(() => {
                  if (!user?.nome) return "US";
                  const parts = user.nome.trim().split(/\s+/);
                  return parts.length >= 2
                    ? (parts[0][0] + parts[1][0]).toUpperCase()
                    : user.nome.substring(0, 2).toUpperCase();
                })()}
              </Text>
            )}
            <RNView
              style={{
                position: "absolute",
                bottom: -5,
                right: -5,
                backgroundColor: "#1976D2",
                padding: 6,
                borderRadius: 15,
                elevation: 3,
              }}
            >
              <Ionicons name="camera" size={14} color="#FFF" />
            </RNView>
          </TouchableOpacity>
          <Text style={styles.userName}>{user?.nome || "Usuário"}</Text>
          <RNView
            style={[
              styles.roleBadge,
              user?.tipo?.toUpperCase() === "ADMIN" && {
                backgroundColor: "#FBC02D",
              },
              user?.tipo?.toUpperCase() === "CLIENTE" && {
                backgroundColor: "#1976D2",
              },
            ]}
          >
            <Text style={styles.roleText}>
              {user?.tipo?.toUpperCase() === "ADMIN"
                ? "ADMINISTRADOR"
                : user?.tipo?.toUpperCase() === "VENDEDOR"
                  ? "VENDEDOR"
                  : "CLIENTE"}
            </Text>
          </RNView>
        </RNView>

        {/* Banner de Aviso de Cadastro Incompleto */}
        {user?.tipo?.toUpperCase() === "CLIENTE" && (
          <TouchableOpacity
            style={styles.incompleteBanner}
            onPress={() => router.push("/cadastro-vendedor")}
          >
            <Ionicons name="warning-outline" size={24} color="#E65100" />
            <RNView
              style={{
                flex: 1,
                marginLeft: 12,
                backgroundColor: "transparent",
              }}
            >
              <Text style={styles.incompleteTitle}>Ação Necessária</Text>
              <Text style={styles.incompleteSubtitle}>
                Você ainda não pode vender. Complete seu perfil de vendedor
                agora.
              </Text>
            </RNView>
            <Ionicons name="chevron-forward" size={18} color="#E65100" />
          </TouchableOpacity>
        )}

        {/* Informações de Contato */}
        <RNView style={styles.section}>
          <RNView style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>DADOS PESSOAIS</Text>
            <TouchableOpacity onPress={() => router.push("/cadastro-vendedor")}>
              <Text style={styles.editLink}>Editar</Text>
            </TouchableOpacity>
          </RNView>
          <RNView style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#2E7D32" />
            <Text style={styles.infoLabel}>{user?.telefone}</Text>
          </RNView>
          <RNView style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#2E7D32" />
            <Text style={styles.infoLabel}>
              {user?.email || "E-mail não cadastrado"}
            </Text>
          </RNView>
        </RNView>

        {/* Informações da Quitanda (Visível se for VENDEDOR) */}
        {user?.tipo?.toUpperCase() === "VENDEDOR" && (
          <RNView style={styles.section}>
            <RNView style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>MINHA QUITANDA</Text>
              <TouchableOpacity
                onPress={() => router.push("/cadastro-vendedor")}
              >
                <Text style={styles.editLink}>Editar</Text>
              </TouchableOpacity>
            </RNView>
            <RNView style={styles.infoCard}>
              <RNView style={styles.infoRowSimple}>
                <Ionicons name="storefront-outline" size={18} color="#2E7D32" />
                <Text style={styles.infoTextBold}>
                  {user?.vendedor?.nome_fantasia || "Nome não definido"}
                </Text>
              </RNView>
              <RNView style={styles.infoRowSimple}>
                <Ionicons name="card-outline" size={18} color="#2E7D32" />
                <Text style={styles.infoText}>
                  PIX: {user?.vendedor?.chave_pix || "Não informado"}
                </Text>
              </RNView>
              <RNView style={styles.infoRowSimple}>
                <Ionicons name="location-outline" size={18} color="#2E7D32" />
                <Text style={styles.infoText} numberOfLines={2}>
                  {user?.endereco
                    ? `${user.endereco.rua}, ${user.endereco.numero} - ${user.endereco.bairro}`
                    : "Endereço não cadastrado"}
                </Text>
              </RNView>
              <RNView style={styles.infoRowSimple}>
                <Ionicons name="people-outline" size={18} color="#2E7D32" />
                <Text style={styles.infoText}>
                  Comunidade: {user?.vendedor?.comunidade?.nome || "Nenhuma"}
                </Text>
              </RNView>
            </RNView>
          </RNView>
        )}

        {/* Seção Administrativa - Visível apenas para ADMIN */}
        {user?.tipo?.toUpperCase() === "ADMIN" && (
          <RNView style={styles.section}>
            <Text style={styles.sectionTitle}>PAINEL ADMINISTRATIVO</Text>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#1976D2" }]}
              onPress={() => router.push("/telas/admin/comunidades")}
            >
              <Ionicons name="business" size={22} color="#FFF" />
              <Text style={styles.actionButtonText}>GERENCIAR COMUNIDADES</Text>
              <Ionicons name="chevron-forward" size={18} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: "#0288D1", marginTop: 12 },
              ]}
              onPress={() => router.push("/telas/admin/vendedores")}
            >
              <Ionicons name="people" size={22} color="#FFF" />
              <Text style={styles.actionButtonText}>APROVAR VENDEDORES</Text>
              <Ionicons name="chevron-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          </RNView>
        )}

        {/* Quitanda e Negócios - Botão Verde Sólido (Não aparece para Admin se quiser simplificar, ou mantém) */}
        {user?.tipo?.toUpperCase() !== "ADMIN" && (
          <RNView style={styles.section}>
            <Text style={styles.sectionTitle}>QUITANDA E NEGÓCIOS</Text>

            {user?.tipo?.toUpperCase() === "VENDEDOR" ? (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push("/telas/dashboard")}
              >
                <Ionicons name="storefront" size={22} color="#FFF" />
                <Text style={styles.actionButtonText}>PAINEL DO VENDEDOR</Text>
                <Ionicons name="chevron-forward" size={18} color="#FFF" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push("/cadastro-vendedor")}
              >
                <Ionicons name="id-card" size={22} color="#FFF" />
                <Text style={styles.actionButtonText}>
                  TORNE-SE UM VENDEDOR
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#FFF" />
              </TouchableOpacity>
            )}
          </RNView>
        )}

        {/* Botão de Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#D32F2F" />
          <Text style={styles.logoutText}>SAIR DA CONTA</Text>
        </TouchableOpacity>
      </ScrollView>
      <ConfirmModal
        visible={logoutModalVisible}
        title="Sair da conta"
        message="Deseja realmente sair da sua conta?"
        confirmLabel="Sair"
        onCancel={() => setLogoutModalVisible(false)}
        onConfirm={handleLogout}
      />
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingTop: Constants.statusBarHeight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 60 + Constants.statusBarHeight,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingTop: Constants.statusBarHeight,
  },
  backButton: { padding: 5 },
  logoRow: { flexDirection: "row", alignItems: "center" },
  logoText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2E7D32",
    marginLeft: -2,
  },
  scrollContainer: {
    padding: 25,
    paddingBottom: 80, // Garante que nada fique colado no final
  },
  scrollContent: { flex: 1, padding: 25, paddingBottom: 60 },
  profileCard: {
    alignItems: "center",
    marginBottom: 35,
    backgroundColor: "#FFF",
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#2E7D32",
  },
  userName: { fontSize: 24, fontWeight: "900", color: "#333" },
  roleBadge: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
  },
  roleText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },
  section: { marginBottom: 35 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "transparent",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#999",
    letterSpacing: 1,
  },
  editLink: { fontSize: 13, color: "#2E7D32", fontWeight: "bold" },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    padding: 18,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  infoCard: {
    backgroundColor: "#F9F9F9",
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  infoRowSimple: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "transparent",
  },
  infoText: { fontSize: 15, color: "#555", marginLeft: 12 },
  infoTextBold: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 12,
  },
  infoLabel: { fontSize: 16, color: "#333", marginLeft: 15, fontWeight: "500" },
  incompleteBanner: {
    backgroundColor: "#FFF3E0",
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 15,
    marginBottom: 35,
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  incompleteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E65100",
  },
  incompleteSubtitle: {
    fontSize: 12,
    color: "#EF6C00",
    marginTop: 2,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    padding: 20,
    borderRadius: 15,
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  actionButtonText: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
    marginLeft: 15,
    letterSpacing: 0.5,
    backgroundColor: "transparent",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    marginBottom: 60,
    marginTop: 10,
  },
  logoutText: {
    color: "#D32F2F",
    fontSize: 16,
    fontWeight: "900",
    marginLeft: 10,
    letterSpacing: 1,
  },
});
