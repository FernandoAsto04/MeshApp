import { useBluetooth } from '@/context/BluetoothContext';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function MessagesScreen() {
  const { receivedMessages } = useBluetooth();

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.chatItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.sender[0]}</Text>
      </View>
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.senderName}>{item.sender}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.mainTitle}>Chats</Text>
      {receivedMessages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No se tienen chats recientes</Text>
        </View>
      ) : (
        <FlatList
          data={receivedMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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