import React, { useState } from 'react';
import { Alert, Button, FlatList, Text, TouchableOpacity, View } from 'react-native';
import base64 from 'react-native-base64';
// 1. Importamos SecureStore para poder leer el mensaje guardado
import * as SecureStore from 'expo-secure-store';

import { bleManager, useBluetooth } from '@/context/BluetoothContext';
import { Device } from 'react-native-ble-plx';
import { styles } from '../../Styles/index';

export default function HomeScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]); 
  const { connectedDevice, setConnectedDevice, addMessage } = useBluetooth();

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
        setDevices(prev => {
          if (!prev.find(d => d.id === device.id)) return [...prev, device];
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
      
      console.log(`Intentando conectar a ${device.name}...`);
      const connected = await bleManager?.connectToDevice(device.id);
      
      if (connected) {
        await connected.discoverAllServicesAndCharacteristics();
        setConnectedDevice(connected as Device);
        console.log("¡Conexión exitosa!");

        connected.monitorCharacteristicForService(
          "4fafc201-1fb5-459e-8fcc-c5c9c331914b",
          "beb5483e-36e1-4688-b7f5-ea07361b26a8",
          (error, characteristic) => {
            if (error) {
              console.error("Error en el monitoreo:", error);
              return;
            }
            if (characteristic?.value) {
              const decoded = base64.decode(characteristic.value);
              addMessage(device.name || "ESP32", decoded);
            }
          }
        );
      }
    } catch (e) {
      console.error("Error al conectar:", e);
    }
  };

  // 2. FUNCIÓN ACTUALIZADA: Lee el SecureStore, arma el JSON y envía
  const enviarMensajeAlESP32 = async () => {
    if (!connectedDevice) {
      Alert.alert("Error", "No hay dispositivo conectado.");
      return;
    }

    try {
      // Recuperamos el mensaje que guardaste en la pantalla de configuración
      const mensajeGuardado = await SecureStore.getItemAsync('user_mensaje');

      // Validamos si existe o si está vacío
      if (!mensajeGuardado || mensajeGuardado.trim() === '') {
        Alert.alert('Aviso', 'No has configurado un "Mensaje Rápido" en los ajustes.');
        return;
      }

      // --- SOLUCIÓN APLICADA AQUÍ ---
      // 1. Armamos el objeto JSON exacto que espera recibir tu ESP32
      const payload = {
        cmd: "send",
        text: mensajeGuardado,
        to: "broadcast", 
        sos: false
      };

      // 2. Convertimos el objeto JSON a una cadena de texto
      const jsonString = JSON.stringify(payload);

      // 3. Codificamos esa cadena de texto a Base64
      const mensajeBase64 = base64.encode(jsonString);
      // ------------------------------

      // Enviamos el mensaje al ESP32
      await connectedDevice.writeCharacteristicWithResponseForService(
        "4fafc201-1fb5-459e-8fcc-c5c9c331914b", 
        "beb5483e-36e1-4688-b7f5-ea07361b26a8", 
        mensajeBase64
      );
      
      Alert.alert("¡Enviado!", `Mensaje enviado a la Mesh: "${mensajeGuardado}"`);
      console.log("JSON enviado con éxito:", jsonString);
      
      // Añadimos el mensaje a nuestra propia pantalla de chats para verlo
      addMessage("Yo", mensajeGuardado);

    } catch (error) {
      Alert.alert("Error", "Hubo un problema al enviar el mensaje.");
      console.error("Error enviando el mensaje:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {connectedDevice ? `Conectado a ${connectedDevice.name}` : "Buscador de ESP32"}
      </Text>

      {!connectedDevice ? (
        <>
          <Button 
            title={isScanning ? "Buscando..." : "Buscar Dispositivos"} 
            onPress={startScan} 
            disabled={isScanning} 
          />
          
          <FlatList
            data={devices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.deviceButton} onPress={() => connectToDevice(item)}>
                <Text style={styles.deviceName}>{item.name}</Text>
                <Text style={styles.deviceId}>{item.id}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      ) : (
        <View style={{ marginTop: 20 }}>
          <Text style={{ textAlign: 'center', marginBottom: 20, fontSize: 16, color: '#666' }}>
            ¡Conexión establecida!{"\n"}Ve a la pestaña de Mensajes para ver la actividad.
          </Text>

          <View style={{ marginBottom: 15 }}>
            <Button 
              title="ENVIAR MENSAJE RÁPIDO" 
              color="#28a745" 
              onPress={enviarMensajeAlESP32} 
            />
          </View>

          <Button 
            title="Desconectar" 
            color="red" 
            onPress={() => setConnectedDevice(null)} 
          />
        </View>
      )}
    </View>
  );
}