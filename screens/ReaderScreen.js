import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { WebView } from "react-native-webview";

export default function ReaderScreen({ route }) {
  const { url } = route.params;

  const viewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
    url
  )}`;

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: viewerUrl }}
        style={styles.pdf}
        startInLoadingState={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
  },
});
