import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { supabase } from '../services/supabaseClient';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Login tradicional con Correo y Contraseña
  const handleEmailLogin = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      Alert.alert('Campos vacíos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        Alert.alert('Error de inicio de sesión', error.message);
        return;
      }

      console.log('¡Inicio de sesión tradicional exitoso!');
      // Aquí puedes navegar a tu pantalla principal (Home) si ya la tienes creada
    } catch (err) {
      Alert.alert('Error', 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Login con Google (SSO)
  const handleGoogleLogin = async () => {
    try {
      const redirectUrl = Linking.createURL('/auth/v1/callback');
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
        
        if (result.type === 'success' && result.url) {
          const parsedUrl = Linking.parse(result.url);
          const { access_token, refresh_token } = parsedUrl.queryParams || {};

          if (access_token && refresh_token) {
            await supabase.auth.setSession({
              access_token: access_token as string,
              refresh_token: refresh_token as string,
            });
            console.log('¡Inicio de sesión con Google exitoso!');
          }
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Ocurrió un error al intentar conectar con Google.');
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Iniciar sesión</Text>

        {/* Inputs para inicio tradicional */}
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

        {/* Botón de ingreso tradicional */}
        <View style={styles.buttonContainer}>
          <CustomButton
            title={loading ? 'Cargando...' : 'Ingresar'}
            variant="primary"
            onPress={handleEmailLogin}
          />
        </View>

        {/* Separador estético visual */}
        <Text style={styles.separatorText}>O también</Text>

        {/* Botón SSO Google */}
        <View style={styles.buttonContainer}>
          <CustomButton
            title="Continuar con Google"
            variant="secondary"
            onPress={handleGoogleLogin}
          />
        </View>

        {/* Enlace de navegación hacia la pantalla de Registro */}
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