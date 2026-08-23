import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import produtosService from "../../services/produtos";
import storage from "../../services/storage";
import { uploadImage } from "../../services/uploadService";

const { width } = Dimensions.get("window");

export default function ProdutosScreen() {
  const router = useRouter();
  const [estoque, setEstoque] = useState<any[]>([]);
  const [produtosBase, setProdutosBase] = useState<any[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [modalSelecaoNome, setModalSelecaoNome] = useState(false);

  // Estados do formulário
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [fotoPersonalizada, setFotoPersonalizada] = useState<string | null>(
    null,
  );
  const [novoValor, setNovoValor] = useState("");
  const [novoQuantidade, setNovoQuantidade] = useState("");
  const [unidadeMedida, setUnidadeMedida] = useState<string>("un");

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const response = await produtosService.listarMeusProdutos();
      const listaProdutos = response?.produtos_vendedores || [];
      setEstoque(Array.isArray(listaProdutos) ? listaProdutos : []);

      const base = await produtosService.listarProdutosBase();
      setProdutosBase(Array.isArray(base) ? base : []);
    } catch (error: any) {
      console.error("Erro ao carregar produtos:", error);
      setEstoque([]);
    } finally {
      setLoading(false);
    }
  };

  const tirarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão", "Precisamos de acesso à câmera.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.5,
    });
    if (!result.canceled) {
      setFotoPersonalizada(result.assets[0].uri);
    }
  };

  const escolherDaGaleria = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão", "Precisamos de acesso à galeria.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.5,
    });
    if (!result.canceled) {
      setFotoPersonalizada(result.assets[0].uri);
    }
  };

  const formatarMoeda = (valor: string | number) => {
    let digits = String(valor).replace(/\D/g, "");
    if (!digits) return "";
    digits = parseInt(digits, 10).toString();
    digits = digits.padStart(3, "0");
    let centavos = digits.slice(-2);
    let inteiros = digits.slice(0, -2);
    inteiros = inteiros.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${inteiros},${centavos}`;
  };

  const handleValorChange = (text: string) => {
    setNovoValor(formatarMoeda(text));
  };

  const abrirEdicao = (item: any) => {
    console.debug("abrirEdicao called", { item });
    setEditandoId(item.produto_vendedor_id);
    const base = produtosBase.find((p) => p.id === item.produto_id);
    setProdutoSelecionado(
      base || {
        id: item.produto_id,
        nome: item.produto_nome,
        imagem_url: item.imagem_url,
      },
    );
    setFotoPersonalizada(item.imagem_url);
    const precoNum = Number(item.preco).toFixed(2);
    setNovoValor(formatarMoeda(precoNum));
    setNovoQuantidade(item.estoque.toString());
    setUnidadeMedida(item.tipo_unidade || (base && base.tipo_unidade) || "un");
    setModalAberto(true);
  };

  const abrirNovo = () => {
    console.debug("abrirNovo called");
    resetForm();
    setModalAberto(true);
  };



  const confirmarExclusao = () => {
    if (!editandoId) return;

    Alert.alert(
      "Remover Produto",
      "Tem certeza que deseja remover este produto da sua vitrine?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Remover", style: "destructive", onPress: deletarProduto },
      ],
    );
  };

  const deletarProduto = async () => {
    if (!editandoId) return;

    setSalvando(true);
    try {
      await produtosService.deletarProduto(editandoId);
      Alert.alert("Sucesso", "Produto removido com sucesso.");
      setModalAberto(false);
      resetForm();
      carregarDados();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível remover o produto.");
    } finally {
      setSalvando(false);
    }
  };

  const salvarProduto = async () => {
    console.log("CHAMOU SALVAR PRODUTO", { produtoSelecionado, novoValor, novoQuantidade, unidadeMedida, editandoId });
    if (!produtoSelecionado || !novoValor || !novoQuantidade) {
      const msg = "Preencha todos os campos obrigatórios.";
      if (Platform.OS === 'web') { window.alert(msg); } else { Alert.alert("Erro", msg); }
      return;
    }

    const token = await storage.get("access_token");
    if (!token) {
      const msg = "Você precisa estar logado para cadastrar produtos.";
      if (Platform.OS === 'web') { window.alert(msg); } else { Alert.alert("Autenticação", msg); }
      return;
    }

    setSalvando(true);
    try {
      let finalImageUrl = fotoPersonalizada;
      if (fotoPersonalizada && !fotoPersonalizada.startsWith("http")) {
        finalImageUrl = await uploadImage(fotoPersonalizada, "produtos");
      }

      if (editandoId) {
        await produtosService.atualizarProduto(editandoId, {
          preco: parseFloat(novoValor.replace(/\./g, "").replace(",", ".")),
          estoque: parseInt(novoQuantidade),
          unidade_medida: unidadeMedida,
          imagem_url: finalImageUrl,
        });
        const msg = "Produto atualizado!";
        if (Platform.OS === 'web') { window.alert(msg); } else { Alert.alert("Sucesso", msg); }
      } else {
        await produtosService.cadastrarProduto({
          produto_id: produtoSelecionado.id,
          preco: parseFloat(novoValor.replace(/\./g, "").replace(",", ".")),
          estoque: parseInt(novoQuantidade),
          imagem_url: finalImageUrl,
          unidade_medida: unidadeMedida,
        } as any);
        const msg = "Produto adicionado!";
        if (Platform.OS === 'web') { window.alert(msg); } else { Alert.alert("Sucesso", msg); }
      }

      setModalAberto(false);
      resetForm();
      carregarDados();
    } catch (error: any) {
      console.error("Erro ao salvar produto:", error, {
        status: error?.response?.status,
        data: error?.response?.data,
      });
      const detail = error?.response?.data?.detail;
      let errStr = "Não foi possível salvar o produto.";
      if (typeof detail === 'string') {
        errStr = detail;
      } else if (Array.isArray(detail)) {
        errStr = detail.map((d: any) => d.msg || "Erro").join(", ");
      } else if (error.message) {
        errStr = error.message;
      }
      if (Platform.OS === 'web') { window.alert(errStr); } else { Alert.alert("Erro", errStr); }
    } finally {
      setSalvando(false);
    }
  };

  const resetForm = () => {
    setEditandoId(null);
    setProdutoSelecionado(null);
    setFotoPersonalizada(null);
    setNovoValor("");
    setNovoQuantidade("");
    setUnidadeMedida("un");
  };

  const produtosFiltrados = estoque.filter((item) =>
    item?.produto_nome?.toLowerCase().includes(pesquisa.toLowerCase()),
  );

  if (loading) {
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
    <View style={styles.container}>
      <StatusBar style="dark" />

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
            source={require("@/assets/images/logo.svg")}
            style={{ width: 35, height: 35 }}
            contentFit="contain"
          />
          <Text style={styles.logoText}>uitanda.com</Text>
        </TouchableOpacity>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Meus Produtos</Text>
        <View style={styles.searchHeader}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar..."
              value={pesquisa}
              onChangeText={setPesquisa}
            />
          </View>
          <TouchableOpacity style={styles.addButton} onPress={abrirNovo}>
            <Ionicons name="add" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={produtosFiltrados}
          keyExtractor={(item) => item.produto_vendedor_id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="basket-outline" size={80} color="#E0E0E0" />
              <Text style={styles.emptyTitle}>Estoque Vazio</Text>
              <Text style={styles.emptySubtitle}>
                Clique no "+" para adicionar itens
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => abrirEdicao(item)}
            >
              <View style={styles.productImageContainer}>
                <Image
                  source={{
                    uri: item?.imagem_url || "https://via.placeholder.com/150",
                  }}
                  style={styles.productImage}
                  contentFit="cover"
                />
              </View>
              <View style={styles.quantityBadge}>
                <Text style={styles.quantityBadgeText}>
                  {item?.estoque || 0}
                  {item?.tipo_unidade || "un"}
                </Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>
                  {item?.produto_nome}
                </Text>
                <Text style={styles.productPrice}>
                  R${" "}
                  {(item?.preco || 0).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>
              <View style={styles.editBadge}>
                <Ionicons name="pencil" size={10} color="#FFF" />
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      <Modal visible={modalAberto} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.formContainer}>
            <View style={styles.modalHeaderTitleRow}>
              <Text style={styles.modalHeaderTitle}>
                {editandoId ? "Editar Produto" : "Novo Produto"}
              </Text>
              <TouchableOpacity onPress={() => setModalAberto(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.imageSelectorContainer}>
                <View style={styles.imageSelector}>
                  {fotoPersonalizada || produtoSelecionado?.imagem_url ? (
                    <Image
                      source={{
                        uri:
                          fotoPersonalizada || produtoSelecionado?.imagem_url,
                      }}
                      style={styles.imagePreview}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons
                        name="camera-outline"
                        size={40}
                        color="#2E7D32"
                      />
                      <Text style={styles.imagePlaceholderText}>
                        Foto do Produto
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.imageActionButtons}>
                  <TouchableOpacity
                    onPress={tirarFoto}
                    style={styles.imageActionBtn}
                  >
                    <Ionicons name="camera" size={20} color="#2E7D32" />
                    <Text style={styles.imageActionText}>Câmera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={escolherDaGaleria}
                    style={styles.imageActionBtn}
                  >
                    <Ionicons name="images" size={20} color="#1976D2" />
                    <Text style={styles.imageActionText}>Galeria</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.inputLabel}>Escolher Item</Text>
              <TouchableOpacity
                style={[styles.selectField, editandoId && { opacity: 0.6 }]}
                onPress={() => !editandoId && setModalSelecaoNome(true)}
                disabled={!!editandoId}
              >
                <Text
                  style={
                    produtoSelecionado
                      ? styles.selectText
                      : styles.placeholderText
                  }
                >
                  {produtoSelecionado?.nome || "Selecione na lista..."}
                </Text>
                {!editandoId && (
                  <Ionicons name="chevron-down" size={20} color="#666" />
                )}
              </TouchableOpacity>

                <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.inputLabel}>Preço (R$)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0,00"
                    keyboardType="numeric"
                    value={novoValor}
                    onChangeText={handleValorChange}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>
                    Estoque {produtoSelecionado?.tipo_unidade || unidadeMedida ? `(${produtoSelecionado?.tipo_unidade || unidadeMedida})` : ''}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="10"
                    keyboardType="numeric"
                    value={novoQuantidade}
                    onChangeText={setNovoQuantidade}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, salvando && { opacity: 0.7 }]}
                onPress={salvarProduto}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {editandoId ? "SALVAR ALTERAÇÕES" : "ADICIONAR"}
                  </Text>
                )}
              </TouchableOpacity>

              {editandoId && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={confirmarExclusao}
                  disabled={salvando}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF5252" />
                  <Text style={styles.deleteBtnText}>REMOVER PRODUTO</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalSelecaoNome}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.subModalOverlay}>
          <View style={styles.subModalContent}>
            <Text style={styles.subModalTitle}>Catálogo</Text>
            <FlatList
              data={produtosBase}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    console.debug("catalog selection pressed", { item });
                    setProdutoSelecionado(item);
                    setUnidadeMedida(item.tipo_unidade || 'un');
                    setModalSelecaoNome(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.nome}</Text>
                </TouchableOpacity>
              )}
              style={{ maxHeight: 400 }}
            />
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModalSelecaoNome(false)}
            >
              <Text style={styles.cancelBtnText}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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
  content: { flex: 1, padding: 20, paddingTop: 10 },
  logoRow: { flexDirection: "row", alignItems: "center" },
  logoText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#2E7D32",
    marginLeft: -2,
  },
  backButton: { padding: 5 },
  title: { fontSize: 24, fontWeight: "900", color: "#333", marginBottom: 5 },
  searchHeader: {
    flexDirection: "row",
    paddingVertical: 15,
    alignItems: "center",
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 18,
    borderRadius: 25,
    height: 48,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },
  addButton: {
    backgroundColor: "#2E7D32",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  listContent: { paddingVertical: 10, paddingBottom: 40 },
  productCard: {
    backgroundColor: "#FFF",
    width: width / 2 - 25,
    margin: 6,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    position: "relative",
  },
  productImageContainer: {
    width: "100%",
    height: 130,
    backgroundColor: "#f9f9f9",
  },
  productImage: { width: "100%", height: "100%" },
  quantityBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(46, 125, 50, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  quantityBadgeText: { color: "#FFF", fontSize: 11, fontWeight: "900" },
  editBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: { padding: 12 },
  productName: { fontWeight: "800", fontSize: 14, color: "#333" },
  productPrice: {
    color: "#2E7D32",
    fontWeight: "bold",
    marginTop: 6,
    fontSize: 15,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: "#999",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
  },
  emptySubtitle: {
    color: "#CCC",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  formContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 30, // Garante que preencha o final
    maxHeight: "95%",
    width: "100%",
  },
  modalHeaderTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalHeaderTitle: { fontSize: 20, fontWeight: "bold" },
  imageSelectorContainer: { marginBottom: 15 },
  imageSelector: {
    width: "100%",
    height: 200,
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 12,
  },
  imagePreview: { width: "100%", height: "100%" },
  imagePlaceholder: { alignItems: "center", padding: 20 },
  imagePlaceholderText: {
    color: "#2E7D32",
    fontWeight: "700",
    marginTop: 10,
    textAlign: "center",
  },
  imageActionButtons: { flexDirection: "row", gap: 10 },
  imageActionBtn: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#EEE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  imageActionText: { color: "#333", fontWeight: "bold", fontSize: 13 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 18,
    marginBottom: 8,
    color: "#444"
  },
  selectField: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  placeholderText: { color: "#999" },
  selectText: { color: "#333", fontWeight: "600" },
  input: {
    padding: 16,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
    fontSize: 16,
    color: "#333"
  },
  formRow: { flexDirection: "row", justifyContent: "space-between" },
  radioGroup: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  radioItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  radioItemSelected: { backgroundColor: "#E8F5E9", borderColor: "#2E7D32" },
  radioItemText: { color: "#555", fontWeight: "500" },
  radioItemTextSelected: { color: "#2E7D32", fontWeight: "800" },
  saveBtn: {
    backgroundColor: "#40C993",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 35,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  saveBtnText: { color: "#FFF", fontSize: 16, fontWeight: "900", letterSpacing: 0.5 },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    marginTop: 5,
    gap: 8,
  },
  deleteBtnText: { color: "#FF5252", fontWeight: "bold", fontSize: 14 },
  subModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 30,
  },
  subModalContent: { backgroundColor: "#FFF", borderRadius: 20, padding: 20 },
  subModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  optionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  optionText: { fontSize: 16, color: "#333", fontWeight: "500" },
  cancelBtn: { marginTop: 15, alignItems: "center", padding: 10 },
  cancelBtnText: { color: "#FF5252", fontWeight: "bold", letterSpacing: 1 },
});
