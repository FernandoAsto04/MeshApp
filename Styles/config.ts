import { StyleSheet } from "react-native";

export const styleConfig = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', paddingTop: 50 },
  // Título estandarizado
  headerTitle: { fontSize: 30, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'left' },
  
  card: { backgroundColor: '#fff', borderRadius: 15, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, marginBottom: 20 },
  
  // Subtítulos en gris oscuro en lugar de azul (reduce fatiga visual)
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  
  // Contenedor para poner un ícono junto al texto del label (opcional)
  labelContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 5 },
  label: { fontSize: 14, color: '#666', fontWeight: '500' },
  
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: '#fafafa', color: '#333', marginBottom: 15 },
  
  // Botón estandarizado
  saveButton: { 
    backgroundColor: '#2196F3', 
    paddingVertical: 15, 
    borderRadius: 25, 
    alignItems: 'center', 
    marginTop: 10,
    marginBottom: 30 // Espacio para que no choque con el menú de abajo
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});