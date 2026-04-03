import { StyleSheet } from "react-native";

export const styleMessage = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  mainTitle: { fontSize: 30, fontWeight: 'bold', marginLeft: 20, marginBottom: 10 },
  chatItem: { flexDirection: 'row', padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  avatar: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#075E54', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  chatContent: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  senderName: { fontSize: 16, fontWeight: 'bold' },
  timeText: { fontSize: 12, color: '#666' },
  lastMessage: { fontSize: 14, color: '#666' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999' }
});