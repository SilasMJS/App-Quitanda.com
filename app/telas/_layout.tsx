import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * CustomDrawerContent - Componente personalizado para o conteúdo do menu lateral.
 * Exibe o perfil do usuário e o botão de logout.
 */
function CustomDrawerContent(props: any) {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        {/* Cabeçalho do Perfil no Menu */}
        <View style={styles.userProfile}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>S</Text>
          </View>
          <View>
            <Text style={styles.userName}>Silas</Text>
            <Text style={styles.userRole}>Vendedor Parceiro</Text>
          </View>
        </View>

        {/* Lista de itens de navegação padrão */}
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Botão de Sair fixo no rodapé do menu */}
      <View style={styles.logoutContainer}>
        <DrawerItem
          label="Sair da Conta"
          inactiveTintColor="#FF5252"
          labelStyle={{ fontWeight: '600' }}
          icon={({ color, size }) => <Ionicons name="log-out-outline" size={size} color="#FF5252" />}
          onPress={() => {
            // Volta para a tela de login limpando o histórico
            router.replace('/');
          }}
        />
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={require('@/assets/images/Group 2.svg')}
                style={{ width: 30, height: 30, marginRight: 8 }}
                contentFit="contain"
              />
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2E7D32' }}>
                Quitanda.com
              </Text>
            </View>
          ),
          headerTitleAlign: 'left',
          drawerActiveTintColor: '#2E7D32',
          headerShown: true,
          headerTitleContainerStyle: {
            marginLeft: -10,
          },
        }}
        initialRouteName="dashboard"
      >
        <Drawer.Screen
          name="dashboard"
          options={{
            drawerLabel: 'Início',
            title: 'Início',
            drawerIcon: ({ color }) => <Ionicons name="home-outline" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="produtos"
          options={{
            drawerLabel: 'Meu Estoque',
            title: 'Estoque',
            drawerIcon: ({ color }) => <Ionicons name="leaf-outline" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="postagens"
          options={{
            drawerLabel: 'Postagens (Feed)',
            title: 'Vitrine Social',
            drawerIcon: ({ color }) => <Ionicons name="camera-outline" size={22} color={color} />,
          }}
        />
        <Drawer.Screen
          name="pagamentos"
          options={{
            drawerLabel: 'Pagamentos',
            title: 'Pagamentos',
            drawerIcon: ({ color }) => <Ionicons name="cash-outline" size={22} color={color} />,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  userProfile: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginBottom: 10,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarInitial: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userRole: {
    fontSize: 12,
    color: '#666',
  },
  logoutContainer: {
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
});
