import React, { useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import base64 from "react-native-base64";

import { useBluetooth } from "@/context/BluetoothContext";
import { styleMessage } from "../../Styles/messages";

export default function MessagesScreen() {
  // --- ACTUALIZADO: Importamos networkNodes desde el contexto global ---
  const { receivedMessages, connectedDevice, addMessage, networkNodes } =
    useBluetooth();

  const [inputText, setInputText] = useState("");

  // --- NUEVO: Estado para rastrear a qué nodo destino se enviará el paquete ("broadcast" por defecto) ---
  const [selectedTarget, setSelectedTarget] = useState("broadcast");

  const handleSend = async () => {
    if (!inputText.trim()) return;

    if (!connectedDevice) {
      Alert.alert(
        "Desconectado",
        "Conéctate a un ESP32 desde la pantalla de Inicio primero.",
      );
      return;
    }

    try {
      // --- ACTUALIZADO: El parámetro 'to' ahora toma dinámicamente el ID del nodo seleccionado ---
      const payload = {
        cmd: "send",
        text: inputText.trim(),
        to: selectedTarget, // Enviará "broadcast" o el ID único del nodo destino (ej: "aabbccddeeff")
        sos: false,
      };

      const jsonString = JSON.stringify(payload);
      const utf8String = unescape(encodeURIComponent(jsonString));
      const mensajeBase64 = base64.encode(utf8String);

      await connectedDevice.writeCharacteristicWithResponseForService(
        "4fafc201-1fb5-459e-8fcc-c5c9c331914b",
        "beb5483e-36e1-4688-b7f5-ea07361b26a8",
        mensajeBase64,
      );

      // Buscamos el nombre legible del nodo seleccionado para mostrarlo en el historial del chat local
      const targetNode = networkNodes.find((n) => n.id === selectedTarget);
      const destinationLabel =
        selectedTarget === "broadcast"
          ? "Todos"
          : targetNode?.name || selectedTarget;

      // Agregamos un prefijo visual en el chat local para saber a quién se lo mandamos
      addMessage("Yo", `[Para: ${destinationLabel}] ${inputText.trim()}`);
      setInputText("");
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
        <Text style={styleMessage.lastMessage} numberOfLines={10}>
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styleMessage.container, { flex: 1 }]}>
        <Text style={styleMessage.mainTitle}>Chat de la Red Mesh</Text>

        {/* ZONA DE MENSAJES */}
        {receivedMessages.length === 0 ? (
          <View style={styleMessage.emptyContainer}>
            <Text style={styleMessage.emptyText}>
              No hay mensajes aún. ¡Escribe algo!
            </Text>
          </View>
        ) : (
          <FlatList
            data={receivedMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />
        )}

        {/* --- NUEVO: Selector Horizontal de Destinatarios (Manejo de Multisalto) --- */}
        <View
          style={{
            backgroundColor: "#f0f0f0",
            paddingVertical: 8,
            paddingHorizontal: 10,
            borderTopWidth: 1,
            borderColor: "#e0e0e0",
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "bold",
              color: "#555",
              marginBottom: 5,
            }}
          >
            Destinatario:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {/* Opción Broadcast */}
            <TouchableOpacity
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 15,
                backgroundColor:
                  selectedTarget === "broadcast" ? "#2196F3" : "#fff",
                marginRight: 8,
                borderWidth: 1,
                borderColor:
                  selectedTarget === "broadcast" ? "#2196F3" : "#ccc",
              }}
              onPress={() => setSelectedTarget("broadcast")}
            >
              <Text
                style={{
                  color: selectedTarget === "broadcast" ? "#fff" : "#333",
                  fontSize: 12,
                  fontWeight: "500",
                }}
              >
                📢 Todos (Broadcast)
              </Text>
            </TouchableOpacity>

            {/* Mapeo de la lista de nodos descubiertos por el ESP32 */}
            {networkNodes.map((nodo) => (
              <TouchableOpacity
                key={nodo.id}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 15,
                  backgroundColor:
                    selectedTarget === nodo.id ? "#2196F3" : "#fff",
                  marginRight: 8,
                  borderWidth: 1,
                  borderColor: selectedTarget === nodo.id ? "#2196F3" : "#ccc",
                }}
                onPress={() => setSelectedTarget(nodo.id)}
              >
                <Text
                  style={{
                    color: selectedTarget === nodo.id ? "#fff" : "#333",
                    fontSize: 12,
                    fontWeight: "500",
                  }}
                >
                  📱 {nodo.name} ({nodo.hops}{" "}
                  {nodo.hops === 1 ? "salto" : "saltos"})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ZONA: INPUT Y BOTÓN DE ENVIAR */}
        <View
          style={{
            flexDirection: "row",
            padding: 10,
            borderTopWidth: 1,
            borderColor: "#e0e0e0",
            backgroundColor: "#f9f9f9",
            alignItems: "center",
          }}
        >
          <TextInput
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 25,
              paddingHorizontal: 15,
              paddingVertical: 10,
              marginRight: 10,
              backgroundColor: "#fff",
              maxHeight: 100,
            }}
            placeholder={
              selectedTarget === "broadcast"
                ? "Escribe un mensaje a toda la red..."
                : "Escribe un mensaje privado..."
            }
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={{
              backgroundColor: "#28a745",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 25,
            }}
            onPress={handleSend}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
