import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  Alert,
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
import { styleConfig } from "../../Styles/config";

export default function ConfigScreen() {
  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [celular, setCelular] = useState("");
  const [mensaje, setMensaje] = useState("");

  const { connectedDevice, currentNodeName } = useBluetooth();
  const [nuevoNombreNodo, setNuevoNombreNodo] = useState("");

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedName = await SecureStore.getItemAsync("user_name");
        const savedDni = await SecureStore.getItemAsync("user_dni");
        const savedCelular = await SecureStore.getItemAsync("user_celular");
        const savedMensaje = await SecureStore.getItemAsync("user_mensaje");

        if (savedName) setNombre(savedName);
        if (savedDni) setDni(savedDni);
        if (savedCelular) setCelular(savedCelular);
        if (savedMensaje) setMensaje(savedMensaje);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };
    loadSavedData();
  }, []);

  const handleSaveAll = async () => {
    if (nombre.trim() === "") {
      Alert.alert("Ojo", "El nombre no puede estar vacío.");
      return;
    }
    try {
      await SecureStore.setItemAsync("user_name", nombre);
      await SecureStore.setItemAsync("user_dni", dni);
      await SecureStore.setItemAsync("user_celular", celular);
      await SecureStore.setItemAsync("user_mensaje", mensaje);

      Alert.alert("¡Éxito!", "Tus datos de usuario han sido guardados.");
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al guardar tus datos.");
    }
  };

  const cambiarNombreNodo = async () => {
    if (!connectedDevice) return;

    if (!nuevoNombreNodo.trim()) {
      Alert.alert("Aviso", "Escribe un nombre válido para el nodo.");
      return;
    }

    try {
      const payload = {
        cmd: "setName",
        name: nuevoNombreNodo.trim(),
      };

      const jsonString = JSON.stringify(payload);
      const utf8String = unescape(encodeURIComponent(jsonString));
      const mensajeBase64 = base64.encode(utf8String);

      await connectedDevice.writeCharacteristicWithResponseForService(
        "4fafc201-1fb5-459e-8fcc-c5c9c331914b",
        "beb5483e-36e1-4688-b7f5-ea07361b26a8",
        mensajeBase64,
      );

      setNuevoNombreNodo("");
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo comunicar con el nodo para cambiar el nombre.",
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styleConfig.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styleConfig.headerTitle}>Ajustes del Sistema</Text>

        <View style={styleConfig.card}>
          <View style={styleConfig.sectionHeader}>
            <Ionicons name="hardware-chip" size={16} color="#555" />
            <Text style={styleConfig.sectionTitle}>Módulo ESP32</Text>
          </View>

          {!connectedDevice ? (
            <Text style={styleConfig.warningText}>
              ⚠️ Conéctate a un dispositivo en Inicio para ver y editar su
              nombre.
            </Text>
          ) : (
            <View>
              <Text style={styleConfig.nodeCurrentNameText}>
                Nombre actual:{" "}
                <Text style={styleConfig.nodeNameHighlight}>
                  {currentNodeName}
                </Text>
              </Text>

              <View style={styleConfig.labelContainer}>
                <Ionicons
                  name="pencil-outline"
                  size={16}
                  color="#666"
                  style={styleConfig.labelIcon}
                />
                <Text style={styleConfig.label}>Cambiar nombre del nodo:</Text>
              </View>

              <View style={styleConfig.rowInputContainer}>
                <TextInput
                  style={[styleConfig.input, styleConfig.flexInput]}
                  placeholder="Ej: Fernando"
                  placeholderTextColor="#999"
                  value={nuevoNombreNodo}
                  onChangeText={setNuevoNombreNodo}
                  maxLength={20}
                />
                <TouchableOpacity
                  style={styleConfig.iconButton}
                  onPress={cambiarNombreNodo}
                >
                  <Ionicons name="save-outline" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styleConfig.card}>
          <View style={styleConfig.sectionHeader}>
            <Ionicons name="person" size={16} color="#555" />
            <Text style={styleConfig.sectionTitle}>Perfil de Usuario</Text>
          </View>

          <View style={styleConfig.labelContainer}>
            <Ionicons
              name="person-outline"
              size={16}
              color="#666"
              style={styleConfig.labelIcon}
            />
            <Text style={styleConfig.label}>Nombre:</Text>
          </View>
          <TextInput
            style={styleConfig.input}
            placeholder="Escribe tu nombre..."
            placeholderTextColor="#999"
            value={nombre}
            onChangeText={setNombre}
            maxLength={30}
          />

          <View style={styleConfig.labelContainer}>
            <Ionicons
              name="card-outline"
              size={16}
              color="#666"
              style={styleConfig.labelIcon}
            />
            <Text style={styleConfig.label}>DNI:</Text>
          </View>
          <TextInput
            style={styleConfig.input}
            placeholder="Ej: 12345678"
            placeholderTextColor="#999"
            value={dni}
            onChangeText={setDni}
            keyboardType="numeric"
            maxLength={8}
          />

          <View style={styleConfig.labelContainer}>
            <Ionicons
              name="call-outline"
              size={16}
              color="#666"
              style={styleConfig.labelIcon}
            />
            <Text style={styleConfig.label}>Celular:</Text>
          </View>
          <TextInput
            style={styleConfig.input}
            placeholder="Ej: 987654321"
            placeholderTextColor="#999"
            value={celular}
            onChangeText={setCelular}
            keyboardType="numeric"
            maxLength={9}
          />
        </View>

        <View style={styleConfig.card}>
          <View style={styleConfig.sectionHeader}>
            <Ionicons name="settings" size={16} color="#555" />
            <Text style={styleConfig.sectionTitle}>Opciones Adicionales</Text>
          </View>

          <View style={styleConfig.labelContainer}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={16}
              color="#666"
              style={styleConfig.labelIcon}
            />
            <Text style={styleConfig.label}>Mensaje Rápido:</Text>
          </View>
          <TextInput
            style={styleConfig.input}
            placeholder="Ej: Necesito ayuda urgente..."
            placeholderTextColor="#999"
            value={mensaje}
            onChangeText={setMensaje}
            maxLength={100}
            multiline={true}
          />
        </View>

        <TouchableOpacity
          style={styleConfig.saveButton}
          onPress={handleSaveAll}
        >
          <Text style={styleConfig.saveButtonText}>
            ✓ Guardar Cambios de Usuario
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
