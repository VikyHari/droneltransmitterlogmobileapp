import React from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';

const MessageViewer = ({ messages }) => {
  return (
    <FlatList
      data={messages}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text style={styles.text}>{item.name}</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  item: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  text: {
    color: 'black',
  },
});

export default MessageViewer;
