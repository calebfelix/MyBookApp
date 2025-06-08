import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Pdf from 'react-native-pdf';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import Slider from '@react-native-community/slider';

export default function ReaderScreen({ route }) {
  const { book } = route.params;
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(book.totalPages || 0);
  const [pdfPath, setPdfPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nightMode, setNightMode] = useState(true);
  const [renderPage, setRenderPage] = useState(1);
  const [initialPageSet, setInitialPageSet] = useState(false);

  const sliderDragging = useRef(false);
  const storageKey = `${book.id}-lastPage`;

  useEffect(() => {
    const loadPdf = async () => {
      const path = `${RNFS.DocumentDirectoryPath}/${book.id}.pdf`;
      try {
        const exists = await RNFS.exists(path);
        if (!exists) {
          await RNFS.downloadFile({ fromUrl: book.url, toFile: path }).promise;
        }
        setPdfPath(path);
      } catch (e) {
        Alert.alert('Download failed', e.message);
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, [book.id, book.url]);

  const onLoadComplete = async (numberOfPages) => {
    setTotalPages(numberOfPages);
    if (!initialPageSet) {
      try {
        const saved = await AsyncStorage.getItem(storageKey);
        if (saved) {
          const parsed = parseInt(saved, 10);
          setPage(parsed);
          setRenderPage(parsed);
        }
      } catch {
        // Ignore
      }
      setInitialPageSet(true);
    }
  };

  const onPageChanged = async (pageNumber) => {
    if (!sliderDragging.current) {
      setPage(pageNumber);
      await AsyncStorage.setItem(storageKey, pageNumber.toString());
    }
  };

  const onSliderValueChange = (value) => {
    sliderDragging.current = true;
    setPage(Math.round(value));
  };

  const onSliderComplete = (value) => {
    const pageNum = Math.round(value);
    sliderDragging.current = false;
    setPage(pageNum);
    setRenderPage(pageNum);
    AsyncStorage.setItem(storageKey, pageNum.toString());
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
        key={`${pdfPath}-${renderPage}`}
        source={{ uri: `file://${pdfPath}` }}
        page={renderPage}
        onLoadComplete={onLoadComplete}
        onPageChanged={onPageChanged}
        onError={(error) => Alert.alert('PDF Error', error.message)}
        style={styles.pdf}
        enableAnnotationRendering
        enablePaging
        fitPolicy={0}
        horizontal
      />

      <View
        style={[
          styles.pageControl,
          { backgroundColor: nightMode ? '#222' : '#eee' },
        ]}
      >
        <Text style={[styles.pageInfo, { color: nightMode ? '#fff' : '#000' }]}>
          Page {page}{totalPages > 0 ? ` / ${totalPages}` : ''}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={totalPages > 0 ? totalPages : 10}
          step={1}
          value={page}
          minimumTrackTintColor="#ff6b6b"
          maximumTrackTintColor={nightMode ? '#555' : '#ccc'}
          thumbTintColor="#ff6b6b"
          onValueChange={onSliderValueChange}
          onSlidingComplete={onSliderComplete}
        />
      </View>
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
  pdf: {
    flex: 1,
    margin: 10,
    marginBottom: 0,
  },
  pageControl: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 40,
  },
  pageInfo: {
    fontSize: 14,
    marginRight: 10,
  },
  slider: {
    flex: 1,
  },
  loadingText: { marginTop: 10, fontSize: 16, color: '#000' },
});
