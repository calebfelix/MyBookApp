// screens/ReaderScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import Pdf from 'react-native-pdf';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';

export default function ReaderScreen({ route }) {
  const { book, pdfPath } = route.params; // receive pdfPath from BookDetailsScreen
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(book.totalPages || 0);
  const [loading, setLoading] = useState(true);
  const [nightMode, setNightMode] = useState(true);
  const [renderPage, setRenderPage] = useState(1);
  const [initialPageSet, setInitialPageSet] = useState(false);

  // Bookmarks and slider refs etc.
  const [bookmarkModalVisible, setBookmarkModalVisible] = useState(false);
  const [bookmarkListVisible, setBookmarkListVisible] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [bookmarks, setBookmarks] = useState([]);

  const sliderDragging = useRef(false);
  const storageKey = `${book.id}-lastPage`;
  const bookmarkKey = `${book.id}-bookmarks`;

  useEffect(() => {
    const loadBookmarks = async () => {
      const saved = await AsyncStorage.getItem(bookmarkKey);
      if (saved) {
        setBookmarks(JSON.parse(saved));
      }
    };

    loadBookmarks();

    // Once pdfPath is set, loading is done
    if (pdfPath) {
      setLoading(false);
    }
  }, [book.id, bookmarkKey, pdfPath]);

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
      } catch {}
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

  const addBookmark = async () => {
    if (!bookmarkNote.trim()) {
      Alert.alert('Note Required', 'Please enter a note for the bookmark.');
      return;
    }

    const newBookmark = { page, note: bookmarkNote.trim() };
    const updated = [...bookmarks, newBookmark];
    setBookmarks(updated);
    await AsyncStorage.setItem(bookmarkKey, JSON.stringify(updated));
    setBookmarkNote('');
    setBookmarkModalVisible(false);
  };

  const jumpToBookmark = (p) => {
    setPage(p);
    setRenderPage(p);
    setBookmarkListVisible(false);
  };

  const deleteBookmark = async (index) => {
    Alert.alert(
      'Delete Bookmark',
      'Are you sure you want to delete this bookmark?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = bookmarks.filter((_, i) => i !== index);
            setBookmarks(updated);
            await AsyncStorage.setItem(bookmarkKey, JSON.stringify(updated));
          },
        },
      ]
    );
  };

  if (loading || !pdfPath) {
    return (
      <View style={[styles.container, nightMode && styles.darkBackground, styles.center]}>
        <ActivityIndicator size="large" color="#ff6b6b" />
        <Text style={[styles.loadingText, nightMode && styles.darkText]}>Loading PDF...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, nightMode && styles.darkBackground]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, nightMode && styles.darkText]} numberOfLines={1}>
          {book.title}
        </Text>
        <View style={{ flexDirection: 'row', gap: 15 }}>
          <TouchableOpacity onPress={() => setBookmarkListVisible(true)}>
            <Icon name="bookmark-outline" size={24} color={nightMode ? '#fff' : '#000'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setNightMode(!nightMode)}>
            <Icon
              name={nightMode ? 'white-balance-sunny' : 'weather-night'}
              size={24}
              color={nightMode ? '#fff' : '#000'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* PDF Viewer */}
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

      {/* Page Info & Slider */}
      <View style={[styles.pageControl, { backgroundColor: nightMode ? '#222' : '#eee' }]}>
        <Text style={[styles.pageInfo, { color: nightMode ? '#fff' : '#000', textAlign: 'center' }]}>
          Page {page}
          {totalPages > 0 ? ` / ${totalPages}` : ''}
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

      {/* Floating Bookmark Button */}
      <TouchableOpacity onPress={() => setBookmarkModalVisible(true)} style={styles.floatingButton}>
        <Icon name="bookmark-plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Bookmark Input Modal */}
      <Modal transparent visible={bookmarkModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Bookmark</Text>
            <TextInput
              style={styles.input}
              placeholder="Note (required)"
              placeholderTextColor="#888"
              value={bookmarkNote}
              onChangeText={setBookmarkNote}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setBookmarkModalVisible(false)}>
                <Text style={styles.modalButton}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addBookmark}>
                <Text style={styles.modalButton}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bookmark List Modal */}
      <Modal transparent visible={bookmarkListVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.bookmarkList}>
            <Text style={styles.modalTitle}>Bookmarks</Text>
            {bookmarks.length === 0 ? (
              <Text style={{ color: '#999', fontStyle: 'italic' }}>No bookmarks yet.</Text>
            ) : (
              <FlatList
                data={bookmarks}
                keyExtractor={(item, index) => `${item.page}-${index}`}
                renderItem={({ item, index }) => (
                  <View style={styles.bookmarkRow}>
                    <TouchableOpacity
                      onPress={() => jumpToBookmark(item.page)}
                      style={styles.bookmarkItem}
                    >
                      <Text style={styles.bookmarkText}>
                        Page {item.page} – {item.note}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteBookmark(index)} style={styles.deleteButton}>
                      <Icon name="delete" size={24} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            )}
            <TouchableOpacity onPress={() => setBookmarkListVisible(false)}>
              <Text style={[styles.modalButton, { alignSelf: 'flex-end', marginTop: 10 }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Paste your styles here (same as before)
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
    paddingHorizontal: 10,
    paddingBottom: 30,
  },
  pageInfo: {
    fontSize: 14,
    marginBottom: 10,
  },
  slider: {
    flex: 1,
  },
  loadingText: { marginTop: 10, fontSize: 16, color: '#000' },
  floatingButton: {
    position: 'absolute',
    bottom: 80,
    right: 25,
    backgroundColor: '#ff6b6b',
    borderRadius: 30,
    padding: 16,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: '#000',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  bookmarkList: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  bookmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  bookmarkItem: {
    flex: 1,
    paddingRight: 10,
  },
  bookmarkText: {
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    padding: 4,
  },
});
