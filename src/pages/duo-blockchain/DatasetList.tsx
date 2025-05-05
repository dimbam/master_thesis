import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DatasetList({ navigation }) {
  const [datasets, setDatasets] = useState<any[]>([]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', load);
    return unsub;
  }, [navigation]);

  async function load() {
    const json = await AsyncStorage.getItem('datasets');
    if (json) setDatasets(JSON.parse(json));
  }

  return (
    <View style={styles.container}>
      <Button title="Create New Dataset" onPress={() => navigation.navigate('Create')} />
      <FlatList
        data={datasets}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Detail', item)}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.codes}>Permissions: {item.duoCodes.join(', ')}</Text>
            {item.metadata?.disease && (
              <Text style={styles.codes}>Disease constraint: {item.metadata.disease}</Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  title: { fontSize: 18 },
  codes: { color: '#666', marginTop: 4 },
});
