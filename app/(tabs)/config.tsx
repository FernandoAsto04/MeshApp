import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styleConfig } from './Styles/config';

export default function ConfigScreen() {
  // 1. La "memoria" de nuestra pantalla
  // 'userName' es el nombre oficial actual. 'newName' es lo que el usuario está escribiendo.
  const [userName, setUserName] = useState('Usuario Destacado');
  const [newName, setNewName] = useState('');

  // 2. Función para guardar los cambios
  const handleSaveName = () => {
    // Evitamos que el usuario guarde un nombre en blanco
    if (newName.trim() === '') {
      Alert.alert('Ojo', 'El nombre no puede estar vacío.');
      return;
    }

    // Actualizamos el nombre oficial y limpiamos la cajita de texto
    setUserName(newName);
    setNewName('');
    Alert.alert('¡Éxito!', 'Tu nombre de usuario ha sido actualizado.');
  };

  return (
    // KeyboardAvoidingView ayuda a que el teclado del celular no tape la cajita de texto
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styleConfig.container}
    >
      <Text style={styleConfig.headerTitle}>Ajustes del Sistema</Text>

      {/* Tarjeta de Perfil */}
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
          maxLength={20} // Límite de letras para que no rompa el diseño
        />

        <TouchableOpacity style={styleConfig.saveButton} onPress={handleSaveName}>
          <Text style={styleConfig.saveButtonText}>Guardar Cambios</Text>
        </TouchableOpacity>
      </View>
      
    </KeyboardAvoidingView>
  );
}