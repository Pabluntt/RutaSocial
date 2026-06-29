import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';

interface InitialScreenProps {
  navigation: NavigationProp<any>;
}

const InitialScreen = ({ navigation }: InitialScreenProps) => {
  const handleLogoPress = () => {
    Linking.openURL('https://www.hogardecristo.cl');
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.innerContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logoHdc.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Image
            source={require('../../assets/LogoOficial.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity onPress={handleLogoPress}>
          <Text style={styles.title}>Bienvenido a RED CALLE</Text>
        </TouchableOpacity>

        <Text style={styles.subtitle}>Hecho con ❤️ por DevSync</Text>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Iniciar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#0F9997',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    backgroundColor: '#B2DFDB',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  logoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  logoSmall: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#004D40',
  },
  startButton: {
    backgroundColor: '#FF5A00',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#00796B',
    marginBottom: 20,
  },
  logoContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 20, 
  marginBottom: 30,
},
logoImage: {
  width: 120,
  height: 120,
},
});

export default InitialScreen;
