import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function ReaderScreen({ route }) {
  const { book } = route.params;

  const googleViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
    book.url
  )}`;

  return (
    <View style={styles.container}>
      <WebView source={{ uri: googleViewerUrl }} style={styles.webview} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  webview: {
    flex: 1,
  },
});
