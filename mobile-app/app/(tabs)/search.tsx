import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { usePlayer } from "@/context/player-context";
import { Colors } from "@/constants/colors";
import { API_ENDPOINTS, API_BASE_URL } from "@/constants/api";

interface SearchResult {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  cover?: string;
  audioUrl?: string;
}

export default function SearchScreen() {
  const { playTrack } = usePlayer();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      // Search from local database
      const response = await fetch(`${API_ENDPOINTS.music}?type=search&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      // Convert relative URLs to absolute URLs
      const songsWithFullUrls = (data.songs || []).map((song: any) => {
        const cover = song.cover || song.thumbnail || "";
        const audio = song.audioUrl || "";
        
        return {
          id: song.id,
          title: song.title,
          artist: song.artist,
          thumbnail: cover.startsWith("http") ? cover : `${API_BASE_URL}${cover}`,
          audioUrl: audio.startsWith("http") ? audio : `${API_BASE_URL}${audio}`,
        };
      });
      
      setResults(songsWithFullUrls);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = (item: SearchResult) => {
    playTrack({
      id: item.id,
      title: item.title,
      artist: item.artist,
      thumbnail: item.thumbnail,
      audioUrl: item.audioUrl,
    });
  };

  const renderItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => handlePlay(item)}>
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{item.artist}</Text>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name="play" size={20} color={Colors.text} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Cari</Text>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari lagu, artis..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={64} color={Colors.surfaceLight} />
          <Text style={styles.emptyText}>Cari lagu favoritmu</Text>
          <Text style={styles.emptySubtext}>Ketik judul lagu atau nama artis</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginVertical: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    color: Colors.text,
    fontSize: 16,
  },
  resultsList: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 4,
    backgroundColor: Colors.surface,
  },
  info: {
    flex: 1,
  },
  title: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "500",
  },
  artist: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  playButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
});
