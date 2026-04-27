import React, { useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import base64 from 'react-native-base64';

import { useBluetooth } from '@/context/BluetoothContext';
import { styleMessage } from '../../Styles/messages';

export default function MessagesScreen() {
  const { receivedMessages, connectedDevice, addMessage } = useBluetooth();
  
  // Nuevo estado para guardar lo que el usuario está escribiendo
  const [inputText, setInputText] = useState('');

  // --- NUEVA FUNCIÓN: Enviar mensaje directamente desde el chat ---
  const handleSend = async () => {
    // Si el texto está vacío, no hacemos nada
    if (!inputText.trim()) return;

    if (!connectedDevice) {
      Alert.alert("Desconectado", "Conéctate a un ESP32 desde la pantalla de Inicio primero.");
      return;
    }

    try {
      // 1. Armamos el JSON para la Mesh
      const payload = {
        cmd: "send",
        text: inputText.trim(),
        to: "broadcast", 
        sos: false
      };

      // 2. Convertimos a String y codificamos a Base64
      const jsonString = JSON.stringify(payload);
      const mensajeBase64 = base64.encode(jsonString);

      // 3. Enviamos usando el UUID de Transmisión (TX) que termina en 8
      await connectedDevice.writeCharacteristicWithResponseForService(
        "4fafc201-1fb5-459e-8fcc-c5c9c331914b", 
        "beb5483e-36e1-4688-b7f5-ea07361b26a8", 
        mensajeBase64
      );
      
      // 4. Lo mostramos en nuestra pantalla
      addMessage("Yo", inputText.trim());
      
      // 5. Limpiamos la caja de texto
      setInputText('');

    } catch (error) {
      Alert.alert("Error", "No se pudo enviar el mensaje.");
      console.error("Error al enviar desde el chat:", error);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styleMessage.chatItem}>
      <View style={styleMessage.avatar}>
        <Text style={styleMessage.avatarText}>{item.sender[0]}</Text>
      </View>
      <View style={styleMessage.chatContent}>
        <View style={styleMessage.chatHeader}>
          <Text style={styleMessage.senderName}>{item.sender}</Text>
          <Text style={styleMessage.timeText}>{item.time}</Text>
        </View>
        <Text style={styleMessage.lastMessage} numberOfLines={10}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styleMessage.container, { flex: 1 }]}>
        <Text style={styleMessage.mainTitle}>Chat de la Red Mesh</Text>
        
        {/* ZONA DE MENSAJES */}
        {receivedMessages.length === 0 ? (
          <View style={styleMessage.emptyContainer}>
            <Text style={styleMessage.emptyText}>No hay mensajes aún. ¡Escribe algo!</Text>
          </View>
        ) : (
          <FlatList
            data={receivedMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            // inverted // <-- Descomenta esta línea si quieres que los mensajes nuevos salgan abajo del todo (como WhatsApp)
          />
        )}

        {/* NUEVA ZONA: INPUT Y BOTÓN DE ENVIAR */}
        <View style={{ 
          flexDirection: 'row', 
          padding: 10, 
          borderTopWidth: 1, 
          borderColor: '#e0e0e0', 
          backgroundColor: '#f9f9f9',
          alignItems: 'center'
        }}>
          <TextInput
            style={{ 
              flex: 1, 
              borderWidth: 1, 
              borderColor: '#ccc', 
              borderRadius: 25, 
              paddingHorizontal: 15, 
              paddingVertical: 10, 
              marginRight: 10,
              backgroundColor: '#fff',
              maxHeight: 100 // Por si escriben un testamento
            }}
            placeholder="Escribe un mensaje..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={{ 
              backgroundColor: '#28a745', 
              justifyContent: 'center', 
              alignItems: 'center', 
              paddingHorizontal: 20, 
              paddingVertical: 12,
              borderRadius: 25 
            }}
            onPress={handleSend}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}