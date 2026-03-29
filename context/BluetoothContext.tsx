import Constants from 'expo-constants';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { Platform } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

// Tipo para nuestros mensajes estilo WhatsApp
export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
}

interface BluetoothContextType {
  receivedMessages: ChatMessage[];
  connectedDevice: Device | null;
  setConnectedDevice: (device: Device | null) => void;
  addMessage: (sender: string, text: string) => void;
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined);

// Inicializamos el manager una sola vez aquí
let bleManager: BleManager | null = null;
if (Platform.OS !== 'web' && Constants.appOwnership !== 'expo') {
  bleManager = new BleManager();
}

export const BluetoothProvider = ({ children }: { children: ReactNode }) => {
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [receivedMessages, setReceivedMessages] = useState<ChatMessage[]>([]);

  const addMessage = (sender: string, text: string) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(),
      sender,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setReceivedMessages((prev) => [newMessage, ...prev]); // Los nuevos arriba
  };

  return (
    <BluetoothContext.Provider value={{ receivedMessages, connectedDevice, setConnectedDevice, addMessage }}>
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth = () => {
  const context = useContext(BluetoothContext);
  if (!context) throw new Error("useBluetooth debe usarse dentro de BluetoothProvider");
  return context;
};

export { bleManager }; // Lo exportamos para que index.tsx lo use
