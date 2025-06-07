import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Pdf from 'react-native-pdf';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

export default function ReaderScreen({ route }) {
  const { book } = route.params;
  const pdfRef = useRef(null);
  const mountedRef = useRef(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfPath, setPdfPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nightMode, setNightMode] = useState(true);
  const [initialPageSet, setInitialPageSet] = useState(false);

  useEffect(() => {
    mountedRef.current = true;

    const load = async () => {
      const path = `${RNFS.DocumentDirectoryPath}/${book.id}.pdf`;
      try {
        const exists = await RNFS.exists(path);
        if (!exists) {
          setLoading(true);
          await RNFS.downloadFile({ fromUrl: book.url, toFile: path }).promise;
        }
        if (mountedRef.current) {
          setPdfPath(path);
        }
      } catch (e) {
        Alert.alert('Download failed', e.message);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const onLoadComplete = async (numPages) => {
    setTotalPages(numPages);

    try {
      const saved = await AsyncStorage.getItem(`${book.id}-lastPage`);
      if (saved && !initialPageSet && pdfRef.current) {
        const parsed = parseInt(saved, 10);
        setTimeout(() => {
          pdfRef.current.setPage(parsed);
          setPage(parsed);
          setInitialPageSet(true);
        }, 300);
      }
    } catch (e) {
      // Silent fail
    }
  };

  const onPageChanged = async (pageNumber) => {
    setPage(pageNumber);
    await AsyncStorage.setItem(`${book.id}-lastPage`, pageNumber.toString());
  };

  if (loading || !pdfPath) {
    return (
      <View style={[styles.container, nightMode && styles.darkBackground, styles.center]}>
        <ActivityIndicator size="large" color="#ff6b6b" />
        <Text style={[styles.loadingText, nightMode && styles.darkText]}>
          Loading PDF...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, nightMode && styles.darkBackground]}>
      <View style={styles.header}>
        <Text style={[styles.title, nightMode && styles.darkText]} numberOfLines={1}>
          {book.title}
        </Text>
        <TouchableOpacity onPress={() => setNightMode(!nightMode)}>
          <Icon
            name={nightMode ? 'white-balance-sunny' : 'weather-night'}
            size={24}
            color={nightMode ? '#fff' : '#000'}
          />
        </TouchableOpacity>
      </View>

      <Pdf
        ref={pdfRef}
        source={{ uri: `file://${pdfPath}` }}
        onLoadComplete={onLoadComplete}
        onPageChanged={onPageChanged}
        onError={(error) => {
          Alert.alert('PDF Error', error.message);
        }}
        style={styles.pdf}
        enableAnnotationRendering
        enablePaging
      />

      <Text style={[styles.pageInfo, nightMode && styles.darkText]}>
        Page {page}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  darkBackground: { backgroundColor: '#121212' },
  center: { justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  darkText: { color: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    justifyContent: 'space-between',
  },
  pdf: { flex: 1, margin: 10 },
  pageInfo: { textAlign: 'center', padding: 8, fontSize: 14 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#000' },
});
