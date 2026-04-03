import { StyleSheet } from 'react-native';
// Estilos básicos
export const styles = StyleSheet.create({
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

