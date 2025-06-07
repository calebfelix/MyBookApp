import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Pdf from 'react-native-pdf';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ReaderScreen({ route }) {
  const { book } = route.params;
  const pdfRef = useRef(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [nightMode, setNightMode] = useState(true);

  useEffect(() => {
    (async () => {
      const lastPage = await AsyncStorage.getItem(`${book.id}-lastPage`);
      if (lastPage && pdfRef.current) {
        pdfRef.current.setPage(parseInt(lastPage, 10));
      }
    })();
  }, []);

  const onPageChanged = async (pageNumber) => {
    setPage(pageNumber);
    await AsyncStorage.setItem(`${book.id}-lastPage`, pageNumber.toString());
  };

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
        source={{ uri: book.url }}
        onLoadComplete={(numPages) => setTotalPages(numPages)}
        onPageChanged={onPageChanged}
        onError={(error) => Alert.alert('PDF error', error.message)}
        style={styles.pdf}
        enablePaging
        enableAnnotationRendering
        trustAllCerts={false} // Optional, default is false. Can try true only if using self-signed certs.
      />

      <Text style={[styles.pageInfo, nightMode && styles.darkText]}>
        Page {page}
         {/* / {totalPages} */}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  darkBackground: { backgroundColor: '#121212' },
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
});
