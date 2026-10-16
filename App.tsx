import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

import { PetProvider } from './src/PetContext';
import HomeScreen from './src/screens/HomeScreen';
import PhotosScreen from './src/screens/PhotosScreen';
import VetScreen from './src/screens/VetScreen';
import WalksScreen from './src/screens/WalksScreen';
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();

const icons: Record<string, [string, string]> = {
  Inicio: ['paw', 'paw-outline'],
  Fotos: ['images', 'images-outline'],
  Veterinaria: ['medkit', 'medkit-outline'],
  Paseos: ['walk', 'walk-outline'],
};

export default function App() {
  return (
    <PetProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          initialRouteName="Inicio"
          screenOptions={({ route }) => ({
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: '#fff',
            headerTitleAlign: 'center',
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.muted,
            tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
            tabBarStyle: { height: Platform.OS === 'ios' ? 88 : 64, paddingTop: 6 },
            tabBarIcon: ({ color, size, focused }) => {
              const [on, off] = icons[route.name];
              return <Ionicons name={(focused ? on : off) as any} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Inicio" component={HomeScreen} options={{ title: 'Mi Peludito' }} />
          <Tab.Screen name="Fotos" component={PhotosScreen} options={{ title: 'Álbum de fotos' }} />
          <Tab.Screen name="Veterinaria" component={VetScreen} options={{ title: 'Visitas al veterinario' }} />
          <Tab.Screen name="Paseos" component={WalksScreen} options={{ title: 'Paseos diarios' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </PetProvider>
  );
}