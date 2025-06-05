import React from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

export default function ReaderScreen({ route }) {
  const { url } = route.params;

  // Wrap the PDF URL with Google Docs Viewer
  const viewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
    url
  )}`;

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: viewerUrl }}
        style={styles.webview}
        originWhitelist={["*"]}
        useWebKit
        allowsFullscreenVideo
        javaScriptEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  webview: {
    flex: 1,
  },
});
