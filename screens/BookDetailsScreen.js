// screens/BookDetailsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import RNFS from 'react-native-fs';

export default function BookDetailsScreen({ route, navigation }) {
  const { book } = route.params;
  const [downloading, setDownloading] = useState(false);
  const [pdfPath, setPdfPath] = useState(null);

  const downloadPdf = async () => {
    const path = `${RNFS.DocumentDirectoryPath}/${book.id}.pdf`;
    setDownloading(true);
    try {
      const exists = await RNFS.exists(path);
      if (!exists) {
        await RNFS.downloadFile({ fromUrl: book.url, toFile: path }).promise;
      }
      setPdfPath(path);
      navigation.navigate('Reader', { book, pdfPath: path });
    } catch (e) {
      Alert.alert('Download failed', e.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: book.cover }} style={styles.cover} />
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>by {book.author}</Text>
      <Text style={styles.description}>{book.description}</Text>

      <TouchableOpacity
        style={[styles.button, downloading && { backgroundColor: '#999' }]}
        onPress={downloadPdf}
        disabled={downloading}
      >
        {downloading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Start Reading</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  cover: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  author: {
    fontSize: 18,
    color: '#bbb',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#ddd',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
