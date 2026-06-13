import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { supabase } from '../services/supabaseClient'; 

const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); 

  const handleRegister = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();
    const cleanName = name.trim();
    const cleanPhone = phoneNumber.trim();

    // Validación previa (Actividad 2)
    if (!cleanName || !cleanPhone || !cleanEmail || !cleanPassword) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            full_name: cleanName,
            phone_number: cleanPhone,
          },
        },
      });

      if (error) {
        Alert.alert('Error al registrarse', error.message);
        return;
      }

      if (data.user) {
        Alert.alert(
          '¡Registro exitoso!',
          'Tu cuenta fue creada correctamente.',
          [
            {
              text: 'Iniciar sesión',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      }
    } catch (err) {
      Alert.alert('Error', 'Ocurrió un problema inesperado en el servidor.');
    } finally { 
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Crear cuenta</Text>

        <CustomInput
          placeholder="Nombre completo"
          value={name}
          onChange={setName}
        />

        <CustomInput
          placeholder="Número de teléfono"
          value={phoneNumber}
          onChange={setPhoneNumber}
          type="number"
        />

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
            title={loading ? 'Registrando...' : 'Registrarse'}
            variant="primary"
            onPress={handleRegister}
          />
        </View>
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
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
});

export default RegisterScreen;