import { StyleSheet } from "react-native";

export const styleMessage = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 50 },
  // Título igual que en index.ts
  mainTitle: { fontSize: 30, fontWeight: 'bold', marginLeft: 20, marginBottom: 10, color: '#333' },
  
  // Contenedor de estado vacío
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center' },
  
  // Nueva zona de input (más moderna)
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15, 
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingBottom: 25 // Margen inferior para no chocar con la barra de navegación
  },
  roundedInput: { 
    flex: 1, 
    backgroundColor: '#f0f0f0', // Fondo gris claro en lugar de borde
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    borderRadius: 25, 
    marginRight: 10, 
    color: '#333',
    fontSize: 16
  },
  sendButton: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: '#2196F3', // Azul estándar
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  
  // Mantenemos tus estilos de lista de chats
  chatItem: { flexDirection: 'row', padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#ddd', backgroundColor: '#fff' },
  avatar: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#2196F3', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  chatContent: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  senderName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  timeText: { fontSize: 12, color: '#666' },
  lastMessage: { fontSize: 14, color: '#666' },
});