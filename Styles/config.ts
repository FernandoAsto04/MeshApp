import { StyleSheet } from "react-native";

export const styleConfig = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "left",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },

  // --- CABECERAS DE SECCIÓN ---
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: 8, // Separación con el ícono
  },

  // --- ETIQUETAS (LABELS) ---
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 5,
  },
  labelIcon: { marginRight: 6 },
  label: { fontSize: 14, color: "#666", fontWeight: "500" },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
    color: "#333",
    marginBottom: 15,
  },

  // --- ESTILOS NUEVOS PARA EL RENOMBRADO DEL NODO ---
  warningText: {
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 10,
  },
  nodeCurrentNameText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
    fontWeight: "500",
  },
  nodeNameHighlight: {
    color: "#2196F3",
    fontWeight: "bold",
  },
  rowInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  flexInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 10,
  },
  iconButton: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  // --- BOTÓN FINAL ---
  saveButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
