import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { Image } from "expo-image";

import { useRouter } from "expo-router";

import { Text, View } from "../components/Themed";

import { StatusBar } from "expo-status-bar";

import { Ionicons } from "@expo/vector-icons";

import Constants from "expo-constants";

import authService from "../services/auth";

import vendedoresService, { Endereco } from "../services/vendedores";

import comunidadesService, { Comunidade } from "../services/comunidades";

import { pickImage, uploadImage } from "../services/uploadService";

import api from "../services/api";

import { useToast } from "../components/ToastContext";
import PrimaryButton from "../components/PrimaryButton";

const { height } = Dimensions.get("window");

export default function CadastroVendedorScreen() {
  const router = useRouter();

  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  const [loadingComunidades, setLoadingComunidades] = useState(true);

  const [comunidades, setComunidades] = useState<Comunidade[]>([]);

  const [modalComunidade, setModalComunidade] = useState(false);

  // Usuario info

  const [usuarioId, setUsuarioId] = useState("");

  const [vendedorId, setVendedorId] = useState("");

  // Endereço info

  const [cep, setCep] = useState("");

  const [rua, setRua] = useState("");

  const [numero, setNumero] = useState("");

  const [bairro, setBairro] = useState("");

  const [cidade, setCidade] = useState("");

  const [estado, setEstado] = useState("");

  // Busca CEP automático

  const buscarCEP = async (valor: string) => {
    const cepLimpo = valor.replace(/\D/g, "");

    setCep(cepLimpo);

    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cepLimpo}/json/`,
        );

        const data = await response.json();

        if (!data.erro) {
          setRua(data.logradouro);

          setBairro(data.bairro);

          setCidade(data.localidade);

          setEstado(data.uf);

          // O foco vai para o número automaticamente (opcional)
        } else {
          showToast("CEP não encontrado. Verifique o número digitado.", "error");
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  // Vendedor info

  const [nomeFantasia, setNomeFantasia] = useState("");

  const [descricao, setDescricao] = useState("");

  const [chavePix, setChavePix] = useState("");

  const [comunidadeSelecionada, setComunidadeSelecionada] =
    useState<Comunidade | null>(null);

  const [isEditing, setIsEditing] = useState(false);

  const [imagemUrl, setImagemUrl] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [user, listaComunidades] = await Promise.all([
          authService.getCurrentUser(),

          comunidadesService.listarTodas(),
        ]);

        setUsuarioId(user.id);

        setComunidades(listaComunidades);

        // O endereço é do ponto de venda (a quitanda), não da pessoa - só
        // existe depois que o vendedor já foi criado, então só pré-preenche
        // quando for edição de um vendedor existente (abaixo).

        if (user.tipo && user.tipo.toUpperCase() === "VENDEDOR") {
          try {
            const resVendedores = await api.get("/vendedores/");

            const vendedorInfo = resVendedores.data.find(
              (v: any) => v.usuario_id === user.id,
            );

            if (vendedorInfo) {
              setIsEditing(true);

              setVendedorId(vendedorInfo.id);

              setNomeFantasia(vendedorInfo.nome_fantasia || "");

              setDescricao(vendedorInfo.descricao || "");

              setChavePix(vendedorInfo.chave_pix || "");

              if (vendedorInfo.imagem_url)
                setImagemUrl(vendedorInfo.imagem_url);

              const comInfo = listaComunidades.find(
                (c: any) => c.id === vendedorInfo.comunidade_id,
              );

              if (comInfo) setComunidadeSelecionada(comInfo);

              try {
                const resAddr = await api.get(
                  `/vendedores/${vendedorInfo.id}/endereco`,
                );

                if (resAddr.data) {
                  setCep(resAddr.data.cep || "");

                  setRua(resAddr.data.rua || "");

                  setNumero(resAddr.data.numero || "");

                  setBairro(resAddr.data.bairro || "");

                  setCidade(resAddr.data.cidade || "");

                  setEstado(resAddr.data.estado || "");
                }
              } catch (e) {}
            }
          } catch (e) {}
        }
      } catch (error) {
        // Sem isso, um timeout aqui (ex: backend "acordando" no Render) deixava
        // usuarioId vazio e o formulário parecia funcionar, mas falhava com 403 ao salvar.
        const msg = 'Não foi possível carregar seus dados. Verifique sua conexão e tente novamente.';
        showToast(msg, 'error');
      } finally {
        setLoadingComunidades(false);
      }
    }

    loadData();
  }, []);

  const handlePickImage = async () => {
    try {
      const uri = await pickImage();

      if (uri) {
        setLoading(true);

        const finalUrl = await uploadImage(uri, "vendedores");

        setImagemUrl(finalUrl);

        setLoading(false);
      }
    } catch (e) {
      console.log("Erro ao enviar imagem", e);

      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    if (!usuarioId) {
      showToast(
        "Não foi possível identificar seu usuário. Volte e entre novamente.",
        "error",
      );

      return;
    }

    if (!cep || !rua || !numero || !bairro || !cidade || !estado) {
      showToast("Por favor, preencha todos os campos do endereço.", "error");

      return;
    }

    if (!nomeFantasia || !chavePix || !comunidadeSelecionada) {
      showToast(
        "Por favor, preencha o nome fantasia, chave pix e selecione uma comunidade.",
        "error",
      );

      return;
    }

    setLoading(true);

    try {
      let latitude = 0;

      let longitude = 0;

      try {
        const query = encodeURIComponent(
          `${rua}, ${numero}, ${cidade}, ${estado}, Brasil`,
        );

        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}`,
        );

        const geoData = await geoRes.json();

        if (geoData && geoData.length > 0) {
          latitude = parseFloat(geoData[0].lat);

          longitude = parseFloat(geoData[0].lon);
        } else {
          const queryFallback = encodeURIComponent(
            `${rua}, ${cidade}, ${estado}, Brasil`,
          );

          const geoResFb = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${queryFallback}`,
          );

          const geoDataFb = await geoResFb.json();

          if (geoDataFb && geoDataFb.length > 0) {
            latitude = parseFloat(geoDataFb[0].lat);

            longitude = parseFloat(geoDataFb[0].lon);
          }
        }
      } catch (e) {
        console.log("Erro ao buscar coordenadas", e);
      }

      // 1. Criar ou atualizar o perfil de vendedor primeiro - o endereço é
      // do ponto de venda, então só pode ser salvo depois que o vendedor
      // já existe.

      if (isEditing) {
        await vendedoresService.atualizarPerfilVendedor({
          comunidade_id: comunidadeSelecionada.id,

          nome_fantasia: nomeFantasia,

          descricao: descricao || undefined,

          chave_pix: chavePix,

          imagem_url: imagemUrl || undefined,
        });
      } else {
        await vendedoresService.criarPerfilVendedor({
          usuario_id: usuarioId,

          comunidade_id: comunidadeSelecionada.id,

          nome_fantasia: nomeFantasia,

          descricao: descricao || undefined,

          chave_pix: chavePix,
        });

        if (imagemUrl) {
          await vendedoresService.atualizarPerfilVendedor({
            imagem_url: imagemUrl,
          });
        }
      }

      // 2. Agora que o vendedor existe (e o usuário já foi promovido a
      // VENDEDOR), salva o endereço da quitanda.

      const endereco: Endereco = {
        cep,
        rua,
        numero,
        bairro,
        cidade,
        estado,

        latitude,
        longitude,
      };

      await vendedoresService.cadastrarEnderecoMeuVendedor(endereco);

      if (isEditing) {
        showToast("Sua quitanda foi atualizada com sucesso!", "success");
        router.back();
      } else {
        showToast("Seu perfil de vendedor foi criado com sucesso!", "success");
        router.replace("/telas/dashboard");
      }
    } catch (error: any) {
      console.error(error);

      showToast(
        error.response?.data?.detail ||
          "Houve um erro ao processar sua requisição.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingComunidades) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <StatusBar style="dark" />

      {/* Cabeçalho Superior Padronizado */}

      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace("/telas/dashboard")
          }
        >
          <Ionicons name="arrow-back" size={26} color="#2E7D32" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoRow}
          onPress={() => router.replace("/telas/dashboard")}
        >
          <Image
            source={require("../assets/images/logo.svg")}
            style={{ width: 35, height: 35 }}
            contentFit="contain"
          />

          <Text style={styles.logoText}>uitanda.com</Text>
        </TouchableOpacity>

        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditing ? "Minha Quitanda" : "Perfil de Vendedor"}
            </Text>

            <Text style={styles.subtitle}>
              {isEditing
                ? "Atualize os dados e a logo da sua quitanda"
                : "Complete as informações da sua quitanda"}
            </Text>
          </View>

          <View
            style={[
              styles.section,
              {
                alignItems: "center",
                backgroundColor: "transparent",
                elevation: 0,
                shadowOpacity: 0,
              },
            ]}
          >
            <TouchableOpacity
              onPress={handlePickImage}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: "#f0f0f0",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
                borderWidth: 2,
                borderColor: "#01A66F",
              }}
            >
              {imagemUrl ? (
                <Image
                  source={{ uri: imagemUrl }}
                  style={{ width: 120, height: 120 }}
                />
              ) : (
                <Ionicons name="camera" size={40} color="#ccc" />
              )}
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 12,
                color: "#666",
                marginTop: 8,
                fontWeight: "bold",
              }}
            >
              Logo da Quitanda
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Endereço da Quitanda</Text>

            <Text style={styles.inputLabel}>CEP</Text>

            <TextInput
              style={styles.input}
              placeholder="Ex: 00000-000"
              placeholderTextColor="#AAB0B8"
              value={cep}
              onChangeText={buscarCEP}
              keyboardType="numeric"
              maxLength={8}
            />

            <View style={styles.row}>
              <View style={{ flex: 3, marginRight: 10 }}>
                <Text style={styles.inputLabel}>Rua</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Ex: Rua das Flores"
                  placeholderTextColor="#AAB0B8"
                  value={rua}
                  onChangeText={setRua}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Nº</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Ex: 123"
                  placeholderTextColor="#AAB0B8"
                  value={numero}
                  onChangeText={setNumero}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Bairro</Text>

            <TextInput
              style={styles.input}
              placeholder="Ex: Centro"
              placeholderTextColor="#AAB0B8"
              value={bairro}
              onChangeText={setBairro}
            />

            <View style={styles.row}>
              <View style={{ flex: 2, marginRight: 10 }}>
                <Text style={styles.inputLabel}>Cidade</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Ex: Teresina"
                  placeholderTextColor="#AAB0B8"
                  value={cidade}
                  onChangeText={setCidade}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Estado</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Ex: PI"
                  placeholderTextColor="#AAB0B8"
                  value={estado}
                  onChangeText={setEstado}
                  maxLength={2}
                  autoCapitalize="characters"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados Comerciais</Text>

            <Text style={styles.inputLabel}>Nome da Quitanda (Fantasia)</Text>

            <TextInput
              style={styles.input}
              placeholder="Ex: Quitanda do Zé"
              value={nomeFantasia}
              onChangeText={setNomeFantasia}
            />

            <Text style={styles.inputLabel}>Descrição (Opcional)</Text>

            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              placeholder="Fale um pouco sobre o que você vende..."
              multiline
              numberOfLines={3}
              value={descricao}
              onChangeText={setDescricao}
            />

            <Text style={styles.inputLabel}>Chave PIX (Para Recebimentos)</Text>

            <TextInput
              style={styles.input}
              placeholder="CPF, E-mail ou Celular"
              value={chavePix}
              onChangeText={setChavePix}
            />

            <Text style={styles.inputLabel}>Comunidade (Onde você atua?)</Text>

            <TouchableOpacity
              style={styles.selectField}
              onPress={() => setModalComunidade(true)}
            >
              <Text
                style={
                  comunidadeSelecionada
                    ? styles.selectText
                    : styles.placeholderText
                }
              >
                {comunidadeSelecionada?.nome || "Selecionar Comunidade..."}
              </Text>

              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <PrimaryButton
            label={isEditing ? "Salvar Alterações" : "Finalizar Cadastro"}
            onPress={handleSalvar}
            loading={loading}
            disabled={loadingComunidades}
            color="#2E7D32"
            style={{ marginTop: 20, marginBottom: 40 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={modalComunidade} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Escolha sua Comunidade</Text>

              <TouchableOpacity onPress={() => setModalComunidade(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={comunidades}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    setComunidadeSelecionada(item);
                    setModalComunidade(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.nome}</Text>

                  <Text style={styles.optionSubtext}>
                    {item.descricao_curta}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={{ padding: 20, alignItems: "center" }}>
                  <Text style={{ color: "#999" }}>
                    Nenhuma comunidade encontrada.
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: "#FFF" },

  container: { flex: 1, backgroundColor: "#FFF" },

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

  logoRow: { flexDirection: "row", alignItems: "center" },

  logoText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2E7D32",
    marginLeft: -2,
  },

  backButton: { padding: 5 },

  scrollContainer: {
    flexGrow: 1,

    padding: 25,

    paddingTop: 10,
  },

  header: { marginBottom: 30 },

  title: { fontSize: 26, fontWeight: "bold", color: "#2E7D32" },

  subtitle: { fontSize: 16, color: "#666", marginTop: 5 },

  section: { marginBottom: 30 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingBottom: 5,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 5,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EEE",
    fontSize: 16,
  },

  row: { flexDirection: "row", justifyContent: "space-between" },

  selectField: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEE",
  },

  placeholderText: { color: "#999" },

  selectText: { color: "#333", fontWeight: "500" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "70%",
    padding: 20,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  modalTitle: { fontSize: 20, fontWeight: "bold" },

  optionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  optionText: { fontSize: 16, fontWeight: "bold", color: "#333" },

  optionSubtext: { fontSize: 14, color: "#666" },
});
