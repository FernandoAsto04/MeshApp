import { useBluetooth } from '@/context/BluetoothContext';
import React from 'react';
import { FlatList, Text, View } from 'react-native';
import { styleMessage } from './Styles/messages';

export default function MessagesScreen() {
  const { receivedMessages } = useBluetooth();

  const renderItem = ({ item }: { item: any }) => (
    <View style={styleMessage.chatItem}>
      <View style={styleMessage.avatar}>
        <Text style={styleMessage.avatarText}>{item.sender[0]}</Text>
      </View>
      <View style={styleMessage.chatContent}>
        <View style={styleMessage.chatHeader}>
          <Text style={styleMessage.senderName}>{item.sender}</Text>
          <Text style={styleMessage.timeText}>{item.time}</Text>
        </View>
        <Text style={styleMessage.lastMessage} numberOfLines={1}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={styleMessage.container}>
      <Text style={styleMessage.mainTitle}>Chats</Text>
      {receivedMessages.length === 0 ? (
        <View style={styleMessage.emptyContainer}>
          <Text style={styleMessage.emptyText}>No se tienen chats recientes</Text>
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