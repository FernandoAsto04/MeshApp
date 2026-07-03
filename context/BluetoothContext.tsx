import Constants from "expo-constants";
import React, { createContext, ReactNode, useContext, useState } from "react";
import { Platform } from "react-native";
import { BleManager, Device } from "react-native-ble-plx";

// Interfaz para los mensajes del chat
export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
}

// --- NUEVO: Interfaz para representar un nodo dentro de la red Mesh ---
export interface MeshNode {
  id: string; // Identificador único del nodo (puede ser su dirección MAC o ChipID)
  name: string; // Nombre asignado al nodo (ej: "Nodo_Fernando")
  hops: number; // Cantidad de saltos de distancia (1 = vecino directo, 2 o más = multisalto)
}

interface BluetoothContextType {
  receivedMessages: ChatMessage[];
  connectedDevice: Device | null;
  setConnectedDevice: (device: Device | null) => void;
  addMessage: (sender: string, text: string) => void;
  currentNodeName: string;
  setCurrentNodeName: (name: string) => void;

  // --- NUEVO: Estado global para la topología de la red Mesh ---
  networkNodes: MeshNode[];
  setNetworkNodes: (nodes: MeshNode[]) => void;
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

  // --- NUEVO: Estado para guardar los nodos activos detectados por el ESP32 ---
  const [networkNodes, setNetworkNodes] = useState<MeshNode[]>([]);

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
        // --- NUEVO: Exportamos el estado de los nodos de la red ---
        networkNodes,
        setNetworkNodes,
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

