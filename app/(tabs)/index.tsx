import React, { useState } from 'react';
import { Button, FlatList, Text, TouchableOpacity, View } from 'react-native';
import base64 from 'react-native-base64';

// 1. IMPORTANTE: Agregamos 'Device' a la importación de la librería de Bluetooth
import { bleManager, useBluetooth } from '@/context/BluetoothContext';
import { Device } from 'react-native-ble-plx'; // <-- Esta es la pieza que faltaba

// Importamos los estilos desde tu archivo separado
import { styles } from './Styles/index';

export default function HomeScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]); // Tipado correcto para la lista de dispositivos

  // 2. Usamos el "Cerebro Central" (Contexto Global)
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
      
      // Filtramos para guardar solo dispositivos con nombre y evitar duplicados
      if (device && device.name) {
        setDevices(prev => {
          if (!prev.find(d => d.id === device.id)) return [...prev, device];
          return prev;
        });
      }
    });

    // Detener el escaneo automáticamente tras 10 segundos
    setTimeout(() => {
      bleManager?.stopDeviceScan();
      setIsScanning(false);
    }, 10000);
  };

  // Función para conectar al dispositivo seleccionado
  const connectToDevice = async (device: Device) => {
    try {
      setIsScanning(false);
      bleManager?.stopDeviceScan();
      
      console.log(`Intentando conectar a ${device.name}...`);
      const connected = await bleManager?.connectToDevice(device.id);
      
      if (connected) {
        // El descubrimiento de servicios es vital para poder leer/escribir datos
        await connected.discoverAllServicesAndCharacteristics();
        
        // Guardamos la conexión en el contexto global (con el 'as Device' para TypeScript)
        setConnectedDevice(connected as Device);
        console.log("¡Conexión exitosa!");

        // 3. ESCUCHA ACTIVA: Configuramos la suscripción a los mensajes del ESP32
        connected.monitorCharacteristicForService(
          "4fafc201-1fb5-459e-8fcc-c5c9c331914b",
          "beb5483e-36e1-4688-b7f5-ea07361b26a8",
          (error, characteristic) => {
            if (error) {
              console.error("Error en el monitoreo:", error);
              return;
            }
            if (characteristic?.value) {
              // Decodificamos el mensaje que viene en Base64
              const decoded = base64.decode(characteristic.value);
              
              // Enviamos el mensaje al contexto global para que aparezca en 'messages.tsx'
              addMessage(device.name || "ESP32", decoded);
            }
          }
        );
      }
    } catch (e) {
      console.error("Error al conectar:", e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {connectedDevice ? `Conectado a ${connectedDevice.name}` : "Buscador de ESP32"}
      </Text>

      {!connectedDevice ? (
        <>
          {/* Botón de escaneo */}
          <Button 
            title={isScanning ? "Buscando..." : "Buscar Dispositivos"} 
            onPress={startScan} 
            disabled={isScanning} 
          />
          
          {/* Lista de dispositivos encontrados */}
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
        // Interfaz cuando ya hay una conexión activa
        <View style={{ marginTop: 20 }}>
          <Text style={{ textAlign: 'center', marginBottom: 20, fontSize: 16, color: '#666' }}>
            ¡Conexión establecida!{"\n"}Ve a la pestaña de Mensajes para ver la actividad.
          </Text>
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