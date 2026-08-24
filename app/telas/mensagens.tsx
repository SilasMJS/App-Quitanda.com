import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Platform,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import authService from "../../services/auth";
import suporteService, { TicketSuporte } from "../../services/suporte";

const statusLabel: Record<string, string> = {
  aberto: "Aguardando atendimento",
  respondido: "Nova resposta",
  resolvido: "Resolvida",
};

const statusColor: Record<string, string> = {
  aberto: "#E65100",
  respondido: "#1976D2",
  resolvido: "#2E7D32",
};

export default function MensagensScreen() {
  const router = useRouter();
  const [mensagens, setMensagens] = useState<TicketSuporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [eAdmin, setEAdmin] = useState(false);

  const carregarMensagens = async () => {
    try {
      setLoading(true);
      setErro(false);
      const usuario = await authService.getCurrentUser();
      const usuarioEAdmin = usuario?.tipo?.toUpperCase() === "ADMIN";
      setEAdmin(usuarioEAdmin);
      const tickets = usuarioEAdmin
        ? await suporteService.listarTodosTickets()
        : await suporteService.listarMeusTickets();
      setMensagens(
        tickets.sort(
          (a, b) =>
            new Date(b.atualizado_em || b.criado_em).getTime() -
            new Date(a.atualizado_em || a.criado_em).getTime(),
        ),
      );
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
      setErro(true);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarMensagens();
    }, []),
  );

  const renderMensagem = ({ item }: { item: TicketSuporte }) => {
    const respondida = item.status === "respondido";
    const cor = statusColor[item.status] || "#777";

    return (
      <TouchableOpacity
        style={[styles.mensagem, respondida && styles.mensagemNova]}
        onPress={() =>
          router.push(eAdmin ? "/telas/admin/suporte" : "/telas/suporte")
        }
        accessibilityRole="button"
        accessibilityLabel={`Abrir mensagem sobre ${item.tipo}`}
      >
        <View style={styles.iconeContainer}>
          <Ionicons
            name={respondida ? "mail-unread" : "chatbubble-ellipses"}
            size={22}
            color={cor}
          />
        </View>
        <View style={styles.conteudo}>
          <View style={styles.linhaTitulo}>
            <Text style={[styles.tipo, respondida && styles.tipoNova]}>
              {item.tipo.replace("_", " ").toUpperCase()}
            </Text>
            <Text style={styles.data}>
              {new Date(
                item.atualizado_em || item.criado_em,
              ).toLocaleDateString("pt-BR")}
            </Text>
          </View>
          <Text style={styles.previa} numberOfLines={2}>
            {item.resposta_admin || item.mensagem}
          </Text>
          <Text style={[styles.status, { color: cor }]}>
            {statusLabel[item.status] || item.status}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#B0B8B3" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityLabel="Voltar"
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Central de mensagens</Text>
          <Text style={styles.headerSubtitle}>
            Acompanhe suas conversas com a Quitanda
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#2E7D32"
          style={styles.loading}
        />
      ) : erro ? (
        <View style={styles.estado}>
          <Ionicons name="cloud-offline-outline" size={42} color="#8A938D" />
          <Text style={styles.estadoTitulo}>Não foi possível carregar</Text>
          <Text style={styles.estadoTexto}>
            Verifique sua conexão e tente novamente.
          </Text>
          <TouchableOpacity style={styles.tentar} onPress={carregarMensagens}>
            <Text style={styles.tentarTexto}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={mensagens}
          keyExtractor={(item) => item.id}
          renderItem={renderMensagem}
          contentContainerStyle={
            mensagens.length ? styles.lista : styles.listaVazia
          }
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            mensagens.length ? (
              <Text style={styles.secao}>SUAS CONVERSAS</Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.estado}>
              <Ionicons name="chatbubbles-outline" size={48} color="#2E7D32" />
              <Text style={styles.estadoTitulo}>Nenhuma mensagem ainda</Text>
              <Text style={styles.estadoTexto}>
                Quando o suporte responder uma solicitação, ela aparecerá aqui.
              </Text>
              <TouchableOpacity
                style={styles.tentar}
                onPress={() =>
                  router.push(
                    eAdmin ? "/telas/admin/suporte" : "/telas/suporte",
                  )
                }
              >
                <Text style={styles.tentarTexto}>Falar com o suporte</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7F4" },
  header: {
    backgroundColor: "#2E7D32",
    paddingTop: Platform.OS === "ios" ? 50 : 24,
    paddingBottom: 22,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: { marginLeft: 16, backgroundColor: "transparent" },
  headerTitle: { color: "#FFF", fontSize: 21, fontWeight: "800" },
  headerSubtitle: { color: "#DDF2DF", fontSize: 12, marginTop: 3 },
  loading: { marginTop: 60 },
  secao: {
    color: "#748078",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 12,
  },
  lista: { padding: 18, paddingBottom: 30 },
  listaVazia: { flexGrow: 1, padding: 20 },
  mensagem: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E1E8E2",
  },
  mensagemNova: { borderLeftWidth: 4, borderLeftColor: "#1976D2" },
  iconeContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EDF5EE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  conteudo: { flex: 1, backgroundColor: "transparent" },
  linhaTitulo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tipo: { color: "#536058", fontSize: 12, fontWeight: "700", flex: 1 },
  tipoNova: { color: "#1976D2" },
  data: { color: "#929B95", fontSize: 11 },
  previa: { color: "#303832", fontSize: 14, lineHeight: 20, marginTop: 6 },
  status: { fontSize: 12, fontWeight: "700", marginTop: 7 },
  estado: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  estadoTitulo: {
    color: "#303832",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 14,
    textAlign: "center",
  },
  estadoTexto: {
    color: "#748078",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 7,
  },
  tentar: {
    backgroundColor: "#2E7D32",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 20,
  },
  tentarTexto: { color: "#FFF", fontWeight: "700" },
});
