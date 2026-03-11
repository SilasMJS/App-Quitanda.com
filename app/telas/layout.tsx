import {Drawer} from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function DrawerLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer screenOptions={{ headerTitle: 'Quitanda Pro' }}>
                <Drawer.Screen 
                name="dashboard" 
                options={{ drawerLabel: 'Início',
                    title: 'Painel de Controle',
                }} />
                <Drawer.Screen
                name = "produtos"
                options={{ drawerLabel: 'Estoque',
                    title: 'Gerenciar Produtos',
                }} />

                </Drawer>
        </GestureHandlerRootView>
    );
}