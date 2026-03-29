import Constants from 'expo-constants';
import React, { useState } from 'react';
import { Button, FlatList, PermissionsAndroid, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import base64 from 'react-native-base64';
import { BleManager, Device } from 'react-native-ble-plx';
import { styles } from './Styles/index';

// 1. Inicializamos el Manager AVISÁNDOLE a TypeScript de qué tipo es
let bleManager: BleManager | null = null; // <-- ESTE ES EL GRAN CAMBIO
if (Platform.OS !== 'web' && Constants.appOwnership !== 'expo') {
  bleManager = new BleManager();
}

// 2. UUIDs mágicos: Deben ser EXACTAMENTE los mismos en el código de Arduino (ESP32)
const ESP32_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const ESP32_CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

export default function HomeScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  
  // Estados para los mensajes
  const [messageToSend, setMessageToSend] = useState('');
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);

  // 3. Pedir permisos (Android es estricto con esto)
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) { // Android 12+
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED;
      } else { // Android 11 o menor
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true; // iOS ya lo maneja con el app.json
  };

  // 4. Iniciar Escaneo
  const startScan = async () => {
    if (Platform.OS === 'web' || Constants.appOwnership === 'expo') {
      alert("El escaneo Bluetooth está desactivado en la Web y en Expo Go para evitar errores. ¡Usa tu app nativa en el celular para probar esto!");
      return;
    }

    if (!bleManager) return; 

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.warn("Permisos denegados");
      return;
    }

    setDevices([]); 
    setIsScanning(true);

    // <-- Le agregamos el signo de interrogación aquí también
    bleManager?.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.warn(error);
        setIsScanning(false);
        return;
      }

      if (device && device.name) {
        setDevices(prevDevices => {
          if (!prevDevices.find(d => d.id === device.id)) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }
    });

    setTimeout(() => {
      bleManager?.stopDeviceScan();
      setIsScanning(false);
    }, 10000);
  };

  // 5. Conectar al ESP32
  const connectToDevice = async (device: Device) => {
    try {
      setIsScanning(false);
      bleManager?.stopDeviceScan(); 
      
      console.log(`Conectando a ${device.name}...`);
      const connected = await bleManager?.connectToDevice(device.id);
      
      if (connected) {
        await connected.discoverAllServicesAndCharacteristics();
        setConnectedDevice(connected);
        console.log("¡Conectado y servicios descubiertos!");

        startListeningToESP32(connected);
      }

    } catch (error) {
      console.error("Error al conectar:", error);
    }
  };

  // 6. Desconectar
  const disconnectDevice = async () => {
    if (connectedDevice) {
      await bleManager?.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setReceivedMessages([]);
    }
  };

  // 7. Recibir Mensajes (Suscribirse a notificaciones)
  const startListeningToESP32 = (device: Device) => {
    device.monitorCharacteristicForService(
      ESP32_SERVICE_UUID,
      ESP32_CHARACTERISTIC_UUID,
      (error, characteristic) => {
        if (error) {
          console.error("Error al recibir datos:", error);
          return;
        }
        if (characteristic?.value) {
          const decodedMessage = base64.decode(characteristic.value);
          setReceivedMessages(prev => [...prev, `ESP32: ${decodedMessage}`]);
        }
      }
    );
  };

  // 8. Enviar Mensaje al ESP32
  const sendMessageToESP32 = async () => {
    if (!connectedDevice || !messageToSend) return;

    try {
      const base64Message = base64.encode(messageToSend);
      
      await connectedDevice.writeCharacteristicWithResponseForService(
        ESP32_SERVICE_UUID,
        ESP32_CHARACTERISTIC_UUID,
        base64Message
      );
      
      setReceivedMessages(prev => [...prev, `Yo: ${messageToSend}`]);
      setMessageToSend(''); 
    } catch (error) {
      console.error("Error enviando mensaje:", error);
    }
  };

  // --- RENDERIZADO DE LA INTERFAZ ---
  if (connectedDevice) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Conectado a: {connectedDevice.name}</Text>
        <Button title="Desconectar" color="red" onPress={disconnectDevice} />
        
        <View style={styles.chatBox}>
          <FlatList
            data={receivedMessages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => <Text style={styles.messageText}>{item}</Text>}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribe un comando..."
            value={messageToSend}
            onChangeText={setMessageToSend}
          />
          <Button title="Enviar" onPress={sendMessageToESP32} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buscador de ESP32</Text>
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
    </View>
  );
}