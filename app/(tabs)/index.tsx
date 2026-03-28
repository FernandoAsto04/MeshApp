import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, FlatList, TouchableOpacity, TextInput, PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import base64 from 'react-native-base64';

// 1. Inicializamos el Manager fuera del componente para que no se reinicie
const bleManager = new BleManager();

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
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.warn("Permisos denegados");
      return;
    }

    setDevices([]); // Limpiamos la lista anterior
    setIsScanning(true);

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.warn(error);
        setIsScanning(false);
        return;
      }

      // Filtramos para solo guardar dispositivos que tengan nombre y no duplicarlos
      if (device && device.name) {
        setDevices(prevDevices => {
          if (!prevDevices.find(d => d.id === device.id)) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }
    });

    // Detener el escaneo automáticamente después de 10 segundos
    setTimeout(() => {
      bleManager.stopDeviceScan();
      setIsScanning(false);
    }, 10000);
  };

  // 5. Conectar al ESP32
  const connectToDevice = async (device: Device) => {
    try {
      setIsScanning(false);
      bleManager.stopDeviceScan(); // Siempre detener escaneo antes de conectar
      
      console.log(`Conectando a ${device.name}...`);
      const connected = await bleManager.connectToDevice(device.id);
      
      // Descubrir los servicios es OBLIGATORIO antes de enviar/recibir datos
      await connected.discoverAllServicesAndCharacteristics();
      setConnectedDevice(connected);
      console.log("¡Conectado y servicios descubiertos!");

      // Iniciar la escucha de mensajes del ESP32
      startListeningToESP32(connected);

    } catch (error) {
      console.error("Error al conectar:", error);
    }
  };

  // 6. Desconectar
  const disconnectDevice = async () => {
    if (connectedDevice) {
      await bleManager.cancelDeviceConnection(connectedDevice.id);
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
          // Decodificamos el Base64 a texto normal
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
      // Codificamos el texto a Base64 antes de enviarlo
      const base64Message = base64.encode(messageToSend);
      
      await connectedDevice.writeCharacteristicWithResponseForService(
        ESP32_SERVICE_UUID,
        ESP32_CHARACTERISTIC_UUID,
        base64Message
      );
      
      setReceivedMessages(prev => [...prev, `Yo: ${messageToSend}`]);
      setMessageToSend(''); // Limpiar el input
    } catch (error) {
      console.error("Error enviando mensaje:", error);
    }
  };

  // --- RENDERIZADO DE LA INTERFAZ ---

  // Si estamos conectados, mostramos la pantalla de Chat
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

  // Si NO estamos conectados, mostramos la pantalla de Escaneo
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

// Estilos básicos
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 40, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  deviceButton: { backgroundColor: '#fff', padding: 15, marginVertical: 8, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  deviceName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  deviceId: { fontSize: 12, color: '#666', marginTop: 5 },
  chatBox: { flex: 1, backgroundColor: '#fff', marginTop: 20, marginBottom: 20, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd' },
  messageText: { fontSize: 16, marginVertical: 5, color: '#444' },
  inputContainer: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 10, marginRight: 10, backgroundColor: '#fff', color: '#000' }
});