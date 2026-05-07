import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50, backgroundColor: '#f5f5f5' },
  // Título alineado a la izquierda para mantener consistencia
  title: { fontSize: 30, fontWeight: 'bold', marginBottom: 10, textAlign: 'left', color: '#333' },
  
  // Nuevos estilos para la imagen central y descripción
  imageContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 20 },
  descriptionText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 },
  
  // Botón principal actualizado (Color primario, bordes redondeados)
  primaryButton: { 
    backgroundColor: '#2196F3', // Azul estándar de tu app
    paddingVertical: 15, 
    borderRadius: 25, // Bordes más redondeados
    flexDirection: 'row', // Para poner un ícono junto al texto
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
  
  // Estilos de dispositivos (mantenidos de tu original, ligeramente refinados)
  deviceButton: { backgroundColor: '#fff', padding: 15, marginVertical: 8, borderRadius: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  deviceName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  deviceId: { fontSize: 12, color: '#666', marginTop: 5 },
});