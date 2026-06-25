import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import base64 from "react-native-base64";

import { bleManager, useBluetooth } from "@/context/BluetoothContext";
import { Device } from "react-native-ble-plx";
import { styles } from "../../Styles/index";

export default function HomeScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);

  // Importamos setCurrentNodeName
  const {
    connectedDevice,
    setConnectedDevice,
    addMessage,
    setCurrentNodeName,
  } = useBluetooth();

  const startScan = async () => {
    if (!bleManager) return;
    setDevices([]);
    setIsScanning(true);

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.warn(error);
        setIsScanning(false);
        return;
      }

      if (device && device.name) {
        setDevices((prev) => {
          if (!prev.find((d) => d.id === device.id)) return [...prev, device];
          return prev;
        });
      }
    });

    setTimeout(() => {
      bleManager?.stopDeviceScan();
      setIsScanning(false);
    }, 10000);
  };

  const connectToDevice = async (device: Device) => {
    try {
      setIsScanning(false);
      bleManager?.stopDeviceScan();

      const connected = await bleManager?.connectToDevice(device.id);

      if (connected) {
        await connected.discoverAllServicesAndCharacteristics();

        if (Platform.OS === "android") {
          try {
            await connected.requestMTU(512);
          } catch (mtuError) {
            console.log("No se pudo ampliar MTU");
          }
        }

        setConnectedDevice(connected as Device);
        // --- NUEVO: Guardamos el nombre inicial del nodo apenas nos conectamos ---
        setCurrentNodeName(connected.name || "Nodo Desconocido");

        let mensajeEnPartes = "";

        connected.monitorCharacteristicForService(
          "4fafc201-1fb5-459e-8fcc-c5c9c331914b",
          "beb5483e-36e1-4688-b7f5-ea07361b26a9",
          (error, characteristic) => {
            if (error) return;

            if (characteristic?.value) {
              const trozo = base64.decode(characteristic.value);
              mensajeEnPartes += trozo;

              try {
                const datosCompletos = JSON.parse(mensajeEnPartes);

                if (datosCompletos.type === "message") {
                  addMessage(
                    datosCompletos.from || "Mesh",
                    datosCompletos.text,
                  );
                }
                // --- NUEVO: Escuchamos cuando el ESP32 confirma que se cambió el nombre ---
                else if (datosCompletos.type === "nameUpdated") {
                  setCurrentNodeName(datosCompletos.nodeName); // Actualiza en vivo la app
                  Alert.alert(
                    "¡Nombre Actualizado!",
                    `El nodo ahora se llama: ${datosCompletos.nodeName}.\n\nNota: Puede que necesites reiniciar el ESP32 para que el nuevo nombre aparezca en el escáner Bluetooth.`,
                  );
                }

                mensajeEnPartes = "";
              } catch (e) {}
            }
          },
        );
      }
    } catch (e) {
      console.error("Error al conectar:", e);
    }
  };

  const enviarMensajeAlESP32 = async () => {
    if (!connectedDevice) return;
    try {
      const mensajeGuardado = await SecureStore.getItemAsync("user_mensaje");
      if (!mensajeGuardado || mensajeGuardado.trim() === "") return;

      const payload = {
        cmd: "send",
        text: mensajeGuardado,
        to: "broadcast",
        sos: false,
      };
      const utf8String = unescape(encodeURIComponent(JSON.stringify(payload)));
      const mensajeBase64 = base64.encode(utf8String);

      await connectedDevice.writeCharacteristicWithResponseForService(
        "4fafc201-1fb5-459e-8fcc-c5c9c331914b",
        "beb5483e-36e1-4688-b7f5-ea07361b26a8",
        mensajeBase64,
      );

      addMessage("Yo", mensajeGuardado);
    } catch (error) {
      Alert.alert("Error", "Error al enviar.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {connectedDevice ? "Gestión de Conexión" : "Buscador de Dispositivos"}
      </Text>

      {!connectedDevice ? (
        <>
          {devices.length === 0 && (
            <View style={styles.imageContainer}>
              <Ionicons name="bluetooth-outline" size={120} color="#2196F3" />
              <Text style={styles.descriptionText}>
                *Escanea para encontrar nodos ESP32 en tu área.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, isScanning && styles.buttonDisabled]}
            onPress={startScan}
            disabled={isScanning}
          >
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.buttonText}>
              {isScanning ? "Buscando..." : "Buscar Dispositivos"}
            </Text>
          </TouchableOpacity>

          <FlatList
            data={devices}
            keyExtractor={(item) => item.id}
            style={styles.listContainer}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.deviceButton}
                onPress={() => connectToDevice(item)}
              >
                <Text style={styles.deviceName}>{item.name}</Text>
                <Text style={styles.deviceId}>{item.id}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      ) : (
        <View style={styles.connectedContainer}>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={enviarMensajeAlESP32}
          >
            <Ionicons name="paper-plane" size={20} color="#fff" />
            <Text style={styles.buttonText}>ENVIAR MENSAJE RÁPIDO</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={() => setConnectedDevice(null)}
          >
            <Ionicons name="close-circle" size={20} color="#fff" />
            <Text style={styles.buttonText}>Desconectar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
