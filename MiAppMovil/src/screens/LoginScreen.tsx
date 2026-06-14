import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { supabase } from '../services/supabaseClient';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

// Asegúrate de recibir el prop 'navigation' en tu componente de la pantalla
const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos vacíos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error de Inicio de Sesión', error.message);
      return;
    }
  
    if (data.user) {
      navigation.navigate('MainTabs'); 
    }
  };

  const handleGoogleLogin = async () => {
  try {
    
    const redirectUrl = Linking.createURL('/auth/v1/callback');
    console.log("URL de redirección para Expo:", redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      Alert.alert('Error de autenticación', error.message);
      return;
    }

    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
      
      //Si el navegador se cierra con éxito ('success'), procesamos la URL de regreso
      if (result.type === 'success' && result.url) {
        
        const parsedUrl = Linking.parse(result.url);
        const { access_token, refresh_token } = parsedUrl.queryParams || {};

        if (access_token && refresh_token) {
          // Le inyectamos los tokens manualmente al cliente de Supabase en la app
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: access_token as string,
            refresh_token: refresh_token as string,
          });

          if (sessionError) {
            Alert.alert('Error al crear sesión', sessionError.message);
            return;
          }

          console.log('¡Inicio de sesión con Google exitoso!');
          
          navigation.navigate('MainTabs');
        } else {
          const extractToken = (url: string, key: string) => {
            const matches = url.match(new RegExp(`${key}=([^&]*)`));
            return matches ? matches[1] : null;
          };

          const hashToken = extractToken(result.url, 'access_token');
          const hashRefresh = extractToken(result.url, 'refresh_token');

          if (hashToken && hashRefresh) {
            await supabase.auth.setSession({
              access_token: hashToken,
              refresh_token: hashRefresh,
            });
            navigation.navigate('MainTabs');
          } else {
            Alert.alert('Error', 'No se pudieron recuperar los tokens de inicio de sesión.');
          }
        }
      }
    }
  } catch (err) {
    Alert.alert('Error', 'Ocurrió un error inesperado al conectar con Google.');
  }
};

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Iniciar sesión</Text>

    
        <CustomInput
          placeholder="Correo electrónico"
          value={email}
          onChange={setEmail}
          type="email"
        />

        <CustomInput
          placeholder="Contraseña"
          value={password}
          onChange={setPassword}
          type="password"
        />

     
        <View style={styles.buttonContainer}>
          <CustomButton
            title={loading ? 'Cargando...' : 'Ingresar'}
            variant="primary"
            onPress={handleEmailLogin}
          />
        </View>


        <Text style={styles.separatorText}>O también</Text>

  
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Continuar con Google"
            variant="secondary"
            onPress={handleGoogleLogin}
          />
        </View>

        <TouchableOpacity 
          style={styles.registerLink} 
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>
            ¿No tienes cuenta? <Text style={styles.registerTextBold}>Regístrate aquí</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#ffffff', // Letras blancas para el modo oscuro
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  separatorText: {
    color: '#aaaaaa',
    textAlign: 'center',
    marginVertical: 12,
    fontSize: 14,
  },
  registerLink: {
    marginTop: 25,
    alignItems: 'center',
  },
  registerText: {
    color: '#ffffff',
    fontSize: 14,
  },
  registerTextBold: {
    fontWeight: 'bold',
    color: '#4dabf7', // Color azul suave llamativo para resaltar el link
  },
});

export default LoginScreen;