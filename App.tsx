/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './src/app/navigation/types';
import Home from './src/app/screens/Home';
import EstimativaSalario from './src/app/screens/EstimativaSalario';
import PreenchimentoMensal from './src/app/screens/PreenchimentoMensal';
import RegistrarFalta from './src/app/screens/RegistrarFalta';
import RegistrarSubstituicao from './src/app/screens/RegistrarSubstituicao';
import VerificarInformacoes from './src/app/screens/VerificarInformacoes';

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const WhiteTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#ffffff',
      card: '#ffffff',
    },
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer theme={WhiteTheme}>
        <Stack.Navigator
          screenOptions={{
            animation: 'fade',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: '#ffffff' },
            headerTitleStyle: { color: '#222', fontWeight: '600' },
            headerTitle: '',
            headerTintColor: '#007AFF',
            contentStyle: { backgroundColor: '#ffffff' },
          }}
        >
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="EstimativaSalario" component={EstimativaSalario} options={{ headerShown: false }} />
          <Stack.Screen name="PreenchimentoMensal" component={PreenchimentoMensal} options={{ headerShown: false }} />
          <Stack.Screen name="RegistrarFalta" component={RegistrarFalta} options={{ headerShown: false }} />
          <Stack.Screen name="RegistrarSubstituicao" component={RegistrarSubstituicao} options={{ headerShown: false }} />
          <Stack.Screen name="VerificarInformacoes" component={VerificarInformacoes} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
