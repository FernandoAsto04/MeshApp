import Constants from "expo-constants";
import React, { createContext, ReactNode, useContext, useState } from "react";
import { Platform } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
}

// Estructura que coincide con lo que envía el ESP32
export interface MeshNode {
  index: number;
  id: string;
  name: string;
  online: boolean;
  rssi: number;
  snr: number;
  lastSeenMsAgo: number;
}

interface BluetoothContextType {
  receivedMessages: ChatMessage[];
  connectedDevice: Device | null;
  setConnectedDevice: (device: Device | null) => void;
  addMessage: (sender: string, text: string) => void;
  currentNodeName: string;
  setCurrentNodeName: (name: string) => void;

  // NUEVO: Estados para la red Mesh
  meshNodes: MeshNode[];
  setMeshNodes: (nodes: MeshNode[]) => void;
  selectedRecipient: string;
  setSelectedRecipient: (id: string) => void;
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(
  undefined,
);

let bleManager: BleManager | null = null;
if (Platform.OS !== "web" && Constants.appOwnership !== "expo") {
  bleManager = new BleManager();
}

export const BluetoothProvider = ({ children }: { children: ReactNode }) => {
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [receivedMessages, setReceivedMessages] = useState<ChatMessage[]>([]);
  const [currentNodeName, setCurrentNodeName] = useState<string>("Desconocido");

  // NUEVO: Inicializamos la tabla de nodos vacía y el destino por defecto a broadcast
  const [meshNodes, setMeshNodes] = useState<MeshNode[]>([]);
  const [selectedRecipient, setSelectedRecipient] =
    useState<string>("broadcast");

  const addMessage = (sender: string, text: string) => {
    const newMessage: ChatMessage = {
      id: Math.random().toString(),
      sender,
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setReceivedMessages((prev) => [newMessage, ...prev]);
  };

  return (
    <BluetoothContext.Provider
      value={{
        receivedMessages,
        connectedDevice,
        setConnectedDevice,
        addMessage,
        currentNodeName,
        setCurrentNodeName,
        meshNodes,
        setMeshNodes,
        selectedRecipient,
        setSelectedRecipient,
      }}
    >
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth = () => {
  const context = useContext(BluetoothContext);
  if (!context)
    throw new Error("useBluetooth debe usarse dentro de BluetoothProvider");
  return context;
};

export { bleManager };

