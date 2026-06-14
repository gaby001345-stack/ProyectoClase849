import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import TabNavigator from "./TabsNavigator";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import { useTheme } from "../contexts/ThemeContext";
import { supabase } from "../services/supabaseClient";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  ProductDetail: { productId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  const { colors } = useTheme();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Mientras Supabase lee el almacenamiento del iPhone, muestra un indicador de carga
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.headerBackground }}>
        <ActivityIndicator size="large" color={colors.headerText} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      // Si hay sesión, arranca directo en las pestañas principales. Si no, va al Login.
      initialRouteName={session ? "MainTabs" : "Login"}
      screenOptions={{ 
        headerShown: true,
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTintColor: colors.headerText
      }}
    >
      {!session ? (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "Skincare Tracker" }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: "Crear Cuenta" }}
          />
        </>
      ) : null}

      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: "Detalle del producto" }}
      />
    </Stack.Navigator>
  );
}