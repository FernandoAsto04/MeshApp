import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
// 1. Importamos SecureStore en lugar de AsyncStorage
import * as SecureStore from 'expo-secure-store';
import { styleConfig } from '../../Styles/config';

export default function ConfigScreen() {
  const [userName, setUserName] = useState('Usuario Destacado');
  const [newName, setNewName] = useState('');

  // 2. Efecto para cargar el nombre guardado usando SecureStore
  useEffect(() => {
    const loadSavedName = async () => {
      try {
        // Usamos getItemAsync y una llave sin el '@' por compatibilidad
        const savedName = await SecureStore.getItemAsync('user_name');
        if (savedName !== null) {
          setUserName(savedName);
        }
      } catch (error) {
        console.error('Error al cargar el nombre de usuario:', error);
      }
    };

    loadSavedName();
  }, []);

  // 3. Función asíncrona para guardar con SecureStore
  const handleSaveName = async () => {
    if (newName.trim() === '') {
      Alert.alert('Ojo', 'El nombre no puede estar vacío.');
      return;
    }

    try {
      // Usamos setItemAsync para guardar el dato encriptado
      await SecureStore.setItemAsync('user_name', newName);
      
      setUserName(newName);
      setNewName('');
      Alert.alert('¡Éxito!', 'Tu nombre de usuario ha sido guardado permanentemente.');
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al guardar tu nombre.');
      console.error('Error al guardar el nombre:', error);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styleConfig.container}
    >
      <Text style={styleConfig.headerTitle}>Ajustes del Sistema</Text>

      <View style={styleConfig.card}>
        <Text style={styleConfig.sectionTitle}>Perfil de Usuario</Text>
        
        <Text style={styleConfig.label}>Nombre actual:</Text>
        <Text style={styleConfig.currentName}>{userName}</Text>

        <Text style={styleConfig.label}>Cambiar nombre:</Text>
        <TextInput
          style={styleConfig.input}
          placeholder="Escribe tu nuevo nombre..."
          placeholderTextColor="#999"
          value={newName}
          onChangeText={setNewName}
          maxLength={20}
        />

        <TouchableOpacity style={styleConfig.saveButton} onPress={handleSaveName}>
          <Text style={styleConfig.saveButtonText}>Guardar Cambios</Text>
        </TouchableOpacity>
      </View>
      
    </KeyboardAvoidingView>
  );
}