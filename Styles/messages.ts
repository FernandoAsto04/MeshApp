import { StyleSheet } from "react-native";

export const styleMessage = StyleSheet.create({
  // --- FALTABAN ESTOS 3 ESTILOS ---
  keyboardContainer: { flex: 1 },
  listContent: { paddingBottom: 20 },
  sendIcon: { marginLeft: 3 }, // Sirve para centrar visualmente el avión de papel
  // --------------------------------

  container: { flex: 1, backgroundColor: "#f5f5f5", paddingTop: 50 },
  mainTitle: {
    fontSize: 30,
    fontWeight: "bold",
    marginLeft: 20,
    marginBottom: 10,
    color: "#333",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: { fontSize: 16, color: "#666", textAlign: "center" },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingBottom: 25,
  },
  roundedInput: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 10,
    color: "#333",
    fontSize: 16,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
  },

  chatItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  chatContent: { flex: 1, marginLeft: 15, justifyContent: "center" },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  senderName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  timeText: { fontSize: 12, color: "#666" },
  lastMessage: { fontSize: 14, color: "#666" },
});
