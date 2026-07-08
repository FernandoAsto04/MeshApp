import { Ionicons } from "@expo/vector-icons";
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
  const {
    receivedMessages,
    connectedDevice,
    addMessage,
    meshNodes,
    selectedRecipient,
    setSelectedRecipient,
  } = useBluetooth();

  const [inputText, setInputText] = useState("");

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
      let payload: any;

      // Armamos el JSON según el formato que espera el Arduino
      if (selectedRecipient === "broadcast") {
        payload = {
          cmd: "broadcast",
          text: inputText.trim(),
          sos: false,
        };
      } else {
        payload = {
          cmd: "send",
          to: selectedRecipient,
          text: inputText.trim(),
          sos: false,
        };
      }

      const jsonString = JSON.stringify(payload);
      const utf8String = unescape(encodeURIComponent(jsonString));
      const mensajeBase64 = base64.encode(utf8String);

      await connectedDevice.writeCharacteristicWithResponseForService(
        "4fafc201-1fb5-459e-8fcc-c5c9c331914b",
        "beb5483e-36e1-4688-b7f5-ea07361b26a8",
        mensajeBase64,
      );

      addMessage("Yo", inputText.trim());
      setInputText("");
    } catch (error) {
      Alert.alert("Error", "No se pudo enviar el mensaje.");
      console.error("Error al enviar desde el chat:", error);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const senderName = item.sender || "Mesh";
    const initial = senderName.charAt(0).toUpperCase();

    return (
      <View style={styleMessage.chatItem}>
        <View style={styleMessage.avatar}>
          <Text style={styleMessage.avatarText}>{initial}</Text>
        </View>
        <View style={styleMessage.chatContent}>
          <View style={styleMessage.chatHeader}>
            <Text style={styleMessage.senderName}>{senderName}</Text>
            <Text style={styleMessage.timeText}>{item.time || ""}</Text>
          </View>
          <Text style={styleMessage.lastMessage} numberOfLines={10}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styleMessage.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styleMessage.container}>
        <Text style={styleMessage.mainTitle}>Chat de la Red</Text>

        {/* --- NUEVA ZONA: SELECTOR DE DESTINATARIOS MESH --- */}
        <View
          style={{
            backgroundColor: "#fff",
            borderBottomWidth: 1,
            borderColor: "#eee",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: "#888",
              marginLeft: 15,
              marginTop: 10,
              fontWeight: "bold",
            }}
          >
            DESTINATARIO:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ paddingHorizontal: 10, paddingVertical: 10 }}
          >
            {/* Botón de Broadcast (Todos) */}
            <TouchableOpacity
              onPress={() => setSelectedRecipient("broadcast")}
              style={{
                backgroundColor:
                  selectedRecipient === "broadcast" ? "#2196F3" : "#f0f0f0",
                paddingHorizontal: 15,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 10,
              }}
            >
              <Text
                style={{
                  color: selectedRecipient === "broadcast" ? "#fff" : "#333",
                  fontWeight: "bold",
                }}
              >
                📢 Todos
              </Text>
            </TouchableOpacity>

            {/* Burbujas dinámicas para cada nodo detectado */}
            {meshNodes
              .filter((n) => n.online)
              .map((nodo) => (
                <TouchableOpacity
                  key={nodo.id}
                  onPress={() => setSelectedRecipient(nodo.id)}
                  style={{
                    backgroundColor:
                      selectedRecipient === nodo.id ? "#2196F3" : "#f0f0f0",
                    paddingHorizontal: 15,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 10,
                  }}
                >
                  <Text
                    style={{
                      color: selectedRecipient === nodo.id ? "#fff" : "#333",
                      fontWeight: "bold",
                    }}
                  >
                    👤 {nodo.name}
                  </Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
        {/* -------------------------------------------------- */}

        {/* ZONA DE MENSAJES */}
        {receivedMessages.length === 0 ? (
          <View style={styleMessage.emptyContainer}>
            <Text style={styleMessage.emptyText}>
              Aún no hay mensajes. ¡Di hola!
            </Text>
          </View>
        ) : (
          <FlatList
            data={receivedMessages}
            keyExtractor={(item, index) => item.id || index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styleMessage.listContent}
          />
        )}

        {/* ZONA DE INPUT */}
        <View style={styleMessage.inputContainer}>
          <TextInput
            style={styleMessage.roundedInput}
            placeholder={
              selectedRecipient === "broadcast"
                ? "Escribe a todos..."
                : "Mensaje privado..."
            }
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={styleMessage.sendButton}
            onPress={handleSend}
          >
            <Ionicons
              name="send"
              size={20}
              color="#fff"
              style={styleMessage.sendIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
