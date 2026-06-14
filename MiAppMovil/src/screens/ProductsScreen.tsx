import React, { useState, useEffect } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { supabase } from '../services/supabaseClient';

// Tipo para un producto
type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  created_at: string;
};

const CATEGORIES = ['Limpiador', 'Tónico', 'Sérum', 'Hidratante', 'Protector Solar'];

const ProductsScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // ─── GET Products ───────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      //Obtenemos el usuario que tiene la sesión activa en el celular
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log("No se pudo obtener el usuario para cargar productos.");
        return;
      }

      //Traemos únicamente los productos cuyo user_id coincida con el mío
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      if (data) {
        setProducts(data);
      }
    } catch (err) {
      console.log("Error inesperado al cargar productos:", err);
    }
  };

  // Carga los productos al montar el componente
  useEffect(() => {
    fetchProducts();
  }, []);

  // ─── CREATE Product ─────────────────────────────────────────
  const handleAddProduct = async () => {
    if (!name.trim() || !brand.trim()) {
      Alert.alert('Campos incompletos', 'Nombre y marca son obligatorios.');
      return;
    }

    setLoading(true);

    try {
    //Obtener de forma segura el usuario que tiene la sesión activa
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert('Error', 'No se pudo verificar la sesión del usuario.');
        setLoading(false);
        return;
      }

      //Insertar el producto asociándolo a su user_id
      const { error } = await supabase
        .from('products')
        .insert([{
          name: name.trim(),
          brand: brand.trim(),
          category,
          user_id: user.id,
        }])
        .select();

      if (error) {
        Alert.alert('Error al guardar', error.message);
        return;
      }

      setName('');
      setBrand('');
      setCategory(CATEGORIES[0]);
      setShowForm(false);
      fetchProducts();

    } catch (err) {
      Alert.alert('Error inesperado', 'Ocurrió un problema al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Render de cada producto ─────────────────────────────────
  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productBrand}>{item.brand}</Text>
      <Text style={styles.productCategory}>{item.category}</Text>
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          style={styles.list}
          
          ListHeaderComponent={
            <View style={{ gap: 16, marginBottom: 16 }}>
              <Text style={styles.title}>Mis Productos</Text>

              <CustomButton
                title={showForm ? 'Cancelar' : '+ Agregar Producto'}
                variant="primary"
                onPress={() => setShowForm(!showForm)}
              />

              {showForm && (
                <View style={styles.form}>
                  <CustomInput
                    placeholder="Nombre del producto"
                    value={name}
                    onChange={setName}
                  />

                  <CustomInput
                    placeholder="Marca"
                    value={brand}
                    onChange={setBrand}
                  />

                  <CustomInput
                    placeholder="Categoría"
                    value={category}
                    onChange={setCategory}
                  />

                  <CustomButton
                    title={loading ? 'Guardando...' : 'Guardar Producto'}
                    variant="primary"
                    onPress={handleAddProduct}
                  />
                </View>
              )}
            </View>
          }

          ListEmptyComponent={
            !showForm ? (
              <Text style={styles.empty}>No hay productos aún.</Text>
            ) : null
          }
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: "#5b8def"
  },
  form: {
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  list: {
    marginTop: 8,
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productBrand: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  productCategory: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  empty: {
    textAlign: 'center',
    color: '#aaa',
    marginTop: 40,
    fontSize: 16,
  },
});

export default ProductsScreen;