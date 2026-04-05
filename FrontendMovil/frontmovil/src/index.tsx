import { createTheme, ThemeProvider } from '@rneui/themed';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootStackNavigation from './navigation/RootStack';
import Toast from 'react-native-toast-message'; 

const theme = createTheme({
  lightColors: {
    primary: 'red',
    background: '#fff',
  },
  darkColors: {
    primary: 'blue',
    background: '#121212',
  },
  components: {
    Button: {
      color: 'primary',
    },
  },
});

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <RootStackNavigation />
        <Toast /> 
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;