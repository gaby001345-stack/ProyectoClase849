import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen"; // 👈 1. IMPORTAR LA PANTALLA
import TabNavigator from "./TabsNavigator";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import { useTheme } from "../contexts/ThemeContext";

// 1. Declarar tipado para pantallas y sus parámetros
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  ProductDetail: { productId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function StackNavigator() {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ 
        headerShown: true,
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTintColor: colors.headerText
      }}
    >
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