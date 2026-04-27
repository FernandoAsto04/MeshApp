import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { Alert, Button, FlatList, Platform, Text, TouchableOpacity, View } from 'react-native';
import base64 from 'react-native-base64';

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
        
        // --- CAMBIO 1: SOLICITAR MTU (Evita el error al enviar) ---
        if (Platform.OS === 'android') {
          try {
            await connected.requestMTU(512);
            console.log("MTU ampliado a 512 bytes.");
          } catch (mtuError) {
            console.log("No se pudo ampliar MTU:", mtuError);
          }
        }

        setConnectedDevice(connected as Device);
        console.log("¡Conexión exitosa!");

        // --- CAMBIO 2: LÓGICA DE RECEPCIÓN (Buffer para unir pedazos) ---
        let mensajeEnPartes = ""; 

        connected.monitorCharacteristicForService(
          "4fafc201-1fb5-459e-8fcc-c5c9c331914b",
          "beb5483e-36e1-4688-b7f5-ea07361b26a9", // <-- UUID RX TERMINADO EN 9
          (error, characteristic) => {
            if (error) {
              console.error("Error en el monitoreo:", error);
              return;
            }
            if (characteristic?.value) {
              const trozo = base64.decode(characteristic.value);
              mensajeEnPartes += trozo;

              try {
                // Intentamos parsear. Si falla, es que el mensaje aún no llega completo.
                const datosCompletos = JSON.parse(mensajeEnPartes);

                if (datosCompletos.type === "message") {
                  addMessage(datosCompletos.from || "Mesh", datosCompletos.text);
                }
                
                // Si el parseo fue exitoso, limpiamos para el siguiente mensaje
                mensajeEnPartes = "";

              } catch (e) {
                // El JSON sigue incompleto, esperamos el siguiente pedazo
              }
            }
          }
        );
      }
    } catch (e) {
      console.error("Error al conectar:", e);
    }
  };

  const enviarMensajeAlESP32 = async () => {
    if (!connectedDevice) {
      Alert.alert("Error", "No hay dispositivo conectado.");
      return;
    }

    try {
      const mensajeGuardado = await SecureStore.getItemAsync('user_mensaje');

      if (!mensajeGuardado || mensajeGuardado.trim() === '') {
        Alert.alert('Aviso', 'Configura un mensaje en ajustes.');
        return;
      }

      // --- CAMBIO 3: ENVIAR COMO JSON (Estructura Mesh) ---
      const payload = {
        cmd: "send",
        text: mensajeGuardado,
        to: "broadcast", 
        sos: false
      };

      const jsonString = JSON.stringify(payload);
      const mensajeBase64 = base64.encode(jsonString);

      await connectedDevice.writeCharacteristicWithResponseForService(
        "4fafc201-1fb5-459e-8fcc-c5c9c331914b", 
        "beb5483e-36e1-4688-b7f5-ea07361b26a8", // <-- UUID TX SE QUEDA EN 8
        mensajeBase64
      );
      
      Alert.alert("¡Enviado!", `Mensaje enviado: "${mensajeGuardado}"`);
      addMessage("Yo", mensajeGuardado);

    } catch (error) {
      Alert.alert("Error", "Error al enviar. Intenta reconectar.");
      console.error("Error detallado:", error);
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