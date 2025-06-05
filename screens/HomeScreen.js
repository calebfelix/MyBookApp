import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

// ✅ Load books.json locally
import booksData from "../data/books.json";

export default function HomeScreen() {
  const [searchText, setSearchText] = useState("");
  const navigation = useNavigation();

  const filteredBooks = booksData.filter((book) =>
    book.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderBook = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("Reader", { url: item.url })}
    >
      {item.cover && (
        <Image source={{ uri: item.cover }} style={styles.coverImage} />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.author}>{item.author}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search books..."
        placeholderTextColor="#888"
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchBar}
      />
      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        renderItem={renderBook}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: "#121212",
  },
  searchBar: {
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#333",
    backgroundColor: "#1e1e1e",
    color: "#fff",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
    marginBottom: 12,
    padding: 10,
    elevation: 2,
  },
  coverImage: {
    width: 60,
    height: 90,
    marginRight: 12,
    borderRadius: 6,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  author: {
    fontSize: 14,
    color: "#aaa",
  },
  description: {
    fontSize: 12,
    color: "#ccc",
  },
});
