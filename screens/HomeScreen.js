import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

export default function HomeScreen() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const BOOKS_URL =
    "https://raw.githubusercontent.com/calebfelix/MyBookApp/master/data/books.json";

  useEffect(() => {
    fetch(BOOKS_URL)
      .then((res) => res.json())
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load books:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <FlatList
      data={books}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View>
          <Text>{item.title}</Text>
        </View>
      )}
    />
  );
}
