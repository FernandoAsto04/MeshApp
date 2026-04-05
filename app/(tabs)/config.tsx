import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styleConfig } from '../../Styles/config';

export default function ConfigScreen() {
  // 1. Creamos los estados para todos los campos
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [celular, setCelular] = useState('');
  const [mensaje, setMensaje] = useState('');

  // 2. Efecto para cargar TODOS los datos guardados al abrir la pantalla
  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedName = await SecureStore.getItemAsync('user_name');
        const savedDni = await SecureStore.getItemAsync('user_dni');
        const savedCelular = await SecureStore.getItemAsync('user_celular');
        const savedMensaje = await SecureStore.getItemAsync('user_mensaje');

        if (savedName) setNombre(savedName);
        if (savedDni) setDni(savedDni);
        if (savedCelular) setCelular(savedCelular);
        if (savedMensaje) setMensaje(savedMensaje);
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      }
    };

    loadSavedData();
  }, []);

  // 3. Función unificada para guardar todos los campos a la vez
  const handleSaveAll = async () => {
    if (nombre.trim() === '') {
      Alert.alert('Ojo', 'El nombre no puede estar vacío.');
      return;
    }

    try {
      // Guardamos cada campo con su propia llave en el almacenamiento seguro
      await SecureStore.setItemAsync('user_name', nombre);
      await SecureStore.setItemAsync('user_dni', dni);
      await SecureStore.setItemAsync('user_celular', celular);
      await SecureStore.setItemAsync('user_mensaje', mensaje);
      
      Alert.alert('¡Éxito!', 'Tus datos han sido guardados permanentemente.');
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al guardar tus datos.');
      console.error('Error al guardar:', error);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styleConfig.container}
    >
      {/* ScrollView permite deslizar la pantalla si el teclado tapa los campos de abajo */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styleConfig.headerTitle}>Ajustes del Sistema</Text>

        {/* PRIMER CUADRO: Datos Personales (Nombre, DNI, Celular) */}
        <View style={styleConfig.card}>
          <Text style={styleConfig.sectionTitle}>Perfil de Usuario</Text>

          <Text style={styleConfig.label}>Nombre:</Text>
          <TextInput
            style={styleConfig.input}
            placeholder="Escribe tu nombre..."
            placeholderTextColor="#999"
            value={nombre}
            onChangeText={setNombre}
            maxLength={30}
          />

          <Text style={styleConfig.label}>DNI:</Text>
          <TextInput
            style={styleConfig.input}
            placeholder="Ej: 12345678"
            placeholderTextColor="#999"
            value={dni}
            onChangeText={setDni}
            keyboardType="numeric" // Fuerza el teclado numérico
            maxLength={8}
          />

          <Text style={styleConfig.label}>Celular:</Text>
          <TextInput
            style={styleConfig.input}
            placeholder="Ej: 987654321"
            placeholderTextColor="#999"
            value={celular}
            onChangeText={setCelular}
            keyboardType="numeric" // Fuerza el teclado numérico
            maxLength={9}
          />
        </View>
        
        {/* SEGUNDO CUADRO: Mensaje Rápido */}
        <View style={styleConfig.card}>
          <Text style={styleConfig.sectionTitle}>Configuración Adicional</Text>

          <Text style={styleConfig.label}>Mensaje Rápido:</Text>
          <TextInput
            style={styleConfig.input}
            placeholder="Ej: Necesito ayuda urgente..."
            placeholderTextColor="#999"
            value={mensaje}
            onChangeText={setMensaje}
            maxLength={100}
            multiline={true} // Permite que el texto baje a una segunda línea si es largo
          />
        </View>

        {/* BOTÓN DE GUARDADO: Lo sacamos de los cuadros para que guarde todo de un golpe */}
        <TouchableOpacity style={styleConfig.saveButton} onPress={handleSaveAll}>
          <Text style={styleConfig.saveButtonText}>Guardar Todos los Cambios</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}