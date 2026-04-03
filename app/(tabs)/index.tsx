import React, { useState } from 'react';
import { Button, FlatList, Text, TouchableOpacity, View } from 'react-native';
import base64 from 'react-native-base64';

// 1. Importaciones del Contexto y Librería Bluetooth
import { bleManager, useBluetooth } from '@/context/BluetoothContext';
import { Device } from 'react-native-ble-plx';

// Importamos los estilos desde tu archivo separado
import { styles } from '../../Styles/index';

export default function HomeScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]); 

  // 2. Usamos el Contexto Global
  const { connectedDevice, setConnectedDevice, addMessage } = useBluetooth();

  // Función para escanear dispositivos ESP32
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
      
      // Filtramos para evitar duplicados
      if (device && device.name) {
        setDevices(prev => {
          if (!prev.find(d => d.id === device.id)) return [...prev, device];
          return prev;
        });
      }
    });

    // Detener el escaneo tras 10 segundos
    setTimeout(() => {
      bleManager?.stopDeviceScan();
      setIsScanning(false);
    }, 10000);
  };

  // Función para conectar al dispositivo
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

        // Escuchar mensajes del ESP32
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

  // 3. NUEVA FUNCIÓN: Enviar mensaje al ESP32
  const enviarMensajeAlESP32 = async () => {
    if (!connectedDevice) {
      console.log("No hay dispositivo conectado");
      return;
    }

    try {
      // Preparamos el mensaje y lo codificamos
      const mensaje = "Hola desde React Native!";
      const mensajeBase64 = base64.encode(mensaje);

      // Enviamos el mensaje al ESP32
      await connectedDevice.writeCharacteristicWithResponseForService(
        "4fafc201-1fb5-459e-8fcc-c5c9c331914b", // UUID del Servicio
        "beb5483e-36e1-4688-b7f5-ea07361b26a8", // UUID de la Característica
        mensajeBase64
      );
      
      console.log("Mensaje enviado con éxito");
    } catch (error) {
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
          {/* Interfaz de búsqueda */}
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
        // Interfaz cuando ya hay conexión activa
        <View style={{ marginTop: 20 }}>
          <Text style={{ textAlign: 'center', marginBottom: 20, fontSize: 16, color: '#666' }}>
            ¡Conexión establecida!{"\n"}Ve a la pestaña de Mensajes para ver la actividad.
          </Text>

          {/* NUEVO BOTÓN: Aparece al conectarse */}
          <View style={{ marginBottom: 15 }}>
            <Button 
              title="ENVIAR MENSAJE AL ESP32" 
              color="#28a745" 
              onPress={enviarMensajeAlESP32} 
            />
          </View>

          {/* Botón de desconectar */}
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